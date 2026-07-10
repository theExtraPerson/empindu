"""
Admin Authentication Services
OTP and 2FA service layer
"""
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .admin_auth_models import AdminSession, AdminAuditLog
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class AdminAuthService:
    """Service for admin authentication"""
    
    @staticmethod
    def create_admin_session(user, ip_address=None, user_agent=None):
        """Create or get admin session"""
        session, created = AdminSession.objects.get_or_create(
            user=user,
            defaults={
                'ip_address': ip_address,
                'user_agent': user_agent,
            }
        )
        return session
    
    @staticmethod
    def request_otp(user, ip_address=None, user_agent=None):
        """Request OTP for admin login"""
        if not user.is_staff and not user.is_superuser:
            return None, "User is not an admin"
        
        session = AdminAuthService.create_admin_session(user, ip_address, user_agent)
        
        # Generate OTP
        otp_code = AdminSession.generate_otp()
        session.otp_code = otp_code
        session.otp_created_at = __import__('django.utils.timezone', fromlist=['now']).now()
        session.otp_attempts = 0
        session.save()
        
        # Send OTP email
        try:
            subject = 'Empindu Admin Login - OTP Code'
            html_message = f"""
            <p>Hello {user.first_name or 'Admin'},</p>
            <p>Your OTP code is: <strong>{otp_code}</strong></p>
            <p>This code will expire in 5 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <p>Empindu Team</p>
            """
            send_mail(
                subject,
                f"Your OTP code is: {otp_code}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=html_message,
                fail_silently=False,
            )
            
            # Log action
            AdminAuditLog.objects.create(
                user=user,
                action='otp_requested',
                ip_address=ip_address,
                user_agent=user_agent,
                status='success',
                details={'email': user.email}
            )
            
            return session, None
        except Exception as e:
            logger.error(f"Failed to send OTP email to {user.email}: {str(e)}")
            AdminAuditLog.objects.create(
                user=user,
                action='otp_requested',
                ip_address=ip_address,
                user_agent=user_agent,
                status='failure',
                details={'error': str(e)}
            )
            return None, f"Failed to send OTP: {str(e)}"
    
    @staticmethod
    def verify_otp(user, otp_code, ip_address=None, user_agent=None):
        """Verify OTP code"""
        try:
            session = AdminSession.objects.get(user=user)
        except AdminSession.DoesNotExist:
            return None, "No OTP session found"
        
        success, message = session.verify_otp(otp_code)
        
        if success:
            AdminAuditLog.objects.create(
                user=user,
                action='otp_verified',
                ip_address=ip_address,
                user_agent=user_agent,
                status='success',
            )
        else:
            AdminAuditLog.objects.create(
                user=user,
                action='otp_verified',
                ip_address=ip_address,
                user_agent=user_agent,
                status='failure',
                details={'message': message}
            )
        
        return session if success else None, message
    
    @staticmethod
    def setup_2fa(user):
        """Setup 2FA for admin"""
        try:
            session = AdminSession.objects.get(user=user)
        except AdminSession.DoesNotExist:
            session = AdminAuthService.create_admin_session(user)
        
        result, error = session.setup_totp()
        
        if error:
            logger.error(f"Failed to setup 2FA for {user.email}: {error}")
            return None, error
        
        AdminAuditLog.objects.create(
            user=user,
            action='totp_setup',
            status='success',
            details={'email': user.email}
        )
        
        return result, None
    
    @staticmethod
    def verify_2fa(user, code, ip_address=None, user_agent=None):
        """Verify 2FA code"""
        try:
            session = AdminSession.objects.get(user=user)
        except AdminSession.DoesNotExist:
            return False, "2FA not configured"
        
        success, message = session.verify_totp(code)
        
        if success:
            session.last_login = __import__('django.utils.timezone', fromlist=['now']).now()
            session.ip_address = ip_address
            session.user_agent = user_agent
            session.save()
            
            AdminAuditLog.objects.create(
                user=user,
                action='login',
                ip_address=ip_address,
                user_agent=user_agent,
                status='success',
            )
        else:
            AdminAuditLog.objects.create(
                user=user,
                action='totp_verified',
                ip_address=ip_address,
                user_agent=user_agent,
                status='failure',
                details={'message': message}
            )
        
        return success, message
    
    @staticmethod
    def verify_backup_code(user, code, ip_address=None, user_agent=None):
        """Verify backup code as 2FA alternative"""
        try:
            session = AdminSession.objects.get(user=user)
        except AdminSession.DoesNotExist:
            return False, "2FA not configured"
        
        success, message = session.verify_backup_code(code)
        
        if success:
            session.last_login = __import__('django.utils.timezone', fromlist=['now']).now()
            session.ip_address = ip_address
            session.user_agent = user_agent
            session.save()
            
            AdminAuditLog.objects.create(
                user=user,
                action='login',
                ip_address=ip_address,
                user_agent=user_agent,
                status='success',
                details={'method': 'backup_code'}
            )
        else:
            AdminAuditLog.objects.create(
                user=user,
                action='login',
                ip_address=ip_address,
                user_agent=user_agent,
                status='failure',
                details={'message': message, 'method': 'backup_code'}
            )
        
        return success, message
    
    @staticmethod
    def get_admin_session(user):
        """Get admin session"""
        try:
            return AdminSession.objects.get(user=user)
        except AdminSession.DoesNotExist:
            return None
    
    @staticmethod
    def log_admin_action(user, action, status, ip_address=None, user_agent=None, details=None):
        """Log admin action"""
        AdminAuditLog.objects.create(
            user=user,
            action=action,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {}
        )
