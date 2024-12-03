import { NextApiRequest, NextApiResponse } from 'next'
import dns from 'dns'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { hostname } = req.body

    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        res.status(500).json({ error: err.message })
      } else {
        res.status(200).json({ address, family })
      }
    })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

