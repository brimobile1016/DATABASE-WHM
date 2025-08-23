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
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    const foundRow = rows.find(row => row.IP_Address === ip);

    if (foundRow) {
      return res.status(200).json({
        status: 'found',
        message: `IP ${ip} ditemukan. Kadaluarsa pada ${foundRow.Expired_At}.`,
        data: {
          IP_Address: foundRow.IP_Address,
          Registered_At: foundRow.Registered_At,
          Expired_At: foundRow.Expired_At,
        },
      });
    } else {
      return res.status(404).json({ status: 'not_found', message: `IP ${ip} tidak ditemukan.` });
    }
  } catch (error) {
    console.error('Error check:', error);
    return res.status(500).json({ message: 'Kesalahan Server Internal' });
  }
}
