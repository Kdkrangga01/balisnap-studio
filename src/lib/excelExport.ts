import ExcelJS from 'exceljs';
import type { TransactionRecord } from '../context/PhotoboothContext';

/**
 * Mengunduh daftar transaksi sebagai file Excel (.xlsx) ASLI — bukan CSV yang
 * disamarkan — lengkap dengan:
 *  - Header berwarna & bold, lebar kolom otomatis pas
 *  - Foto bukti bayar ter-EMBED langsung di dalam cell (bukan cuma link)
 *  - Format rupiah rapi (Rp 135.000)
 *  - Baris ringkasan (total omset & jumlah transaksi per paket) di bagian bawah,
 *    dikemas dalam kotak terpisah biar jelas dan rapi
 *  - Filter otomatis di header (bisa langsung sort/filter di Excel)
 *
 * Catatan: fungsi ini ASYNC karena proses generate file + embed gambar makan
 * waktu sedikit lebih lama dibanding CSV biasa, terutama kalau transaksinya
 * banyak / bukti bayarnya beresolusi besar.
 */
export async function exportTransactionsToExcel(
  transactions: TransactionRecord[],
  fileNamePrefix: string = 'Laporan_Keuangan_BaliSnap'
): Promise<void> {
  if (!transactions || transactions.length === 0) {
    alert('Belum ada data transaksi untuk di-export.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BaliSnap Studio';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Laporan Transaksi', {
    views: [{ state: 'frozen', ySplit: 1 }], // Baris header selalu kelihatan pas di-scroll
  });

  const TOTAL_COLUMNS = 11;

  // ===== DEFINISI KOLOM =====
  sheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Tanggal & Waktu', key: 'date', width: 20 },
    { header: 'ID Invoice', key: 'invoice', width: 16 },
    { header: 'Nama User / Pemesan', key: 'customer', width: 24 },
    { header: 'Nama Paket', key: 'packageName', width: 32 },
    { header: 'Kategori', key: 'tier', width: 13 },
    { header: 'Bukti Bayar', key: 'proof', width: 18 },
    { header: 'Nominal', key: 'amount', width: 16 },
    { header: 'Metode Pembayaran', key: 'method', width: 20 },
    { header: 'Status', key: 'status', width: 13 },
    { header: 'Catatan / Keterangan', key: 'note', width: 34 },
  ];

  // ===== STYLE HEADER =====
  const headerRow = sheet.getRow(1);
  headerRow.height = 34; // dilebarkan supaya judul kolom 2-baris tidak kepotong
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF52247A' } },
      bottom: { style: 'thin', color: { argb: 'FF52247A' } },
      left: { style: 'thin', color: { argb: 'FF52247A' } },
      right: { style: 'thin', color: { argb: 'FF52247A' } },
    };
  });

  // ===== ISI BARIS DATA + EMBED FOTO BUKTI BAYAR =====
  const PROOF_COL_INDEX = sheet.getColumn('proof').number - 1; // 0-based, untuk posisi gambar
  // ExcelJS cuma bisa embed format raster: jpeg, png, gif — SVG atau format
  // lain TIDAK didukung dan akan menampilkan ikon "gambar rusak" kalau dipaksa.
  const SUPPORTED_EXT = new Set(['jpeg', 'jpg', 'png', 'gif']);

  let totalRevenue = 0;
  let premiumCount = 0;
  let basicCount = 0;

  transactions.forEach((t, idx) => {
    const rowIndex = idx + 2; // baris 1 = header
    const row = sheet.getRow(rowIndex);

    row.getCell('no').value = idx + 1;
    row.getCell('date').value = t.date || '-';
    row.getCell('invoice').value = t.id;
    row.getCell('customer').value = t.customerName || 'Pelanggan Photobooth';
    row.getCell('packageName').value = t.packageName;
    row.getCell('tier').value = (t.packageTier || '-').toUpperCase();
    row.getCell('amount').value = t.amount;
    row.getCell('amount').numFmt = '"Rp" #,##0';
    row.getCell('method').value = t.paymentMethod;
    row.getCell('status').value = t.status;
    row.getCell('note').value = t.customerNote || '-';

    row.height = 74; // beri ruang cukup supaya thumbnail foto kelihatan jelas
    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        left: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        right: { style: 'thin', color: { argb: 'FFE4E4E7' } },
      };
    });

    // Warna selang-seling antar baris biar gampang dibaca
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F5FF' } };
      });
    }

    // Warna status: hijau kalau Lunas, merah kalau Pending
    const statusCell = row.getCell('status');
    statusCell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: t.status === 'Lunas' ? 'FF15803D' : 'FFB91C1C' },
    };
    statusCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Rekap total untuk ringkasan di bawah nanti
    totalRevenue += t.amount || 0;
    if (t.packageTier === 'premium') premiumCount++;
    if (t.packageTier === 'basic') basicCount++;

    // ===== EMBED FOTO BUKTI BAYAR LANGSUNG KE DALAM CELL =====
    const proofCell = row.getCell('proof');
    proofCell.alignment = { vertical: 'middle', horizontal: 'center' };

    if (t.paymentProofUrl && t.paymentProofUrl.startsWith('data:image/')) {
      const match = t.paymentProofUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
      const rawExt = match ? match[1].toLowerCase() : '';

      if (SUPPORTED_EXT.has(rawExt)) {
        try {
          const ext: 'jpeg' | 'png' | 'gif' = rawExt === 'jpg' ? 'jpeg' : (rawExt as 'jpeg' | 'png' | 'gif');
          const imageId = workbook.addImage({ base64: t.paymentProofUrl, extension: ext });
          sheet.addImage(imageId, {
            tl: { col: PROOF_COL_INDEX + 0.08, row: rowIndex - 1 + 0.08 },
            ext: { width: 95, height: 62 },
            editAs: 'oneCell',
          });
        } catch (err) {
          console.warn(`Gagal embed foto bukti bayar untuk invoice ${t.id}:`, err);
          proofCell.value = '⚠ Gagal memuat foto';
          proofCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FFB91C1C' } };
        }
      } else {
        // Format tidak didukung (mis. SVG) — tampilkan keterangan rapi,
        // bukan ikon gambar rusak.
        proofCell.value = `⚠ Format .${rawExt || '?'} tidak didukung`;
        proofCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FFB45309' } };
      }
    } else {
      proofCell.value = '-';
    }
  });

  // ===== BARIS RINGKASAN / SUMMARY DI BAGIAN BAWAH (dikemas dalam kotak) =====
  const totalCount = transactions.length;
  const summaryStartRow = transactions.length + 3; // 1 baris kosong sebagai jarak dari tabel

  // Judul kotak ringkasan — banner ungu selebar tabel
  const titleRow = sheet.getRow(summaryStartRow);
  sheet.mergeCells(summaryStartRow, 1, summaryStartRow, TOTAL_COLUMNS);
  const titleCell = titleRow.getCell(1);
  titleCell.value = '📊  RINGKASAN LAPORAN';
  titleCell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  titleRow.height = 24;

  const summaryData: { label: string; value: string; highlight?: boolean }[] = [
    { label: 'Total Transaksi', value: `${totalCount} transaksi` },
    {
      label: 'Paket PREMIUM VIP Terjual',
      value: `${premiumCount} transaksi  (Rp ${(premiumCount * 135000).toLocaleString('id-ID')})`,
    },
    {
      label: 'Paket BASIC Terjual',
      value: `${basicCount} transaksi  (Rp ${(basicCount * 25000).toLocaleString('id-ID')})`,
    },
    { label: 'TOTAL OMSET PENJUALAN', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, highlight: true },
  ];

  summaryData.forEach((item, i) => {
    const rowNum = summaryStartRow + 1 + i;
    const r = sheet.getRow(rowNum);
    r.height = item.highlight ? 26 : 20;

    // Kolom label: B sampai E (merge)
    sheet.mergeCells(rowNum, 2, rowNum, 5);
    const labelCell = r.getCell(2);
    labelCell.value = item.label;
    labelCell.font = {
      name: 'Arial',
      bold: true,
      size: item.highlight ? 12 : 10,
      color: { argb: item.highlight ? 'FF15803D' : 'FF3F3F46' },
    };
    labelCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // Kolom value: G sampai K (merge) — terpisah dari kolom label, tidak tabrakan
    sheet.mergeCells(rowNum, 7, rowNum, TOTAL_COLUMNS);
    const valueCell = r.getCell(7);
    valueCell.value = item.value;
    valueCell.font = {
      name: 'Arial',
      bold: true,
      size: item.highlight ? 13 : 10,
      color: { argb: item.highlight ? 'FF15803D' : 'FF3F3F46' },
    };
    valueCell.alignment = { vertical: 'middle', horizontal: 'left' };

    if (item.highlight) {
      [labelCell, valueCell].forEach((c) => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
      });
    }

    // Border tipis mengelilingi baris ringkasan biar terlihat sebagai satu blok
    for (let col = 1; col <= TOTAL_COLUMNS; col++) {
      r.getCell(col).border = {
        top: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        left: { style: 'thin', color: { argb: 'FFE4E4E7' } },
        right: { style: 'thin', color: { argb: 'FFE4E4E7' } },
      };
    }
  });

  const generatedRowNum = summaryStartRow + summaryData.length + 2;
  const generatedRow = sheet.getRow(generatedRowNum);
  sheet.mergeCells(generatedRowNum, 1, generatedRowNum, TOTAL_COLUMNS);
  generatedRow.getCell(1).value = `File digenerate otomatis pada: ${new Date().toLocaleString('id-ID')}`;
  generatedRow.getCell(1).font = { name: 'Arial', italic: true, size: 8, color: { argb: 'FF9CA3AF' } };

  // ===== FILTER OTOMATIS DI HEADER =====
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: TOTAL_COLUMNS },
  };

  // ===== GENERATE & TRIGGER DOWNLOAD =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split('T')[0];
  const fullFileName = `${fileNamePrefix}_${today}.xlsx`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fullFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}