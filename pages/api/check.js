import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ message: 'IP address diperlukan.' });
  }

  try {
    const ipData = await kv.get(ip);
    
    if (ipData) {
      const expiresAt = new Date(ipData.expires_at).toLocaleString('id-ID');
      return res.status(200).json({
        status: 'found',
        message: `IP ${ip} ditemukan. Kadaluarsa pada ${expiresAt}.`,
        data: ipData,
      });
    } else {
      return res.status(404).json({
        status: 'not_found',
        message: `IP ${ip} tidak ditemukan.`,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Kesalahan Server Internal.' });
  }
}
