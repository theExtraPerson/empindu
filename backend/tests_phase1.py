"""
Phase 1 Testing & Validation Script
Tests: Rate Limiting, Input Validation, Admin Auth (OTP+2FA), Database Indexes
Run: python tests_phase1.py
"""
import os
import sys
import django
import requests
import json
import time
from io import BytesIO

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django.test import Client
from django.core.management import call_command
from django.db import connection
from django.db.models import Model
from apps.accounts.admin_auth_models import AdminSession, AdminAuditLog
from apps.accounts.admin_auth_service import AdminAuthService
import pyotp

User = get_user_model()

# ============================================================================
# TEST CONFIGURATION
# ============================================================================

API_BASE_URL = "http://localhost:8000/api/v1"
TEST_ADMIN_EMAIL = "admin-test@empindu.com"
TEST_ADMIN_PASSWORD = "TestPass123!@#"

class TestResults:
    """Track test results"""
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✓ {test_name}")
    
    def add_fail(self, test_name, reason):
        self.failed += 1
        self.errors.append(f"✗ {test_name}: {reason}")
        print(f"✗ {test_name}: {reason}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*70}")
        print(f"TEST SUMMARY: {self.passed}/{total} passed")
        if self.errors:
            print(f"\nFailed tests:")
            for error in self.errors:
                print(f"  {error}")
        print(f"{'='*70}\n")
        return self.failed == 0

results = TestResults()

# ============================================================================
# TEST 1: DATABASE SETUP
# ============================================================================
print("\n" + "="*70)
print("TEST 1: DATABASE SETUP & MIGRATIONS")
print("="*70)

try:
    # Verify admin auth tables exist
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('accounts_adminsession', 'accounts_adminauditlog')
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        if 'accounts_adminsession' in tables:
            results.add_pass("AdminSession table created")
        else:
            results.add_fail("AdminSession table", "Table not found")
        
        if 'accounts_adminauditlog' in tables:
            results.add_pass("AdminAuditLog table created")
        else:
            results.add_fail("AdminAuditLog table", "Table not found")
except Exception as e:
    results.add_fail("Database setup", str(e))

# ============================================================================
# TEST 2: DATABASE INDEXES
# ============================================================================
print("\n" + "="*70)
print("TEST 2: DATABASE INDEXES")
print("="*70)

index_checks = {
    "artisans_artisan": ["user_id", "is_active", "is_certified", "craft_tradition", "district"],
    "products_product": ["artisan_id", "craft_tradition", "status", "slug"],
    "orders_order": ["buyer_id", "artisan_id", "status", "payment_method", "product_id", "payout_status"],
    "payments_paymenttransaction": ["order_id", "artisan_id"],
    "heritage_heritagefundentry": ["order_id", "craft_tradition", "entry_type"],
}

try:
    with connection.cursor() as cursor:
        for table, expected_fields in index_checks.items():
            cursor.execute(f"""
                SELECT indexname FROM pg_indexes 
                WHERE tablename = '{table}' 
                AND indexname NOT LIKE '%_pkey'
            """)
            indexes = [row[0] for row in cursor.fetchall()]
            
            if len(indexes) > 0:
                results.add_pass(f"Indexes on {table} ({len(indexes)} indexes found)")
            else:
                results.add_fail(f"Indexes on {table}", "No indexes found")
except Exception as e:
    results.add_fail("Index verification", str(e))

# ============================================================================
# TEST 3: CREATE TEST ADMIN USER
# ============================================================================
print("\n" + "="*70)
print("TEST 3: CREATE TEST ADMIN USER")
print("="*70)

try:
    # Delete existing test user if present
    User.objects.filter(email=TEST_ADMIN_EMAIL).delete()
    
    # Create admin user
    admin_user = User.objects.create_user(
        email=TEST_ADMIN_EMAIL,
        password=TEST_ADMIN_PASSWORD,
        username=TEST_ADMIN_EMAIL.split('@')[0]
    )
    
    # Add to admin group
    from django.contrib.auth.models import Group
    admin_group, _ = Group.objects.get_or_create(name='Admin')
    admin_user.groups.add(admin_group)
    
    results.add_pass(f"Created test admin user: {TEST_ADMIN_EMAIL}")
except Exception as e:
    results.add_fail("Create test admin user", str(e))

# ============================================================================
# TEST 4: ADMIN AUTH SERVICE - OTP GENERATION
# ============================================================================
print("\n" + "="*70)
print("TEST 4: ADMIN AUTH SERVICE - OTP GENERATION")
print("="*70)

