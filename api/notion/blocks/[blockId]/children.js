import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.VITE_NOTION_API_KEY,
})

export default async function handler(req, res) {
  // Enable CORS
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { blockId } = req.query
    
    if (!blockId) {
      return res.status(400).json({ error: 'Block ID is required' })
    }

    // Transparently proxy the request to Notion API
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100
    })

    res.status(200).json(response)

  } catch (error) {
    console.error('Notion API Error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch block children',
      details: error.message 
    })
  }
}