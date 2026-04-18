# ⚡ Quick Supabase Setup for Empindu

**15-Minute Migration from SQLite to Production Postgres**

---

## 🎯 **Step-by-Step Setup**

### **Step 1: Create Supabase Project** (5 minutes)

1. Visit https://supabase.com
2. Click "Start your project" → "New Project"
3. Fill in:
   ```
   Name: empindu-production
   Database Password: [generate strong password]
   Region: AWS Africa (Cape Town) ← Best for Uganda latency
   Pricing Plan: Free tier (perfect for launch)
   ```
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

---

### **Step 2: Get Connection String** (2 minutes)

1. In Supabase Dashboard, go to **Settings** (gear icon) → **Database**
2. Copy the **Connection string** (URI mode)
3. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[REF].supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password
5. Replace `[REF]` with your project reference

---

### **Step 3: Update Django Configuration** (3 minutes)

Edit `d:\iks\empindu\backend\.env`:

```env
# OLD (SQLite):
# DATABASE_URL=sqlite:///db.sqlite3

# NEW (Supabase):
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
```

Also update `backend/config/settings/base.py`:

```python
DATABASES = {
    "default": env.db("DATABASE_URL"),  # Remove default fallback
}

# Add connection pooling
CONN_MAX_AGE = 600  # Reuse connections for 10 minutes
```

---

### **Step 4: Install Postgres Driver** (2 minutes)

```powershell
cd d:\iks\empindu\backend
.\.venv\Scripts\Activate.ps1
pip install psycopg[binary] django-environ
```

---

### **Step 5: Run Migrations** (3 minutes)

```powershell
python manage.py migrate
python manage.py createsuperuser
```

Expected output:
```
Operations to perform:
  Apply all migrations: admin, artisans, products, orders, ...
Running migrations:
  Applying artisans.0001_initial... OK
  Applying products.0001_initial... OK
  ...
```

---

### **Step 6: Test Connection** (2 minutes)

```powershell
python manage.py shell
```

In the Python shell:
```python
>>> from artisans.models import Artisan
>>> Artisan.objects.count()
0
>>> Artisan.objects.create(
...     user_id=1,
...     full_name="Test Artisan",
...     community="Kampala",
...     district="Central",
... )
<Artisan: Test Artisan>
>>> exit()
```

If no errors → **SUCCESS!** ✅

---

### **Step 7: Verify in Supabase Dashboard** (1 minute)

1. Go to Supabase Dashboard → **Table Editor**
2. You should see tables:
   - `artisans_artisan`
   - `products_product`
   - `orders_order`
   - etc.
3. Click `artisans_artisan` → See your test record

---

## 🔧 **Troubleshooting**

### Error: "connection refused"
**Cause**: Firewall blocking port 5432

**Fix**: 
- Check Windows Firewall settings
- Allow outbound connections on port 5432

### Error: "password authentication failed"
**Cause**: Wrong password in connection string

**Fix**:
- Reset password in Supabase: Settings → Database → Reset Password
- Update `.env` with new password

### Error: "no such module: psycopg"
**Cause**: Package not installed

**Fix**:
```powershell
pip install psycopg[binary]
```

### Error: "SSL connection required"
**Cause**: Supabase requires SSL

**Fix**: Already configured in Django settings. Just ensure connection string is correct.

---

## 📊 **What You've Gained**

✅ **Production Database** - No more SQLite limitations  
✅ **Automatic Backups** - Daily snapshots, point-in-time recovery  
✅ **Visual Editor** - Edit data like Airtable  
✅ **SQL Editor** - Run queries directly  
✅ **API Auto-generation** - REST endpoints if needed  
✅ **Realtime Ready** - WebSocket support built-in  
✅ **pgvector Ready** - Semantic search when you need it  
✅ **Scaling Built-in** - Grows from free to enterprise seamlessly  

---

## 🎉 **Next Steps**

### Immediate (Today):
1. ✅ Celebrate migration success! 🎉
2. ⏹️ Commit changes to git
3. ⏹️ Deploy to Railway/Render

### This Week:
1. ⏹️ Set up Cloudinary for images
2. ⏹️ Configure PostHog analytics
3. ⏹️ Add Plausible for web stats

### Next Sprint:
1. ⏹️ Implement Meilisearch
2. ⏹️ Add pgvector recommendations
3. ⏹️ Enable realtime order tracking

---

## 💡 **Pro Tips**

### 1. Use Connection Pooler for Production

When deploying to Railway/Render:

```env
# Better for production workloads
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

The pooler manages connections efficiently.

### 2. Enable Row-Level Security (Optional)

For extra security:

```sql
-- Supabase SQL Editor
ALTER TABLE artisans_artisan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON artisans_artisan FOR SELECT
USING (true);

CREATE POLICY "Artisan update own"
ON artisans_artisan FOR UPDATE
USING (auth.uid() = user_id);
```

### 3. Monitor Database Usage

Check Supabase Dashboard → Settings → Usage:
- Database size (free tier: 500MB)
- Monthly active users (free tier: 50K)
- Bandwidth (free tier: 5GB)

### 4. Backup Before Major Changes

```sql
-- Export backup
pg_dump > backup_$(date +%Y%m%d).sql

-- Import if needed
psql < backup_20260321.sql
```

---

## 📞 **Support Resources**

- **Supabase Docs**: https://supabase.com/docs
- **Django + Postgres**: https://docs.djangoproject.com/en/stable/ref/databases/#postgresql-notes
- **Community Discord**: https://discord.supabase.com

---

**Welcome to production-grade infrastructure!** 🚀

**Thrive With Nature** 🌿  
*Empindu*
