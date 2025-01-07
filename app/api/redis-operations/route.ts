import { NextResponse } from 'next/server'
import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL
})

client.on('error', (err) => console.log('Redis Client Error', err))

export async function GET(req: Request) {
  if (!client.isOpen) {
    await client.connect()
  }

  const url = new URL(req.url)
  const key = url.searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 })
  }

  const value = await client.get(key)
  return NextResponse.json({ value })
}

export async function POST(req: Request) {
  if (!client.isOpen) {
    await client.connect()
  }

  const { key, value } = await req.json()

  if (!key || !value) {
    return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
  }

  await client.set(key, value)
  return NextResponse.json({ message: 'Value set successfully' })
}

