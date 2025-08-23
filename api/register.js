import { GoogleSpreadsheet } from 'google-spreadsheet';

const creds = JSON.parse(process.env.GOOGLE_CREDS);
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

const getSheet = async () => {
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  return doc.sheetsByIndex[0];
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { ip } = req.body;
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) return res.status(400).json({ message: 'IP tidak valid' });

  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    if (rows.find(row => row.IP_Address === ip))
      return res.status(409).json({ message: 'IP sudah terdaftar' });

    const now = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(now.getDate() + 7);

    const newRow = await sheet.addRow({
      IP_Address: ip,
      Registered_At: now.toLocaleString('id-ID'),
      Expired_At: expirationDate.toLocaleString('id-ID'),
    });

    return res.status(200).json({
      status: 'success',
      message: `IP ${ip} berhasil didaftarkan`,
      data: newRow,
    });
  } catch (error) {
    console.error('Error register:', error);
    return res.status(500).json({ message: 'Kesalahan Server Internal' });
  }
}
