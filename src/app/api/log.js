import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, level = 'info', metadata = {} } = req.body;

  try {
    await axios.post(
      'http://localhost:8000/services/collector',
      {
        event: {
          message,
          level,
          app: 'nextjs',
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        sourcetype: '_json', 
      },
      {
        headers: {
          Authorization: `Splunk d7750248-675e-4bae-9822-89353f7f4a4a`,  
        },
      }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Splunk log error:', error);
    res.status(500).json({ error: 'Failed to send log to Splunk' });
  }
}