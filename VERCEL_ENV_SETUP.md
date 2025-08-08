# 🚀 Vercel Environment Variables Setup

## Required Environment Variables

You need to add these environment variables in your Vercel dashboard:

### 1. Go to your Vercel project dashboard

- Visit [vercel.com](https://vercel.com)
- Select your project
- Go to **Settings** → **Environment Variables**

### 2. Add these variables:

| Variable Name  | Value                                                                                                                                                | Environment |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_MXr36JpFUfkP@ep-empty-base-a2kztd4u-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | Production  |
| `NODE_ENV`     | `production`                                                                                                                                         | Production  |
| `FRONTEND_URL` | `https://el-fatoura.vercel.app`                                                                                                                      | Production  |

### 3. Redeploy your application

After adding the environment variables:

- Go to **Deployments** tab
- Click on the latest deployment
- Click **Redeploy**

## ✅ Verification Steps

1. **Check Deployment Logs**:

   - Go to your deployment
   - Check the "Functions" tab
   - Look for database connection messages

2. **Expected Log Messages**:

   ```
   ✅ ElFatoura Backend running on port 3000
   🌍 Environment: production
   🔍 Environment Check:
   NODE_ENV: production
   DATABASE_URL: ✅ Set
   ✅ Connected to Neon PostgreSQL database
   ✅ Database connection successful
   ```

3. **Test API Endpoints**:
   - Try accessing: `https://your-app.vercel.app/api/clients/company/1`
   - Should return JSON data, not errors

## 🔧 Troubleshooting

### If you see "DATABASE_URL: ❌ Not set":

1. Double-check environment variables in Vercel
2. Make sure they're set for "Production" environment
3. Redeploy the application

### If you see connection errors:

1. Verify your Neon database is running
2. Check if the connection string is correct
3. Ensure SSL settings are configured properly

### If API calls fail:

1. Check the Functions logs in Vercel
2. Verify CORS settings allow your frontend domain
3. Test with a simple GET request first

## 📝 Notes

- Environment variables are case-sensitive
- Changes require a redeploy to take effect
- Use the exact connection string from your Neon dashboard
- The SSL mode `require` is mandatory for Neon in production
