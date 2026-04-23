"""
Management command to populate database with sample data
Usage: python manage.py load_sample_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.artisans.models import CraftTradition, Artisan
from apps.products.models import Product

User = get_user_model()

CRAFT_TRADITIONS = [
    {
        "name": "Kiganda Basket Weaving",
        "ethnic_group": "Baganda",
        "region": "Central Uganda",
        "description": "Traditional weaving technique using natural sisal fibers. The craft has been passed down through generations in Kampala and surrounding districts.",
    },
    {
        "name": "Acholi Pottery",
        "ethnic_group": "Acholi",
        "region": "Northern Uganda",
        "description": "Hand-molded pottery with intricate patterns. Acholi women have perfected this craft for centuries, creating functional and ceremonial vessels.",
    },
    {
        "name": "Ankole Cattle Hide Craft",
        "ethnic_group": "Banyankole",
        "region": "Western Uganda",
        "description": "Traditional leather working using cattle hides. The Ankole people are known for their exceptional leatherwork and hide processing.",
    },
]

ARTISANS = [
    {
        "username": "grace_weaver",
        "email": "grace@empindu.com",
        "first_name": "Grace",
        "last_name": "Nakamatte",
        "craft_tradition": 0,  # Kiganda Basket
        "slug": "grace-nakamatte",
        "bio": "I am a master basket weaver with over 15 years of experience. I use only natural sisal fibers sourced sustainably from my family land in Kampala.",
        "community": "Kampala",
        "district": "Kampala",
        "phone": "+256701234567",
        "years_experience": 15,
    },
    {
        "username": "james_potter",
        "email": "james@empindu.com",
        "first_name": "James",
        "last_name": "Okello",
        "craft_tradition": 1,  # Acholi Pottery
        "slug": "james-okello",
        "bio": "Third generation potter from Gulu. I create handmade pottery using traditional Acholi techniques that have been in my family for generations.",
        "community": "Gulu",
        "district": "Gulu",
        "phone": "+256702345678",
        "years_experience": 20,
    },
    {
        "username": "aida_leather",
        "email": "aida@empindu.com",
        "first_name": "Aida",
        "last_name": "Mugisa",
        "craft_tradition": 2,  # Ankole Leather
        "slug": "aida-mugisa",
        "bio": "Specialized in traditional Ankole leather crafting. Each piece is unique and tells the story of our heritage and sustainable practices.",
        "community": "Mbarara",
        "district": "Mbarara",
        "phone": "+256703456789",
        "years_experience": 12,
    },
]

PRODUCTS = [
    # Grace's Baskets
    {
        "artisan_idx": 0,
        "craft_tradition": 0,
        "slug": "kiganda-basket-round-large",
        "name": "Large Round Kiganda Storage Basket",
        "story": "This large round basket is hand-woven using the traditional Kiganda coiling technique. Perfect for storing grains, fabrics, or decorative use. Each basket takes 5-7 days to complete and uses only natural sisal fiber.",
        "material": "Natural sisal fiber from family land",
        "technique": "Kiganda coiling - 3-strand plait with tight weave",
        "days_to_make": 7,
        "price_ugx": 250000,
        "price_usd": 65,
        "stock": 3,
    },
    {
        "artisan_idx": 0,
        "craft_tradition": 0,
        "slug": "kiganda-basket-decorative-small",
        "name": "Small Decorative Kiganda Basket",
        "story": "A beautiful small basket ideal for decorating your home or office. This design features a tighter weave and is perfect for storing jewelry, coins, or as a table centerpiece.",
        "material": "Natural sisal fiber",
        "technique": "Kiganda coiling with decorative patterns",
        "days_to_make": 3,
        "price_ugx": 120000,
        "price_usd": 30,
        "stock": 8,
    },
    {
        "artisan_idx": 0,
        "craft_tradition": 0,
        "slug": "kiganda-basket-market",
        "name": "Traditional Market Basket",
        "story": "The classic market basket used in Uganda for generations. Strong enough for daily market trips while remaining lightweight. Handmade using techniques that have been perfected over centuries.",
        "material": "Reinforced natural sisal",
        "technique": "Double-weave Kiganda coiling",
        "days_to_make": 5,
        "price_ugx": 180000,
        "price_usd": 45,
        "stock": 5,
    },
    # James's Pottery
    {
        "artisan_idx": 1,
        "craft_tradition": 1,
        "slug": "acholi-pot-cooking",
        "name": "Traditional Acholi Cooking Pot",
        "story": "Hand-molded cooking pot using ancient Acholi techniques. Perfect for traditional cooking methods or as a cultural art piece. The shape is designed for optimal heat distribution.",
        "material": "Natural clay from Acholi region",
        "technique": "Hand-molding with hand-painted patterns",
        "days_to_make": 4,
        "price_ugx": 200000,
        "price_usd": 50,
        "stock": 4,
    },
    {
        "artisan_idx": 1,
        "craft_tradition": 1,
        "slug": "acholi-pot-decorative",
        "name": "Decorative Acholi Art Pot",
        "story": "A stunning decorative piece featuring intricate Acholi patterns. Each pot is unique with hand-painted geometric designs that represent cultural stories and traditions.",
        "material": "Natural clay with natural pigments",
        "technique": "Hand-molding with burnished finish",
        "days_to_make": 6,
        "price_ugx": 280000,
        "price_usd": 70,
        "stock": 2,
    },
    {
        "artisan_idx": 1,
        "craft_tradition": 1,
        "slug": "acholi-vessel-water",
        "name": "Traditional Water Storage Vessel",
        "story": "Large vessel traditionally used for water storage. Features a wide mouth for easy filling and pouring. The clay composition helps keep water cool naturally.",
        "material": "High-quality clay with cooling properties",
        "technique": "Traditional hand-molding",
        "days_to_make": 5,
        "price_ugx": 150000,
        "price_usd": 38,
        "stock": 3,
    },
    # Aida's Leather
    {
        "artisan_idx": 2,
        "craft_tradition": 2,
        "slug": "ankole-leather-bag",
        "name": "Authentic Ankole Hide Shoulder Bag",
        "story": "Handcrafted using traditional Ankole leather techniques. This shoulder bag combines functionality with cultural authenticity. The hide is sustainably sourced and processed using traditional methods.",
        "material": "Authentic Ankole cattle hide",
        "technique": "Traditional leather tanning and hand-stitching",
        "days_to_make": 8,
        "price_ugx": 350000,
        "price_usd": 90,
        "stock": 2,
    },
    {
        "artisan_idx": 2,
        "craft_tradition": 2,
        "slug": "ankole-leather-sandals",
        "name": "Handmade Ankole Leather Sandals",
        "story": "Comfortable sandals made from Ankole hide leather. Each pair is custom-fitted and features traditional stitching patterns. Perfect for daily wear or cultural events.",
        "material": "Ankole cattle hide leather",
        "technique": "Hand-cut and hand-stitched",
        "days_to_make": 4,
        "price_ugx": 180000,
        "price_usd": 45,
        "stock": 6,
    },
    {
        "artisan_idx": 2,
        "craft_tradition": 2,
        "slug": "ankole-leather-belt",
        "name": "Traditional Ankole Hide Belt",
        "story": "A sturdy belt crafted from premium Ankole hide. Features traditional buckle and decorative stitching. Durable enough for daily wear and adds authentic character to any outfit.",
        "material": "Premium Ankole cattle hide",
        "technique": "Traditional tanning and hand-stitching",
        "days_to_make": 3,
        "price_ugx": 120000,
        "price_usd": 30,
        "stock": 8,
    },
]


class Command(BaseCommand):
    help = "Load sample craft traditions, artisans, and products into the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing artisans and products before loading",
        )

    def handle(self, *args, **options):
        if options.get("clear"):
            self.stdout.write("Clearing existing data...")
            Artisan.objects.all().delete()
            User.objects.filter(username__in=[a["username"] for a in ARTISANS]).delete()
            Product.objects.all().delete()

        # Create Craft Traditions
        self.stdout.write("Creating craft traditions...")
        traditions = []
        for trad_data in CRAFT_TRADITIONS:
            tradition, created = CraftTradition.objects.get_or_create(
                name=trad_data["name"],
                defaults={
                    "ethnic_group": trad_data["ethnic_group"],
                    "region": trad_data["region"],
                    "description": trad_data["description"],
                },
            )
            traditions.append(tradition)
            status = "created" if created else "exists"
            self.stdout.write(f"  ✓ {tradition.name} ({status})")

        # Create Artisans
        self.stdout.write("\nCreating artisans...")
        artisans = []
        for artisan_data in ARTISANS:
            user, user_created = User.objects.get_or_create(
                username=artisan_data["username"],
                defaults={
                    "email": artisan_data["email"],
                    "first_name": artisan_data["first_name"],
                    "last_name": artisan_data["last_name"],
                },
            )
            if user_created:
                user.set_password("password123")
                user.save()

            artisan, created = Artisan.objects.get_or_create(
                user=user,
                defaults={
                    "slug": artisan_data["slug"],
                    "craft_tradition": traditions[artisan_data["craft_tradition"]],
                    "bio": artisan_data["bio"],
                    "community": artisan_data["community"],
                    "district": artisan_data["district"],
                    "phone": artisan_data["phone"],
                    "years_experience": artisan_data["years_experience"],
                    "onboarded_via": "web",
                    "is_active": True,
                },
            )
            artisans.append(artisan)
            status = "created" if created else "exists"
            self.stdout.write(
                f"  ✓ {artisan.full_name} - {artisan.craft_tradition.name} ({status})"
            )

        # Create Products
        self.stdout.write("\nCreating products...")
        for product_data in PRODUCTS:
            artisan = artisans[product_data["artisan_idx"]]
            product, created = Product.objects.get_or_create(
                slug=product_data["slug"],
                defaults={
                    "artisan": artisan,
                    "craft_tradition": traditions[product_data["craft_tradition"]],
                    "name": product_data["name"],
                    "story": product_data["story"],
                    "material": product_data["material"],
                    "technique": product_data["technique"],
                    "days_to_make": product_data["days_to_make"],
                    "price_ugx": product_data["price_ugx"],
                    "price_usd": product_data["price_usd"],
                    "stock": product_data["stock"],
                    "status": "active",
                },
            )
            status = "created" if created else "exists"
            self.stdout.write(f"  ✓ {product.name} ({status})")

        self.stdout.write(
            self.style.SUCCESS(
                "\n✅ Sample data loaded successfully!\n"
                "Admin URL: http://localhost:8000/admin\n"
                "API Docs: http://localhost:8000/api/v1/docs"
            )
        )
