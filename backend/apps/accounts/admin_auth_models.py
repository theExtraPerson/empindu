"""
Admin Authentication Models
OTP and 2FA for secure admin access
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import secrets
import pyotp
import qrcode
from io import BytesIO
import base64

User = get_user_model()


class AdminSession(models.Model):
    """Secure admin authentication session"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_session')
    
    # OTP fields
    otp_code = models.CharField(max_length=6, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.IntegerField(default=0)
    otp_verified = models.BooleanField(default=False)
    
    # 2FA (TOTP) fields
    totp_secret = models.CharField(max_length=32, blank=True, unique=True, null=True)
    totp_verified = models.BooleanField(default=False)
    totp_backup_codes = models.JSONField(default=list, blank=True)
    
    # Session management
    is_active = models.BooleanField(default=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_admin_session'
        verbose_name = 'Admin Session'
        verbose_name_plural = 'Admin Sessions'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['totp_verified']),
        ]
    
    def __str__(self):
        return f"Admin Session - {self.user.email}"
    
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP code"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    def is_otp_expired(self):
        """Check if OTP has expired (5 minute expiry)"""
        if not self.otp_created_at:
            return True
        return (timezone.now() - self.otp_created_at).total_seconds() > 300
    
    def verify_otp(self, code):
        """Verify OTP code"""
        if self.is_otp_expired():
            self.otp_code = ''
            self.save()
            return False, "OTP expired"
        
        if self.otp_attempts >= 3:
            return False, "Too many attempts"
        
        if code != self.otp_code:
            self.otp_attempts += 1
            self.save()
            return False, "Invalid OTP code"
        
        self.otp_verified = True
        self.otp_code = ''
        self.otp_attempts = 0
        self.save()
        return True, "OTP verified"
    
    def setup_totp(self):
        """Setup TOTP (Google Authenticator) for 2FA"""
        if self.totp_secret:
            return None, "TOTP already configured"
        
        # Generate secret
        secret = pyotp.random_base32()
        self.totp_secret = secret
        
        # Generate QR code
        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(
            name=self.user.email,
            issuer_name='Empindu Admin'
        )
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Generate backup codes
        backup_codes = [secrets.token_hex(4) for _ in range(10)]
        self.totp_backup_codes = backup_codes
        
        self.save()
        
        return {
            'secret': secret,
            'qr_code': f"data:image/png;base64,{qr_code_base64}",
            'backup_codes': backup_codes,
            'uri': uri
        }, None
    
    def verify_totp(self, code):
        """Verify TOTP code"""
        if not self.totp_secret:
            return False, "TOTP not configured"
        
        totp = pyotp.TOTP(self.totp_secret)
        
        # Allow ±30 second window
        if totp.verify(code, valid_window=1):
            self.totp_verified = True
            self.save()
            return True, "TOTP verified"
        
        return False, "Invalid TOTP code"
    
    def verify_backup_code(self, code):
        """Verify backup code (single use)"""
        if code not in self.totp_backup_codes:
            return False, "Invalid backup code"
        
        # Remove used code
        self.totp_backup_codes.remove(code)
        self.save()
        return True, "Backup code used"
    
    def has_2fa_enabled(self):
        """Check if 2FA is enabled"""
        return self.totp_verified and bool(self.totp_secret)


class AdminAuditLog(models.Model):
    """Audit log for admin actions"""
    
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('otp_requested', 'OTP Requested'),
        ('otp_verified', 'OTP Verified'),
        ('totp_setup', '2FA Setup'),
        ('totp_verified', '2FA Verified'),
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_deleted', 'User Deleted'),
        ('settings_changed', 'Settings Changed'),
        ('payment_approved', 'Payment Approved'),
        ('order_updated', 'Order Updated'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    details = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=[('success', 'Success'), ('failure', 'Failure')])
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'accounts_admin_audit_log'
        verbose_name = 'Admin Audit Log'
        verbose_name_plural = 'Admin Audit Logs'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.created_at}"
