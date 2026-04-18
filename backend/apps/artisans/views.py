"""
Landing Page View - Simple welcome page
Thrive With Nature
"""
from django.http import HttpResponse


def landing_page(request):
    """Simple welcome page until Next.js frontend is migrated"""
    return HttpResponse("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Empindu - Thrive With Nature</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #2D6A4F 0%, #1B3A2A 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #F0FAF3;
        }
        .container {
            text-align: center;
            padding: 3rem;
            max-width: 800px;
        }
        h1 {
            font-size: 4rem;
            margin-bottom: 1rem;
            font-weight: 700;
            letter-spacing: -0.02em;
        }
        .tagline {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .links {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 2rem;
        }
        .link-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;
            width: 280px;
        }
        .link-card:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
        }
        .link-card h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
        }
        .link-card p {
            font-size: 0.875rem;
            opacity: 0.8;
        }
        .status {
            margin-top: 3rem;
            padding: 1rem;
            background: rgba(82, 183, 136, 0.2);
            border-radius: 8px;
            border-left: 4px solid #52B788;
        }
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #52B788;
            color: #0D1F16;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>EMPINDU</h1>
        <p class="tagline">Thrive With Nature 🌿</p>
        
        <div class="status">
            <span class="badge">SPRINT 2 COMPLETE</span>
            <p><strong>Django Backend Foundation Ready</strong></p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">
                Core models, API endpoints, and admin interface deployed successfully.
            </p>
        </div>

        <div class="links">
            <a href="/admin/" class="link-card">
                <h3>🎛️ Admin Panel</h3>
                <p>Manage artisans, products, and heritage fund with Unfold admin</p>
            </a>
            
            <a href="/api/v1/docs" class="link-card">
                <h3>📖 API Documentation</h3>
                <p>Interactive Swagger/OpenAPI docs for all endpoints</p>
            </a>
            
            <a href="/api/v1/artisans/" class="link-card">
                <h3>👨‍🎨 Artisans API</h3>
                <p>Browse artisan profiles and craft traditions</p>
            </a>
            
            <a href="/api/v1/products/" class="link-card">
                <h3>🧺 Products API</h3>
                <p>Story-first product catalogue with provenance</p>
            </a>
        </div>

        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="font-size: 0.875rem; opacity: 0.7;">
                <strong>Next Steps:</strong> Migrate React components to Next.js (Sprint 3-4)
            </p>
            <p style="font-size: 0.75rem; opacity: 0.5; margin-top: 0.5rem;">
                Built with Django 5 • Ninja API • Unfold Admin<br>
                empindu.lovable.app
            </p>
        </div>
    </div>
</body>
</html>
""")
