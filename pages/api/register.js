import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { ip, days } = req.body;

  if (!ip || !days) {
    return res.status(400).json({ message: 'IP dan masa berlaku diperlukan.' });
  }

  const daysInSeconds = parseInt(days, 10) * 24 * 60 * 60;
  const now = new Date();
  const expirationDate = new Date(now.getTime() + daysInSeconds * 1000);

  try {
    const ipData = {
      registered_at: now.toISOString(), // Tanggal registrasi
      expires_at: expirationDate.toISOString() // Tanggal kadaluarsa
    };

    // Gunakan Vercel KV's 'EX' untuk otomatis menghapus setelah waktu tertentu
    await kv.set(ip, ipData, { ex: daysInSeconds });
    
    return res.status(200).json({
      status: 'success',
      message: `IP ${ip} berhasil didaftarkan. Berlaku hingga ${expirationDate.toLocaleString('id-ID')}.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Kesalahan Server Internal.' });
  }
}
