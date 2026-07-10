"""
Admin Authentication Endpoints
OTP + 2FA for secure admin access
"""
from typing import Optional
from ninja import Router, Schema
from ninja.errors import HttpError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.admin_auth_service import AdminAuthService
from apps.accounts.admin_auth_models import AdminSession

User = get_user_model()
router = Router(tags=["Admin Auth"])


# ============================================================================
# SCHEMAS
# ============================================================================

class AdminRequestOTPIn(Schema):
    email: str


class AdminVerifyOTPIn(Schema):
    email: str
    otp_code: str


class AdminSetup2FAIn(Schema):
    pass


class AdminVerify2FAIn(Schema):
    totp_code: str


class AdminBackupCodeIn(Schema):
    backup_code: str


class AdminSetup2FAOut(Schema):
    secret: str
    qr_code: str
    backup_codes: list
    uri: str


class AdminLoginResponse(Schema):
    access_token: str
    refresh_token: str
    message: str
    user_id: str


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/request-otp", response=dict, auth=None)
def request_otp(request, payload: AdminRequestOTPIn):
    """
    Request OTP for admin login
    
    Flow:
    1. Admin enters email
    2. Backend sends OTP via email (6-digit, 5 min expiry)
    3. Client receives confirmation
    """
    try:
        user = User.objects.get(email=payload.email)
        
        if not user.is_staff and not user.is_superuser:
            raise HttpError(403, "User is not an admin")
        
        ip_address = _get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        session, error = AdminAuthService.request_otp(user, ip_address, user_agent)
        
        if error:
            raise HttpError(400, error)
        
        return {
            "success": True,
            "message": f"OTP sent to {user.email}",
            "email": user.email,
        }
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    except Exception as e:
        raise HttpError(500, str(e))


@router.post("/verify-otp", response=dict, auth=None)
def verify_otp(request, payload: AdminVerifyOTPIn):
    """
    Verify OTP code
    
    After successful OTP verification, client should request 2FA setup
    if not already configured.
    """
    try:
        user = User.objects.get(email=payload.email)
        
        ip_address = _get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        session, error = AdminAuthService.verify_otp(user, payload.otp_code, ip_address, user_agent)
        
        if error:
            raise HttpError(400, error)
        
        session = AdminSession.objects.get(user=user)
        
        if session.has_2fa_enabled():
            return {
                "success": True,
                "message": "OTP verified. Please verify 2FA.",
                "next_step": "2fa_verification",
                "requires_2fa": True,
            }
        else:
            return {
                "success": True,
                "message": "OTP verified. Please setup 2FA.",
                "next_step": "2fa_setup",
                "requires_2fa": False,
            }
    except User.DoesNotExist:
        raise HttpError(404, "User not found")
    except Exception as e:
        raise HttpError(500, str(e))


@router.post("/setup-2fa", response=AdminSetup2FAOut)
def setup_2fa(request, payload: AdminSetup2FAIn):
    """
    Setup 2FA (TOTP) for admin
    
    Returns QR code, secret, and backup codes
    """
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        raise HttpError(403, "User is not an admin")
    
    result, error = AdminAuthService.setup_2fa(user)
    
    if error:
        raise HttpError(400, error)
    
    return result


@router.post("/verify-2fa", response=AdminLoginResponse)
def verify_2fa(request, payload: AdminVerify2FAIn):
    """
    Verify 2FA code and login
    
    After successful 2FA verification, JWT tokens are issued
    """
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        raise HttpError(403, "User is not an admin")
    
    ip_address = _get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    success, message = AdminAuthService.verify_2fa(user, payload.totp_code, ip_address, user_agent)
    
    if not success:
        raise HttpError(400, message)
    
    # Issue JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "message": "Admin logged in successfully",
        "user_id": str(user.id),
    }


@router.post("/verify-backup-code", response=AdminLoginResponse)
def verify_backup_code(request, payload: AdminBackupCodeIn):
    """
    Verify backup code as 2FA alternative
    
    Useful if user loses access to authenticator app
    """
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        raise HttpError(403, "User is not an admin")
    
    ip_address = _get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    success, message = AdminAuthService.verify_backup_code(user, payload.backup_code, ip_address, user_agent)
    
    if not success:
        raise HttpError(400, message)
    
    # Issue JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return {
        "access_token": str(refresh.access_token),
        "refresh_token": str(refresh),
        "message": "Admin logged in successfully",
        "user_id": str(user.id),
    }


@router.get("/session", response=dict)
def get_admin_session(request):
    """Get current admin session details"""
    user = request.user
    
    if not user.is_staff and not user.is_superuser:
        raise HttpError(403, "User is not an admin")
    
    session = AdminAuthService.get_admin_session(user)
    
    if not session:
        raise HttpError(404, "No admin session found")
    
    return {
        "user_id": str(user.id),
        "email": user.email,
        "has_2fa": session.has_2fa_enabled(),
        "last_login": session.last_login.isoformat() if session.last_login else None,
        "ip_address": session.ip_address,
    }


# ============================================================================
# UTILITIES
# ============================================================================

def _get_client_ip(request) -> str:
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip
