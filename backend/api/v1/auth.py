import hashlib
import hmac
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional, TypeVar

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from ninja import Router, Schema
from ninja.errors import HttpError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import UserProfile

User = get_user_model()
router = Router(tags=["Auth"])


class LoginIn(Schema):
    email: str
    password: str


class RegisterIn(Schema):
    email: str
    password: str
    full_name: str
    role: Literal["buyer", "artisan"]
    location: Optional[str] = None
    craft_specialty: Optional[str] = None


class RefreshIn(Schema):
    refresh_token: str


class SocialLoginIn(Schema):
    provider: Literal["google", "telegram"]
    provider_user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Literal["buyer", "artisan"] = "buyer"
    auth_data: Optional[Dict[str, Any]] = None


class UpdateMeIn(Schema):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    craft_specialty: Optional[str] = None
    years_experience: Optional[int] = None
    portfolio_url: Optional[str] = None


class SessionUserOut(Schema):
    id: str
    email: str
    full_name: str
    role: Literal["admin", "artisan", "buyer"]
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    craft_specialty: Optional[str] = None
    years_experience: Optional[int] = None
    portfolio_url: Optional[str] = None
    is_verified: bool = False


class AuthResponseOut(Schema):
    access_token: str
    refresh_token: str
    access_expires_at: str
    refresh_expires_at: str
    user: SessionUserOut


class UserListItemOut(Schema):
    id: str
    email: str
    full_name: str
    role: Literal["admin", "artisan", "buyer"]
    is_active: bool
    is_verified: bool
    date_joined: str
    location: Optional[str] = None
    phone: Optional[str] = None


class CreateAdminIn(Schema):
    email: str
    password: str
    full_name: str


MANAGED_ROLE_GROUPS = {"buyer", "artisan", "admin"}


def _split_full_name(full_name: str) -> tuple[str, str]:
    parts = full_name.strip().split(maxsplit=1)
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]


def _expiry_to_iso(expiry: int) -> str:
    return datetime.fromtimestamp(int(expiry), tz=timezone.utc).isoformat()


def _get_or_create_profile(user: User) -> UserProfile:
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return profile


def _resolve_role(user: User, profile: UserProfile) -> Literal["admin", "artisan", "buyer"]:
    if user.is_staff or user.is_superuser or profile.role == "admin":
        return "admin"
    if profile.role == "artisan" or hasattr(user, "artisan"):
        return "artisan"
    return "buyer"


def _sync_role_group(user: User, role: str) -> None:
    groups = list(Group.objects.filter(name__in=MANAGED_ROLE_GROUPS))
    if groups:
        user.groups.remove(*groups)
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)


def _require_social_secret(request) -> None:
    expected = getattr(settings, "SOCIAL_AUTH_SHARED_SECRET", "") or getattr(settings, "SECRET_KEY", "")
    if not expected:
        return

    provided = request.headers.get("X-Empindu-Social-Secret", "")
    if not hmac.compare_digest(provided, expected):
        raise HttpError(401, "Social authentication is not authorized.")


def _verify_telegram_auth(auth_data: Dict[str, Any]) -> None:
    bot_token = getattr(settings, "TELEGRAM_BOT_TOKEN", "")
    if not bot_token:
        return

    received_hash = str(auth_data.get("hash", ""))
    if not received_hash:
        raise HttpError(401, "Telegram authentication hash is missing.")

    payload = {
        str(key): str(value)
        for key, value in auth_data.items()
        if key != "hash" and value is not None
    }
    check_string = "\n".join(f"{key}={payload[key]}" for key in sorted(payload))
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    expected_hash = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise HttpError(401, "Telegram authentication could not be verified.")

    auth_date = int(payload.get("auth_date", "0") or 0)
    if auth_date and time.time() - auth_date > 86400:
        raise HttpError(401, "Telegram authentication has expired.")


def _serialize_user(user: User) -> dict:
    profile = _get_or_create_profile(user)
    role = _resolve_role(user, profile)
    full_name = user.get_full_name().strip() or user.email or user.username
    return {
        "id": str(user.pk),
        "email": user.email,
        "full_name": full_name,
        "role": role,
        "phone": profile.phone or None,
        "location": profile.location or None,
        "bio": profile.bio or None,
        "craft_specialty": profile.craft_specialty or None,
        "years_experience": profile.years_experience,
        "portfolio_url": profile.portfolio_url or None,
        "is_verified": bool(profile.is_verified or user.is_staff or user.is_superuser),
    }

T = TypeVar("T", bound=User)

def _build_auth_response(user: T) -> dict:
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    return {
        "access_token": str(access),
        "refresh_token": str(refresh),
        "access_expires_at": _expiry_to_iso(access["exp"]),
        "refresh_expires_at": _expiry_to_iso(refresh["exp"]),
        "user": _serialize_user(user),
    }


