export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.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,   // ← secret, never exposed
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
