import type { TransactionRecord } from '../context/PhotoboothContext';

/**
 * Mengunduh daftar transaksi dalam format file CSV (.csv) yang kompatibel 100%
 * dengan Microsoft Excel (Windows & Mac) menggunakan UTF-8 BOM byte sequence (\uFEFF).
 */
export function exportTransactionsToExcel(transactions: TransactionRecord[], fileNamePrefix: string = 'Laporan_Keuangan_BaliSnap') {
  if (!transactions || transactions.length === 0) {
    alert('Belum ada data transaksi untuk di-export.');
    return;
  }

  // Header Kolom Excel
  const headers = [
    'No',
    'Tanggal & Waktu',
    'ID Invoice',
    'Nama User / Pemesan',
    'Nama Paket',
    'Kategori Paket',
    'Nominal (Rp)',
    'Metode Pembayaran',
    'Status Pembayaran',
    'Catatan / Keterangan',
  ];

  // Map baris data
  const rows = transactions.map((t, idx) => {
    const amountFormatted = `Rp ${t.amount.toLocaleString('id-ID')}`;
    const dateFormatted = t.date ? `"${t.date}"` : '""';
    const invoiceId = `"${t.id}"`;
    const customerName = `"${(t.customerName || 'Pelanggan Photobooth').replace(/"/g, '""')}"`;
    const packageName = `"${t.packageName.replace(/"/g, '""')}"`;
    const tier = `"${t.packageTier.toUpperCase()}"`;
    const method = `"${t.paymentMethod}"`;
    const status = `"${t.status}"`;
    const note = t.customerNote ? `"${t.customerNote.replace(/"/g, '""')}"` : '""';

    return [
      idx + 1,
      dateFormatted,
      invoiceId,
      customerName,
      packageName,
      tier,
      `"${amountFormatted}"`,
      method,
      status,
      note,
    ].join(';');
  });


  // Gabungkan Header & Data dengan delimiter titik koma (;) khas Excel Indonesia/Europe
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

  // Buat Blob file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Tanggal Hari Ini untuk nama file
  const today = new Date().toISOString().split('T')[0];
  const fullFileName = `${fileNamePrefix}_${today}.csv`;

  // Trigger Download otomatis di browser
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fullFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
