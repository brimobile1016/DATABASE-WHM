import { GoogleSpreadsheet } from 'google-spreadsheet';
import creds from '../../creds.json'; // Pastikan path ini benar!

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

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
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row.IP_Address === ip);

    if (rowToDelete) {
      await rowToDelete.delete();
      return res.status(200).json({
        status: 'success',
        message: `IP ${ip} berhasil dihapus.`,
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
