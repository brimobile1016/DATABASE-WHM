require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./creds.json'); // Pastikan path ini benar!

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Google Sheet
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Fungsi untuk mendapatkan sheet
const getSheet = async () => {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    return doc.sheetsByIndex[0];
};

// Routing Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/check', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'check.html'));
});

app.get('/registrasi', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrasi.html'));
});

app.get('/delete', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'delete.html'));
});

// Endpoint: Cek IP
app.post('/api/check', async (req, res) => {
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
    }, // <-- Kirim hanya data yang diperlukan
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
});

// Endpoint: Registrasi IP
app.post('/api/register', async (req, res) => {
    const { ip } = req.body;

    // Regex untuk memvalidasi format IP (IPv4)
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // Lakukan validasi IP
    if (!ipRegex.test(ip)) {
        return res.status(400).json({ 
            message: `Alamat IP "${ip}" tidak valid. Mohon masukkan format IP yang benar.` 
        });
    }

    try {
        const sheet = await getSheet();
        const rows = await sheet.getRows();
        const existingRow = rows.find(row => row.IP_Address === ip);

        if (existingRow) {
            return res.status(409).json({ message: `IP ${ip} sudah terdaftar.` });
        }
        
        const now = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(now.getDate() + 7);

        const newRow = await sheet.addRow({
            IP_Address: ip,
            Registered_At: now.toLocaleString('id-ID'),
            Expired_At: expirationDate.toLocaleString('id-ID')
        });

        return res.status(200).json({
            status: 'success',
            message: `IP ${ip} berhasil didaftarkan. Berlaku hingga ${newRow.Expired_At}.`,
            data: {
                IP_Address: newRow.IP_Address,
                Registered_At: newRow.Registered_At,
                Expired_At: newRow.Expired_At,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Kesalahan Server Internal.' });
    }
});

// Endpoint: Hapus IP
app.post('/api/delete', async (req, res) => {
    const { ip } = req.body;
    try {
        const sheet = await getSheet();
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
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});