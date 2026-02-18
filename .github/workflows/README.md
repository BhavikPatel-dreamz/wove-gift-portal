# GitHub Actions Cron Setup

This project uses GitHub Actions to handle scheduled cron jobs instead of Vercel's cron functionality, allowing for more frequent execution on the free tier.

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your GitHub repository settings → Secrets and variables → Actions, and add these secrets:

#### Required Secrets:
- **`VERCEL_URL`**: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- **`CRON_SECRET`**: A secure secret key for authenticating cron requests (same as your Vercel environment variable)

### 2. Environment Variables on Vercel

Make sure your Vercel deployment has the `CRON_SECRET` environment variable set to the same value as the GitHub secret.

### 3. Schedule Overview

The GitHub Actions are configured with these schedules:

| Job | Schedule | Description |
|-----|----------|-------------|
| **Voucher Processor** | Every 30 minutes (`*/30 * * * *`) | Processes voucher queue |
| **Notification Processor** | Every 30 minutes, offset by 10 min (`10,40 * * * *`) | Handles notifications |
| **Scheduled Reports** | Every hour at :15 (`15 * * * *`) | Generates and sends reports |

### 4. Manual Triggering

You can manually trigger the workflows:
1. Go to GitHub → Actions tab
2. Select "Scheduled Cron Jobs"
3. Click "Run workflow"
4. Choose which job to run (or "all")

### 5. Monitoring

- Check the Actions tab for execution logs
- Failed jobs will appear as failed workflow runs
- Each job includes error handling and logging

## Benefits over Vercel Cron

- ✅ **More frequent execution** (every 30 minutes vs daily limit)
- ✅ **Better timing precision** (exact scheduling)
- ✅ **Free tier support** (GitHub Actions free tier is generous)
- ✅ **Manual triggering** capability
- ✅ **Detailed logs** and monitoring
- ✅ **Independent scaling** (doesn't affect your Vercel deployment)

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check that `CRON_SECRET` matches between GitHub and Vercel
2. **404 Not Found**: Verify `VERCEL_URL` is correct and deployment is live
3. **Timeout errors**: API endpoints have 300-second timeout, check for long-running processes

### Debugging:
- Check GitHub Actions logs for detailed error messages
- Verify your Vercel deployment logs for API endpoint errors
- Test endpoints manually using curl with the same headers