import { useState } from 'react'

export function DnsLookup() {
  const [hostname, setHostname] = useState('')
  const [result, setResult] = useState<{ address?: string; family?: number } | null>(null)

  const handleLookup = async () => {
    try {
      const response = await fetch('/api/dns-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostname }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={hostname}
        onChange={(e) => setHostname(e.target.value)}
        placeholder="Enter hostname"
      />
      <button onClick={handleLookup}>Lookup</button>
      {result && (
        <div>
          <p>Address: {result.address}</p>
          <p>Family: {result.family}</p>
        </div>
      )}
    </div>
  )
}

