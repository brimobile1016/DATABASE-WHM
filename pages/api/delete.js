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
    const deleted = await kv.del(ip);
    
    if (deleted > 0) {
      return res.status(200).json({
        status: 'success',
        message: `IP ${ip} berhasil dihapus.`,
      });
    } else {
      return res.status(404).json({
        status: 'not_found',
        message: `IP ${ip} tidak ditemukan, tidak ada yang dihapus.`,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Kesalahan Server Internal.' });
  }
}
