import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 1. Check for authorization
  const { secret } = request.query;
  if (secret !== process.env.CRON_SECRET) {
    return response.status(401).json({ message: 'Unauthorized' });
  }

  // 2. Fetch the deploy hook
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    console.error('VERCEL_DEPLOY_HOOK_URL is not set.');
    return response.status(500).json({ message: 'Deploy hook URL not configured.' });
  }

  try {
    console.log('Triggering new deployment via deploy hook...');
    const deployResponse = await fetch(deployHookUrl, { method: 'POST' });
    if (!deployResponse.ok) {
      const errorBody = await deployResponse.text();
      throw new Error(`Deploy hook failed with status ${deployResponse.status}: ${errorBody}`);
    }
    const result = await deployResponse.json();
    console.log('Deployment triggered successfully:', result);
    return response.status(200).json({ message: 'Deployment triggered successfully.', result });
  } catch (error) {
    console.error('Failed to trigger deployment:', error);
    return response.status(500).json({ message: 'Failed to trigger deployment.' });
  }
}
