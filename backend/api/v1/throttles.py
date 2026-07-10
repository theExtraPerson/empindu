"""
Rate Limiting & Throttling Configuration
Prevents brute force attacks and API abuse
"""
from rest_framework.throttling import BaseThrottle
from django.core.cache import cache
from django.utils.decorators import decorator_from_middleware
from django.http import JsonResponse
import time


class CustomThrottle(BaseThrottle):
    """
    Custom throttle class with configurable rate limits
    """
    THROTTLE_RATES = {
        'global': '1000/hour',
        'auth_login': '50/minute',
        'auth_register': '20/hour',
        'search': '100/minute',
        'checkout': '30/minute',
    }

    def get_cache_key(self, request, view):
        """Generate cache key based on IP and endpoint"""
        if not request.user or not request.user.is_authenticated:
            ip = self.get_client_ip(request)
        else:
            ip = request.user.id

        return f"throttle_{view.action if hasattr(view, 'action') else view.__class__.__name__}_{ip}"

    @staticmethod
    def get_client_ip(request):
        """Extract client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def throttle_success(self):
        """Return True if request should be throttled, False otherwise"""
        self.history = cache.get(self.key, [])
        self.now = time.time()

        # Drop any requests from the history which have now passed the
        # throttle duration
        while self.history and self.history[-1] <= self.now - self.duration:
            self.history.pop()

        if len(self.history) >= self.num_requests:
            return False

        return True

    def throttle_failure(self):
        """Throttle failure"""
        return False

    def allow_request(self, request, view):
        """
        Implement the check to see if the request should be throttled.
        """
        self.key = self.get_cache_key(request, view)

        if not self.key:
            return True

        # Determine rate limit based on endpoint
        if 'login' in request.path:
            self.rate = self.THROTTLE_RATES['auth_login']
            self.num_requests, self.duration = self.parse_rate(self.rate)
        elif 'register' in request.path:
            self.rate = self.THROTTLE_RATES['auth_register']
            self.num_requests, self.duration = self.parse_rate(self.rate)
        elif 'search' in request.path:
            self.rate = self.THROTTLE_RATES['search']
            self.num_requests, self.duration = self.parse_rate(self.rate)
        elif 'checkout' in request.path or 'pay' in request.path:
            self.rate = self.THROTTLE_RATES['checkout']
            self.num_requests, self.duration = self.parse_rate(self.rate)
        else:
            self.rate = self.THROTTLE_RATES['global']
            self.num_requests, self.duration = self.parse_rate(self.rate)

        return self.throttle_success()

    def get_throttle_info(self):
        """Return throttle info for response headers"""
        return {
            'X-RateLimit-Limit': str(self.num_requests),
            'X-RateLimit-Remaining': str(max(0, self.num_requests - len(self.history))),
            'X-RateLimit-Reset': str(int(self.history[-1] + self.duration) if self.history else int(self.now + self.duration)),
        }

    @staticmethod
    def parse_rate(rate):
        """
        Given the request rate string, return a two tuple of:
        <allowed number of requests>, <period of time in seconds>
        """
        num, period = rate.split('/')
        num_requests = int(num)
        duration = {'s': 1, 'm': 60, 'h': 3600, 'd': 86400}[period[0]]
        return (num_requests, duration)


class AuthThrottle(CustomThrottle):
    """Strict throttle for authentication endpoints"""
    scope = 'auth'

    def allow_request(self, request, view):
        if request.path.endswith('login/'):
            self.rate = '50/minute'
        elif request.path.endswith('register/'):
            self.rate = '20/hour'
        else:
            self.rate = '100/hour'

        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)


class SearchThrottle(CustomThrottle):
    """Throttle for search endpoints"""
    scope = 'search'

    def allow_request(self, request, view):
        self.rate = '100/minute'
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)


class CheckoutThrottle(CustomThrottle):
    """Throttle for checkout endpoints"""
    scope = 'checkout'

    def allow_request(self, request, view):
        self.rate = '30/minute'
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)


# Middleware for request size validation
class RequestSizeLimitMiddleware:
    """Validate request size and reject if exceeds limit"""
    
    MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check Content-Length header
        content_length = request.META.get('CONTENT_LENGTH', 0)
        
        if content_length:
            try:
                if int(content_length) > self.MAX_REQUEST_SIZE:
                    return JsonResponse({
                        'error': {
                            'code': 'REQUEST_TOO_LARGE',
                            'message': f'Request size exceeds maximum allowed ({self.MAX_REQUEST_SIZE / (1024*1024)}MB)',
                            'max_size_mb': self.MAX_REQUEST_SIZE / (1024*1024)
                        }
                    }, status=413)
            except (ValueError, TypeError):
                pass

        response = self.get_response(request)
        return response
