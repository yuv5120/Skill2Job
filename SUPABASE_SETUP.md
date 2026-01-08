# Supabase Integration Guide

## 🚀 Overview

This project is now integrated with Supabase PostgreSQL database. Supabase provides a fully managed PostgreSQL database with additional features like real-time subscriptions, authentication, storage, and more.

## 📋 Configuration

### Database Connection

The project uses **Prisma** ORM to interact with Supabase PostgreSQL. Two connection strings are configured:

- **DATABASE_URL**: Main connection string for Prisma
- **DIRECT_URL**: Direct connection for migrations and commands

### Environment Variables

#### Server (`/server/.env`)
```env
DATABASE_URL=postgresql://postgres:RAGan0MSOAktAZgc@db.ybbilytsbgcqvwyegagr.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:RAGan0MSOAktAZgc@db.ybbilytsbgcqvwyegagr.supabase.co:5432/postgres
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
ML_SERVICE_URL=http://localhost:8000
PORT=3000
NODE_ENV=development
```

#### Client (`/client/.env`)
```env
VITE_SUPABASE_URL=https://ybbilytsbgcqvwyegagr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other Firebase config
VITE_API_URL=http://localhost:3000
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install @supabase/supabase-js
```

### 2. Generate Prisma Client

```bash
cd server
npx prisma generate
```

### 3. Run Database Migrations

```bash
cd server
npx prisma migrate deploy
```

### 4. (Optional) Push Schema to Database

If you make schema changes:

```bash
cd server
npx prisma db push
```

### 5. Verify Connection

```bash
cd server
npx prisma studio
```

This opens Prisma Studio to view and edit your database.

## 📊 Database Schema

The project has two main tables:

### Resume Table
```prisma
model Resume {
  id         String   @id @default(cuid())
  userId     String
  name       String
  email      String
  skills     String[]  
  experience String
  createdAt  DateTime @default(now())
}
```

### Job Table
```prisma
model Job {
  id          String   @id @default(uuid())
  title       String
  description String
  skills      String[]
  createdAt   DateTime @default(now())
  postedBy    String
}
```

## 🔐 Supabase Features

### 1. Direct Database Access

Use Supabase Dashboard to:
- View and edit data
- Run SQL queries
- Monitor performance
- Set up database backups

Access: https://supabase.com/dashboard/project/ybbilytsbgcqvwyegagr

### 2. Real-time Subscriptions (Optional)

The Supabase client is configured for real-time features:

```typescript
import { supabase } from './supabaseClient';

// Subscribe to Resume changes
const subscription = supabase
  .channel('resumes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'Resume' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

### 3. Row Level Security (RLS)

To enable RLS on Supabase:

1. Go to Database → Tables
2. Select a table
3. Enable RLS
4. Create policies

Example policy for Resume table:
```sql
-- Users can only see their own resumes
CREATE POLICY "Users can view own resumes"
ON "Resume"
FOR SELECT
USING (auth.uid() = "userId");

-- Users can insert their own resumes
CREATE POLICY "Users can insert own resumes"
ON "Resume"
FOR INSERT
WITH CHECK (auth.uid() = "userId");
```

## 🚀 Deployment

### GitHub Actions Setup

Add these secrets to your GitHub repository:
- `SUPABASE_DATABASE_URL`: Your Supabase connection string
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key

### Production Deployment

For production, consider using Supabase connection pooling:

1. In Supabase Dashboard, go to Database → Connection Pooling
2. Enable connection pooling
3. Use the pooled connection string for `DATABASE_URL`
4. Keep the direct connection string for `DIRECT_URL`

```env
# Production with connection pooling
DATABASE_URL=postgresql://postgres.ybbilytsbgcqvwyegagr:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:password@db.ybbilytsbgcqvwyegagr.supabase.co:5432/postgres
```

## 🔍 Monitoring & Maintenance

### Database Health

Monitor your database in Supabase Dashboard:
- **Database** → **Reports**: View query performance
- **Database** → **Roles**: Manage database users
- **Database** → **Extensions**: Enable PostGIS, pgvector, etc.

### Backups

Supabase provides:
- Daily automatic backups (retained for 7 days on free tier)
- Point-in-time recovery (paid plans)
- Manual backup via `pg_dump`:

```bash
pg_dump "postgresql://postgres:RAGan0MSOAktAZgc@db.ybbilytsbgcqvwyegagr.supabase.co:5432/postgres" > backup.sql
```

### Migrations

Create new migrations when changing schema:

```bash
cd server
npx prisma migrate dev --name description_of_change
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

## ⚠️ Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment-specific credentials** - Different for dev/staging/prod
3. **Enable RLS** - Protect your data at the database level
4. **Rotate keys regularly** - Update API keys and database passwords
5. **Monitor access logs** - Check Supabase dashboard for suspicious activity

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test database connection
cd server
npx prisma db pull
```

### Schema Sync Issues

```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or push schema without migration
npx prisma db push --skip-generate
```

### Client Connection Errors

Check that environment variables are loaded:
```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has API Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## 📞 Support

- Supabase Discord: https://discord.supabase.com
- Prisma Discord: https://pris.ly/discord
- Project Issues: Create an issue in your repository
