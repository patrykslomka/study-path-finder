import { NextApiRequest, NextApiResponse } from 'next'
import { createEnhancedNlpManager } from '../../lib/enhancedTraining'
import fs from 'fs'
import path from 'path'

const syntheticDataPath = path.join(process.cwd(), 'synthetic_data.json')
const syntheticData = JSON.parse(fs.readFileSync(syntheticDataPath, 'utf8'))

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const nlpManager = await createEnhancedNlpManager(syntheticData)

    // In a production environment, you would save the trained model here
    // For example: await nlpManager.save('model.nlp');

    res.status(200).json({ message: 'NLP model retrained successfully with enhanced data' })
  } catch (error) {
    console.error('Error in retrain-nlp API:', error)
    res.status(500).json({ error: 'An error occurred while retraining the NLP model' })
  }
}

