/**
 * EXAMPLE NODE.JS / EXPRESS BACKEND FOR MIDTRANS SNAP INTEGRATION
 * File ini berisi contoh kode backend lengkap untuk menghasilkan Snap Token dan menangani Webhook Notifikasi dari Midtrans.
 */

export const EXPRESS_BACKEND_MIDTRANS_EXAMPLE = `
// server.js (Node.js Express Backend)
const express = require('express');
const cors = require('cors');
const midtransClient = require('midtrans-client');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Inisialisasi Midtrans Snap Client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_SANDBOX !== 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_MIDTRANS_SERVER_KEY',
  clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY || 'YOUR_MIDTRANS_CLIENT_KEY'
});

// 2. Endpoint Pembuatan Snap Token (Dipanggil oleh Frontend React)
app.post('/api/midtrans/create-transaction', async (req, res) => {
  try {
    const { orderId, amount, packageName, customerName, customerEmail } = req.body;

    const parameter = {
      transaction_details: {
        order_id: orderId || \`SNAP-\${Date.now()}\`,
        gross_amount: Number(amount) || 25000,
      },
      item_details: [
        {
          id: packageName.includes('PREMIUM') ? 'tier-premium' : 'tier-basic',
          price: Number(amount) || 25000,
          quantity: 1,
          name: packageName || 'Paket BaliSnap Studio',
        },
      ],
      customer_details: {
        first_name: customerName || 'Pelanggan BaliSnap',
        email: customerEmail || 'customer@balisnap.com',
      },
      credit_card: {
        secure: true,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error('Error Midtrans Transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Endpoint Notification / Webhook Callback dari Midtrans
app.post('/api/midtrans/notification', async (req, res) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(\`Notification received for Order \${orderId}: status \${transactionStatus}\`);

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        // Pembayaran butuh verifikasi manual
      } else if (fraudStatus === 'accept') {
        // Pembayaran Sukses! Aktifkan status Paket User di Database Anda
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      // Pembayaran Batal / Kadaluarsa
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).send(error.message);
  }
});

app.listen(5000, () => console.log('Backend Midtrans berjalan di port 5000'));
`;
