// Debug endpoint to check if environment variable is set
// Visit: https://your-app.vercel.app/api/check-env

export default async function handler(req, res) {
  const hasKey = !!process.env.RESEND_API_KEY;
  const keyLength = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0;
  const keyPrefix = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 5) : 'NONE';
  
  res.status(200).json({
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'local',
    hasResendApiKey: hasKey,
    keyLength: keyLength,
    keyPrefix: keyPrefix,
    expectedPrefix: 're_Jw',
    isCorrect: hasKey && keyLength === 41 && keyPrefix === 're_Jw',
    message: hasKey 
      ? '✅ RESEND_API_KEY is set!' 
      : '❌ RESEND_API_KEY is NOT set! Add it in Vercel dashboard.'
  });
}