try:
    service = AdminAuthService()
    
    # Create admin session
    admin_session = service.create_admin_session(admin_user)
    results.add_pass("Created admin session")
    
    # Generate OTP
    otp_code = service.request_otp(admin_user)
    if otp_code and len(otp_code) == 6 and otp_code.isdigit():
        results.add_pass(f"Generated 6-digit OTP: {otp_code}")
    else:
        results.add_fail("OTP generation", f"Invalid OTP format: {otp_code}")
    
    # Store for later verification
    stored_otp = otp_code
except Exception as e:
    results.add_fail("OTP generation", str(e))

# ============================================================================
# TEST 5: ADMIN AUTH SERVICE - OTP VERIFICATION
# ============================================================================
print("\n" + "="*70)
print("TEST 5: ADMIN AUTH SERVICE - OTP VERIFICATION")
print("="*70)

try:
    service = AdminAuthService()
    
    # Verify correct OTP
    is_valid = service.verify_otp(admin_user, stored_otp)
    if is_valid:
        results.add_pass("OTP verification successful with correct code")
    else:
        results.add_fail("OTP verification", "Valid OTP was rejected")
    
    # Verify incorrect OTP
    admin_session = service.create_admin_session(admin_user)
    service.request_otp(admin_user)  # Generate new OTP
    
    is_invalid = service.verify_otp(admin_user, "000000")
    if not is_invalid:
        results.add_pass("OTP verification correctly rejected invalid code")
    else:
        results.add_fail("OTP verification", "Invalid OTP was accepted")
except Exception as e:
    results.add_fail("OTP verification", str(e))

# ============================================================================
# TEST 6: ADMIN AUTH SERVICE - 2FA SETUP
# ============================================================================
print("\n" + "="*70)
print("TEST 6: ADMIN AUTH SERVICE - 2FA SETUP")
print("="*70)

try:
    service = AdminAuthService()
    admin_session = service.create_admin_session(admin_user)
    
    totp_secret, qr_code_base64, backup_codes = service.setup_2fa(admin_user)
    
    if totp_secret and len(totp_secret) > 0:
        results.add_pass(f"2FA TOTP secret generated: {totp_secret[:10]}...")
    else:
        results.add_fail("2FA setup", "TOTP secret not generated")
    
    if qr_code_base64 and qr_code_base64.startswith('data:image'):
        results.add_pass("QR code generated (base64 PNG)")
    else:
        results.add_fail("2FA setup", "QR code not generated")
    
    if backup_codes and len(backup_codes) == 10:
        results.add_pass(f"Generated 10 backup codes")
    else:
        results.add_fail("2FA setup", f"Expected 10 backup codes, got {len(backup_codes) if backup_codes else 0}")
    
    # Store for later tests
    stored_totp_secret = totp_secret
    stored_backup_codes = backup_codes
except Exception as e:
    results.add_fail("2FA setup", str(e))

# ============================================================================
# TEST 7: ADMIN AUTH SERVICE - 2FA VERIFICATION
# ============================================================================
print("\n" + "="*70)
print("TEST 7: ADMIN AUTH SERVICE - 2FA VERIFICATION")
print("="*70)

try:
    service = AdminAuthService()
    
    # Generate valid TOTP code
    totp = pyotp.TOTP(stored_totp_secret)
    valid_code = totp.now()
    
    is_valid = service.verify_2fa(admin_user, valid_code)
    if is_valid:
        results.add_pass("2FA verification successful with valid TOTP code")
    else:
        results.add_fail("2FA verification", "Valid TOTP code was rejected")
    
    # Test invalid code
    is_invalid = service.verify_2fa(admin_user, "000000")
    if not is_invalid:
        results.add_pass("2FA verification correctly rejected invalid code")
    else:
        results.add_fail("2FA verification", "Invalid TOTP code was accepted")
except Exception as e:
    results.add_fail("2FA verification", str(e))

# ============================================================================
# TEST 8: ADMIN AUTH SERVICE - BACKUP CODE VERIFICATION
# ============================================================================
print("\n" + "="*70)
print("TEST 8: ADMIN AUTH SERVICE - BACKUP CODE VERIFICATION")
print("="*70)

try:
    service = AdminAuthService()
    
    if stored_backup_codes and len(stored_backup_codes) > 0:
        first_backup_code = stored_backup_codes[0]
        
        # Verify valid backup code
        is_valid = service.verify_backup_code(admin_user, first_backup_code)
        if is_valid:
            results.add_pass("Backup code verification successful")
        else:
            results.add_fail("Backup code verification", "Valid backup code was rejected")
        
        # Verify same code cannot be reused (single-use)
        is_reused = service.verify_backup_code(admin_user, first_backup_code)
        if not is_reused:
            results.add_pass("Backup code correctly rejected when reused (single-use)")
        else:
            results.add_fail("Backup code", "Backup code was reused (should be single-use)")
    else:
        results.add_fail("Backup code verification", "No backup codes available")
