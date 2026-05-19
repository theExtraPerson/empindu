# Generated for Empindu gifting workflow alignment.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("gifting", "0002_giftorderitem"),
    ]

    operations = [
        migrations.AddField(
            model_name="giftorder",
            name="branding_notes",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="giftorder",
            name="contact_phone",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="giftorder",
            name="delivery_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="giftorder",
            name="gift_message",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="giftorder",
            name="occasion",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name="giftorder",
            name="recipient_count",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="giftorderitem",
            name="personalization",
            field=models.TextField(blank=True),
        ),
        migrations.CreateModel(
            name="GiftOrderRecipient",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("phone", models.CharField(blank=True, max_length=40)),
                ("address", models.TextField(blank=True)),
                ("city", models.CharField(blank=True, max_length=120)),
                ("country", models.CharField(blank=True, max_length=80)),
                ("personal_message", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "gift_order",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="recipients", to="gifting.giftorder"),
                ),
            ],
            options={
                "ordering": ["id"],
            },
        ),
    ]
