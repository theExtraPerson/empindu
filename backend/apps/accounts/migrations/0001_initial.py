from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(choices=[("buyer", "Buyer"), ("artisan", "Artisan"), ("admin", "Administrator")], default="buyer", max_length=20)),
                ("phone", models.CharField(blank=True, max_length=32)),
                ("location", models.CharField(blank=True, max_length=255)),
                ("bio", models.TextField(blank=True)),
                ("craft_specialty", models.CharField(blank=True, max_length=255)),
                ("years_experience", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("portfolio_url", models.URLField(blank=True)),
                ("is_verified", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(on_delete=models.deletion.CASCADE, related_name="profile", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["user__email"],
                "verbose_name": "User profile",
                "verbose_name_plural": "User profiles",
            },
        ),
    ]
