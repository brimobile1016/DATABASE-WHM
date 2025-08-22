import { GoogleSpreadsheet } from 'google-spreadsheet';
import creds from '../../creds.json'; // Pastikan path ini benar!

const SPREADSHEET_ID = 'GANTI_DENGAN_ID_GOOGLE_SHEET_ANDA';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ message: 'IP address diperlukan.' });
  }

  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Asumsikan data berada di sheet pertama

    // Cek apakah IP sudah ada
    const rows = await sheet.getRows();
    const existingRow = rows.find(row => row.IP_Address === ip);

    if (existingRow) {
      return res.status(409).json({ message: `IP ${ip} sudah terdaftar.` });
    }
    
    // Hitung tanggal kedaluwarsa secara otomatis (7 hari dari sekarang)
    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 7); // Tambahkan 7 hari

    // Tambahkan baris baru ke sheet
    const newRow = await sheet.addRow({
      IP_Address: ip,
      Registered_At: now.toLocaleString('id-ID'),
      Expired_At: expirationDate.toLocaleString('id-ID')
    });

    return res.status(200).json({
      status: 'success',
      message: `IP ${ip} berhasil didaftarkan. Berlaku hingga ${newRow.Expired_At}.`,
      data: newRow,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Kesalahan Server Internal.' });
  }
}
