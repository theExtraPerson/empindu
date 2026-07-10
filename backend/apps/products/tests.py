from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.artisans.models import Artisan, CraftTradition
from apps.products.models import Product
from api.v1.products import get_product


class ProductSlugTests(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(
            username="artisan-user",
            email="artisan@example.com",
            password="testpass123",
            first_name="Ada",
            last_name="Lovelace",
        )
        self.craft_tradition = CraftTradition.objects.create(
            name="Basket Weaving",
            ethnic_group="Baganda",
            region="Central Uganda",
            description="Traditional basket weaving",
        )
        self.artisan = Artisan.objects.create(
            user=self.user,
            craft_tradition=self.craft_tradition,
            bio="A skilled artisan",
            community="Kampala",
            district="Kampala",
            phone="0770000000",
            onboarded_via="web",
        )

    def test_product_slug_is_generated_from_name(self):
        product = Product.objects.create(
            artisan=self.artisan,
            craft_tradition=self.craft_tradition,
            name="Handwoven Basket",
            story="A beautiful basket",
            material="Sisal",
            technique="Coiling",
            price_ugx=50000,
            price_usd=12.00,
        )

        self.assertEqual(product.slug, "handwoven-basket")

    def test_product_slug_uses_counter_when_name_conflicts(self):
        Product.objects.create(
            artisan=self.artisan,
            craft_tradition=self.craft_tradition,
            name="Handwoven Basket",
            story="First basket",
            material="Sisal",
            technique="Coiling",
            price_ugx=50000,
            price_usd=12.00,
        )

        duplicate = Product.objects.create(
            artisan=self.artisan,
            craft_tradition=self.craft_tradition,
            name="Handwoven Basket",
            story="Second basket",
            material="Sisal",
            technique="Coiling",
            price_ugx=60000,
            price_usd=14.00,
        )

        self.assertEqual(duplicate.slug, "handwoven-basket-2")

    def test_product_detail_without_provenance_returns_none(self):
        product = Product.objects.create(
            artisan=self.artisan,
            craft_tradition=self.craft_tradition,
            name="Ceramic Cup",
            story="A handcrafted cup",
            material="Clay",
            technique="Throwing",
            price_ugx=30000,
            price_usd=8.00,
            status="active",
        )

        response = get_product(None, product.slug)

        self.assertEqual(response["slug"], product.slug)
        self.assertIsNone(response["provenance"])
