"""
Middleware to fix template context copying issue with django-unfold
Thrive With Nature
"""


class UnfoldContextFixMiddleware:
    """
    Fixes AttributeError: 'super' object has no attribute 'dicts'
    by patching the context copy behavior.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Patch Django's Context class to fix the copy issue
        from django.template import context
        original_copy = context.Context.__copy__
        
        def fixed_copy(self):
            duplicate = context.BaseContext.__copy__(self)
            duplicate.dicts = list(self.dicts[:])
            return duplicate
        
        context.Context.__copy__ = fixed_copy
        
        response = self.get_response(request)
        return response