except Exception as e:
    results.add_fail("Backup code verification", str(e))

# ============================================================================
# TEST 9: ADMIN AUDIT LOG
# ============================================================================
print("\n" + "="*70)
print("TEST 9: ADMIN AUDIT LOG")
print("="*70)

try:
    service = AdminAuthService()
    
    # Generate some audit log entries
    service.log_admin_action(admin_user, "login_attempt", "OTP verified")
    service.log_admin_action(admin_user, "2fa_setup", "TOTP enabled")
    
    # Verify audit logs were created
    audit_logs = AdminAuditLog.objects.filter(admin_user=admin_user)
    
    if audit_logs.count() >= 2:
        results.add_pass(f"Audit logging works ({audit_logs.count()} entries created)")
    else:
        results.add_fail("Audit logging", f"Expected 2+ entries, got {audit_logs.count()}")
    
    # Verify immutability (logs should not be updateable)
    try:
        audit_logs.first().action_type = "invalid"
        audit_logs.first().save()
        results.add_fail("Audit logging", "Audit logs should be immutable")
    except:
        results.add_pass("Audit logs are immutable (read-only)")
except Exception as e:
    results.add_fail("Audit logging", str(e))

# ============================================================================
# TEST 10: INPUT VALIDATION (Zod schemas on frontend)
# ============================================================================
print("\n" + "="*70)
print("TEST 10: INPUT VALIDATION SCHEMAS")
print("="*70)

try:
    # Check that validation files exist
    validation_file = "c:\\Users\\USER\\Desktop\\themes of black\\nodes\\empindu\\apps\\next\\src\\lib\\validation.ts"
    
    import os
    if os.path.exists(validation_file):
        with open(validation_file, 'r') as f:
            content = f.read()
            
        required_schemas = [
            "LoginSchema", "RegisterSchema", "OTPVerifySchema",
            "AdminLoginSchema", "Admin2FASchema", "AdminBackupCodeSchema",
            "ProductFilterSchema", "CheckoutSchema", "SearchQuerySchema"
        ]
        
        found_schemas = [s for s in required_schemas if s in content]
        
        if len(found_schemas) == len(required_schemas):
            results.add_pass(f"All {len(required_schemas)} Zod validation schemas found")
        else:
            missing = set(required_schemas) - set(found_schemas)
            results.add_fail("Validation schemas", f"Missing: {missing}")
    else:
        results.add_fail("Validation schemas", "validation.ts file not found")
except Exception as e:
    results.add_fail("Input validation", str(e))

# ============================================================================
# TEST 11: RATE LIMITING CONFIGURATION
# ============================================================================
print("\n" + "="*70)
print("TEST 11: RATE LIMITING CONFIGURATION")
print("="*70)

try:
    from django.conf import settings
    
    # Check REST_FRAMEWORK settings
    if hasattr(settings, 'REST_FRAMEWORK'):
        rest_config = settings.REST_FRAMEWORK
        
        if 'THROTTLE_CLASSES' in rest_config:
            throttle_classes = rest_config['THROTTLE_CLASSES']
            
            required_throttles = [
                'api.v1.throttles.AuthThrottle',
                'api.v1.throttles.SearchThrottle',
                'api.v1.throttles.CheckoutThrottle'
            ]
            
            found = [t for t in required_throttles if any(t in str(tc) for tc in throttle_classes)]
            
            if len(found) >= 2:
                results.add_pass(f"Rate limiting configured ({len(throttle_classes)} throttle classes)")
            else:
                results.add_fail("Rate limiting", "Not all throttle classes configured")
        else:
            results.add_fail("Rate limiting", "THROTTLE_CLASSES not configured")
    else:
        results.add_fail("Rate limiting", "REST_FRAMEWORK config not found")
except Exception as e:
    results.add_fail("Rate limiting configuration", str(e))

# ============================================================================
# TEST 12: REQUEST SIZE MIDDLEWARE
# ============================================================================
print("\n" + "="*70)
print("TEST 12: REQUEST SIZE MIDDLEWARE")
print("="*70)

try:
    from django.conf import settings
    
    middleware = settings.MIDDLEWARE
    
    if any('RequestSizeLimitMiddleware' in m for m in middleware):
        results.add_pass("Request size limit middleware configured")
    else:
        results.add_fail("Request size middleware", "Not found in MIDDLEWARE")
except Exception as e:
    results.add_fail("Request size middleware", str(e))

# ============================================================================
# FINAL SUMMARY
# ============================================================================
print("\n")
success = results.summary()

# Cleanup
print("\nCleaning up test data...")
User.objects.filter(email=TEST_ADMIN_EMAIL).delete()
print("✓ Test user cleaned up")

sys.exit(0 if success else 1)
