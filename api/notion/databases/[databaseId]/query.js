import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.VITE_NOTION_API_KEY,
})

export default async function handler(req, res) {
  // Enable CORS for all origins  
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { databaseId } = req.query
    
    if (!databaseId) {
      return res.status(400).json({ error: 'Database ID is required' })
    }

    // Transparently proxy the request to Notion API
    const response = await notion.databases.query({
      database_id: databaseId,
      ...req.body
    })

    res.status(200).json(response)

  } catch (error) {
    console.error('Notion API Error:', error)
    res.status(500).json({ 
      error: 'Failed to query database',
      details: error.message 
    })
  }
}