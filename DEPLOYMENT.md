# Vercel Environment Variables Setup Guide

For Vercel deployment, make sure to set these environment variables in your Vercel dashboard:

## Required Environment Variables:

1. **NOTION_API_KEY**
   - Value: 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
   - Used by serverless functions to authenticate with Notion API

2. **NOTION_DATABASE_ID**
   - Value: 22e64c0b-37ed-80d3-bf96-e7fcea7efa10
   - The ID of your Notion database containing blog posts

## Frontend Environment Variables (already in .env):

1. **VITE_NOTION_API_KEY** (for development)
2. **VITE_NOTION_DATABASE_ID** (for development)

## Deployment Steps:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the two required variables above
4. Deploy your project

## File Structure:

The following serverless functions handle CORS-free API access:

- `/api/notion/databases/[databaseId]/query.js` - Handles blog post queries
- `/api/notion/blocks/[blockId]/children.js` - Handles blog content retrieval

## How it works:

- **Development**: Vite proxy routes `/api/notion/*` to Notion API with proper headers
- **Production**: Vercel serverless functions handle API calls, avoiding CORS issues