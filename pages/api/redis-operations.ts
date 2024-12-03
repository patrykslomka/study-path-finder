import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis'

// Create a Redis client
const client = createClient({
  url: process.env.REDIS_URL
})

client.on('error', (err) => console.log('Redis Client Error', err))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!client.isOpen) {
    await client.connect()
  }

  if (req.method === 'GET') {
    // Example: Get a value from Redis
    const value = await client.get(req.query.key as string)
    res.status(200).json({ value })
  } else if (req.method === 'POST') {
    // Example: Set a value in Redis
    await client.set(req.body.key, req.body.value)
    res.status(200).json({ message: 'Value set successfully' })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