def _get_authenticated_user(request) -> User:
    header = request.headers.get("Authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HttpError(401, "Authentication required.")

    try:
        validated = JWTAuthentication().get_validated_token(token)
        user = JWTAuthentication().get_user(validated)
    except Exception as exc:  # pragma: no cover - defensive guard around JWT library
        raise HttpError(401, "Invalid or expired token.") from exc

    if not user or not user.is_active:
        raise HttpError(401, "Invalid or expired token.")

    return user


def _require_admin_user(request) -> User:
    user = _get_authenticated_user(request)
    profile = _get_or_create_profile(user)
    if _resolve_role(user, profile) != "admin":
        raise HttpError(403, "Admin access required.")
    return user


@router.get("/users", response=List[UserListItemOut])
def list_users(request):
    _require_admin_user(request)

    users = User.objects.select_related("profile").order_by("email")
    result = []
    for user in users:
        profile = getattr(user, "profile", None)
        if profile is None:
            profile = _get_or_create_profile(user)

        result.append(
            {
                "id": str(user.pk),
                "email": user.email,
                "full_name": user.get_full_name().strip() or user.email or user.username,
                "role": _resolve_role(user, profile),
                "is_active": user.is_active,
                "is_verified": bool(profile.is_verified or user.is_staff or user.is_superuser),
                "date_joined": user.date_joined.isoformat(),
                "location": profile.location or None,
                "phone": profile.phone or None,
            }
        )

    return result


@router.post("/admin/create", response=UserListItemOut)
def create_admin(request, payload: CreateAdminIn):
    """Create a new admin account (admin-only endpoint)."""
    _require_admin_user(request)

    email = payload.email.strip().lower()
    if User.objects.filter(email__iexact=email).exists():
        raise HttpError(409, "An account with this email already exists.")

    try:
        validate_password(payload.password)
    except DjangoValidationError as exc:
        raise HttpError(400, " ".join(exc.messages))

    first_name, last_name = _split_full_name(payload.full_name)

    with transaction.atomic():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=payload.password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
        )
        profile = _get_or_create_profile(user)
        profile.role = "admin"
        profile.is_verified = True
        profile.save()
        _sync_role_group(user, "admin")

    return {
        "id": str(user.pk),
        "email": user.email,
        "full_name": user.get_full_name().strip() or user.email or user.username,
        "role": "admin",
        "is_active": user.is_active,
        "is_verified": True,
        "date_joined": user.date_joined.isoformat(),
        "location": profile.location or None,
        "phone": profile.phone or None,
    }


@router.post("/login", response=AuthResponseOut)
def login(request, payload: LoginIn):
    lookup = User.objects.filter(email__iexact=payload.email.strip()).first()
    if not lookup:
        raise HttpError(401, "Invalid email or password.")

    user = authenticate(request, username=lookup.get_username(), password=payload.password)
    if not user or not user.is_active:
        raise HttpError(401, "Invalid email or password.")

    return _build_auth_response(user)


@router.post("/register", response=AuthResponseOut)
def register(request, payload: RegisterIn):
    email = payload.email.strip().lower()
    if User.objects.filter(email__iexact=email).exists():
        raise HttpError(409, "An account with this email already exists.")

    try:
        validate_password(payload.password)
    except DjangoValidationError as exc:
        raise HttpError(400, " ".join(exc.messages))

    first_name, last_name = _split_full_name(payload.full_name)

    with transaction.atomic():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=payload.password,
            first_name=first_name,
            last_name=last_name,
        )
        profile = _get_or_create_profile(user)
        profile.role = payload.role
        profile.location = payload.location or ""
        profile.craft_specialty = payload.craft_specialty or ""
        profile.save()
        _sync_role_group(user, payload.role)

    return _build_auth_response(user)


@router.post("/social", response=AuthResponseOut)
def social_login(request, payload: SocialLoginIn):
    """Create or reuse a backend account after verified provider sign-in."""
    _require_social_secret(request)

    if payload.provider == "telegram":
        _verify_telegram_auth(payload.auth_data or {})

    email = (payload.email or "").strip().lower()
    if not email:
        email = f"{payload.provider}_{payload.provider_user_id}@empindu.local"

    full_name = (payload.full_name or "").strip() or email.split("@")[0]
    first_name, last_name = _split_full_name(full_name)

    with transaction.atomic():
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=None,
                first_name=first_name,
                last_name=last_name,
            )
        else:
            changed_fields = []
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                changed_fields.append("first_name")
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                changed_fields.append("last_name")
            if changed_fields:
                user.save(update_fields=changed_fields)

        profile = _get_or_create_profile(user)
        if profile.role == "buyer" and payload.role == "artisan":
            profile.role = "artisan"
        profile.save()
        _sync_role_group(user, profile.role)

    return _build_auth_response(user)


@router.post("/refresh", response=AuthResponseOut)
def refresh(request, payload: RefreshIn):
    try:
        refresh_token = RefreshToken(payload.refresh_token)
        user = User.objects.get(pk=refresh_token["user_id"])
    except Exception as exc:  # pragma: no cover - defensive guard around JWT library
        raise HttpError(401, "Refresh token is invalid or expired.") from exc

    if not user.is_active:
        raise HttpError(401, "User account is inactive.")

    return _build_auth_response(user)


@router.get("/me", response=SessionUserOut)
def me(request):
    user = _get_authenticated_user(request)
    return _serialize_user(user)


@router.patch("/me", response=SessionUserOut)
def update_me(request, payload: UpdateMeIn):
    user = _get_authenticated_user(request)
    profile = _get_or_create_profile(user)

    if payload.full_name is not None:
        first_name, last_name = _split_full_name(payload.full_name)
        user.first_name = first_name
        user.last_name = last_name
        user.save(update_fields=["first_name", "last_name"])

    if payload.phone is not None:
        profile.phone = payload.phone
    if payload.location is not None:
        profile.location = payload.location
    if payload.bio is not None:
        profile.bio = payload.bio
    if payload.craft_specialty is not None:
        profile.craft_specialty = payload.craft_specialty
    if payload.years_experience is not None:
        profile.years_experience = payload.years_experience
    if payload.portfolio_url is not None:
        profile.portfolio_url = payload.portfolio_url

    profile.save()
    return _serialize_user(user)
