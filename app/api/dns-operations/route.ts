import { NextResponse } from 'next/server'
import dns from 'dns'

export async function POST(req: Request) {
  try {
    const { hostname } = await req.json()

    const { address, family } = await new Promise<{ address: string; family: number }>((resolve, reject) => {
      dns.lookup(hostname, (err, address, family) => {
        if (err) reject(err)
        else resolve({ address, family })
      })
    })

    return NextResponse.json({ address, family })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

