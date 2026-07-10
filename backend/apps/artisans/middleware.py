"""
Middleware to fix template context copying issue with django-unfold
Thrive With Nature
"""

import copy


class UnfoldContextFixMiddleware:
    """
    Fixes AttributeError: 'super' object has no attribute 'dicts'
    by patching the context copy behavior.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Patch Django's BaseContext and Context copy implementations for django-unfold
        from django.template import context

        def fixed_basecontext_copy(self):
            duplicate = self.__class__.__new__(self.__class__)
            duplicate.__dict__.update(self.__dict__)
            duplicate.dicts = list(self.dicts[:])
            return duplicate

        def fixed_context_copy(self):
            duplicate = context.BaseContext.__copy__(self)
            duplicate.render_context = copy.copy(self.render_context)
            return duplicate

        context.BaseContext.__copy__ = fixed_basecontext_copy
        context.Context.__copy__ = fixed_context_copy

        response = self.get_response(request)
        return response
