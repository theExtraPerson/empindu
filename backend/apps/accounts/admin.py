from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "is_verified", "updated_at")
    list_filter = ("role", "is_verified")
    search_fields = ("user__email", "user__username", "user__first_name", "user__last_name", "craft_specialty")
