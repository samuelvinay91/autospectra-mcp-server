# Cloud Deployment Guide for AutoSpectra MCP Server

This guide provides step-by-step instructions for deploying the AutoSpectra MCP Server to a free cloud provider (Render.com) and integrating it with Smithery AI.

## Prerequisites

- A GitHub account (for hosting your repository)
- A [Render.com](https://render.com) account (free tier is sufficient)

## Step 1: Prepare Your Repository

1. Create a GitHub repository for your MCP server (if you haven't already)
2. Push your code to the repository:

```bash
git init
git add .
git commit -m "Initial commit for cloud deployment"
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Step 2: Deploy to Render.com

1. Log in to [Render.com](https://render.com)
2. Click on "New" and select "Web Service"
3. Connect to your GitHub repository
4. Configure the deployment:
   - **Name**: `autospectra-mcp-server` (or any name you prefer)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `NODE_ENV=production npm start`
   - **Plan**: Free

5. Configure Environment Variables:
   - `PORT`: 8080
   - `DEBUG`: false
   - `HEADLESS`: true
   - `SLOW_MO`: 0
   - `OUTPUT_DIR`: ./output

6. Click "Create Web Service"

Render will automatically deploy your application. Once deployment is complete, you'll receive a URL for your service (e.g., `https://autospectra-mcp-server.onrender.com`).

## Step 3: Test Your Deployment

Verify that your deployment works by visiting:
- `https://YOUR_RENDER_URL/health` - Should return a JSON response with status "ok"
- `https://YOUR_RENDER_URL/` - Should show basic info about the server

## Step 4: Integrate with Smithery AI

Now that your server is deployed, you can integrate it with Smithery AI:

1. Log in to your [Smithery AI](https://smithery.ai) account
2. Navigate to "Settings" > "Integrations" > "Add Custom Tool"
3. Fill in the required information:
   - **Name**: autospectra
   - **Display Name**: AutoSpectra Browser Automation
   - **Description**: Browser automation and testing with visible feedback
   - **Endpoint**: Your Render.com URL (e.g., `https://autospectra-mcp-server.onrender.com`)

4. Configure tool schemas as described in the [Smithery Integration Guide](./smithery-integration.md)

## Step 5: Test the Integration

Once configured, test the integration by asking your Smithery AI agent to perform a simple browser automation task:

Example prompt:
```
Navigate to https://example.com and take a screenshot
```

The agent should use the AutoSpectra tools to navigate to the URL and capture a screenshot, returning the results to you.

## Troubleshooting Cloud Deployment

### Common Issues:

1. **Build Failures**:
   - Check your Render logs to see what's failing
   - Make sure all dependencies are properly specified in package.json

2. **Runtime Errors**:
   - Make sure you have the appropriate environment variables set
   - Headless mode must be enabled for cloud environments

3. **Connection Issues with Smithery**:
   - Verify that your Render URL is correct and accessible
   - Check that the tool schemas are correctly defined

4. **Resources Limitations**:
   - Free tier resources are limited; consider upgrading if you experience performance issues

## Maintaining Your Deployment

- Render automatically rebuilds and deploys whenever you push changes to your GitHub repository
- Monitor your application's logs in the Render dashboard
- For production use, consider setting up monitoring and alerts

## Alternative Free Cloud Providers

If Render.com doesn't meet your needs, consider these alternatives:

- [Fly.io](https://fly.io) - Offers a generous free tier
- [Railway](https://railway.app) - Simple deployment with a free tier
- [Heroku](https://heroku.com) - Limited free tier but very reliable

Each has slightly different setup procedures, but the general principles remain the same.
