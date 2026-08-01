import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  Crown,
  Trash2,
  CheckCircle2,
  DollarSign,
  Lock,
  HelpCircle,
  ImageIcon,
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

import { usePhotobooth, type PackageTier } from '../context/PhotoboothContext';

import { exportTransactionsToExcel } from '../lib/excelExport';


interface AdminFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminFinanceModal: React.FC<AdminFinanceModalProps> = ({ isOpen, onClose }) => {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    refreshTransactions,
    ownerPasscode,
    setOwnerPasscode,
    verifyOwnerPasscode,
    isOwnerAuthenticated,
    packageTier,
    setPackageTier,
  } = usePhotobooth();

  const [inputUser, setInputUser] = useState('admin');
  const [inputPasscode, setInputPasscode] = useState('');
  const [passError, setPassError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'addManual' | 'settings'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (isOpen && refreshTransactions) {
      setIsSyncing(true);
      refreshTransactions().finally(() => setIsSyncing(false));
    }
  }, [isOpen, refreshTransactions]);


  // State for Modal Preview Bukti Bayar
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  // Form State untuk Tambah Manual
  const [manualInvoice, setManualInvoice] = useState('');

  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualTier, setManualTier] = useState<PackageTier>('premium');
  const [manualAmount, setManualAmount] = useState('135000');
  const [manualMethod, setManualMethod] = useState<'QRIS Pribadi' | 'Transfer Bank' | 'Owner Passcode' | 'Manual Offline'>('QRIS Pribadi');
  const [manualNote, setManualNote] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');


  // Form State Ganti Passcode
  const [newPasscode, setNewPasscode] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOwnerPasscode(inputPasscode, inputUser)) {
      setPassError('');
    } else {
      setPassError('Username atau Password Admin Salah! (Default: admin / admin 081239)');
    }
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(transactions, 'Laporan_Keuangan_BaliSnap_Studio');
  };

  const handleAddManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(manualAmount, 10) || 0;
    const packageName = manualTier === 'premium' ? 'Paket PREMIUM VIP Pass (60 Hari)' : 'Paket BASIC Pass (24 Jam)';

    addTransaction({
      id: manualInvoice ? (manualInvoice.startsWith('#') ? manualInvoice : `#${manualInvoice}`) : undefined,
      customerName: manualCustomerName.trim() || 'Pelanggan Photobooth',
      packageName,
      packageTier: manualTier,
      amount: amountNum,
      paymentMethod: manualMethod,
      status: 'Lunas',
      customerNote: manualNote || 'Pencatatan manual oleh Owner',
    });

    setAddSuccessMsg('Transaksi berhasil ditambahkan ke Laporan!');
    setManualCustomerName('');
    setManualNote('');

    setTimeout(() => {
      setAddSuccessMsg('');
      setActiveTab('overview');
    }, 1500);
  };

  const handleSaveNewPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;
    setOwnerPasscode(newPasscode);
    setPassChangeSuccess(true);
    setNewPasscode('');
    setTimeout(() => setPassChangeSuccess(false), 2000);
  };

  const handleUnlockMyOwnerVIP = () => {
    setPackageTier('premium');
    alert('🎉 Selamat! Paket PREMIUM VIP Pass telah aktif untuk Anda sebagai Owner!');
  };

  // Kuis & Hitung Omset
  const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalCount = transactions.length;
  const premiumCount = transactions.filter((t) => t.packageTier === 'premium').length;
  const basicCount = transactions.filter((t) => t.packageTier === 'basic').length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-w-4xl w-full bg-zinc-900 border-2 border-purple-500/30 rounded-[32px] shadow-2xl overflow-hidden flex flex-col text-white my-auto max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 p-6 border-b border-purple-800/40 flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/20">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-black text-xl md:text-2xl text-white tracking-tight">
                    Panel Admin &amp; Laporan Keuangan 📊
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    Owner Dashboard
                  </span>
                </div>
                <p className="text-xs text-purple-200/70 font-medium">
                  Kelola Rekap Penjualan, Omset, Ekspor Excel &amp; Akses Khusus Pemilik BaliSnap Studio
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Authentication Screen jika belum input Login */}
          {!isOwnerAuthenticated ? (
            <div className="p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6">
              <div className="w-16 h-16 rounded-full bg-purple-900/50 border-2 border-purple-500/40 flex items-center justify-center text-purple-300 mb-4 shadow-xl">
                <Lock className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-white mb-2">
                Login Dashboard Admin 🔒
              </h3>
              <p className="text-xs text-zinc-400 font-medium mb-6 leading-relaxed">
                Silakan masukkan ID Admin &amp; Password untuk masuk ke Dashboard Laporan Keuangan dan Akses VIP Owner.
              </p>

              <form onSubmit={handleLogin} className="w-full space-y-3.5 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">Username Admin</label>
                  <input
                    type="text"
                    value={inputUser}
                    onChange={(e) => setInputUser(e.target.value)}
                    placeholder="Masukkan Username (admin)"
                    className="w-full px-4 py-3 bg-zinc-950 border border-purple-500/40 rounded-2xl text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">Password Admin</label>
                  <input
                    type="password"
                    value={inputPasscode}
                    onChange={(e) => setInputPasscode(e.target.value)}
                    placeholder="Masukkan Password (admin 081239)"
                    className="w-full px-4 py-3 bg-zinc-950 border border-purple-500/40 rounded-2xl text-sm font-mono text-pink-300 tracking-wider placeholder:text-zinc-600 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>

                {passError && (
                  <p className="text-[11px] text-rose-400 font-semibold text-center pt-1">{passError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-pink-500/20 cursor-pointer transition-all active:scale-95"
                >
                  Masuk Dashboard Admin 🚀
                </button>
              </form>

              <div className="mt-6 p-3.5 bg-purple-950/40 border border-purple-800/30 rounded-2xl text-left flex items-start gap-2.5">
                <HelpCircle className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-purple-200/90 leading-snug space-y-0.5">
                  <p>🔑 <strong>Akses Admin Bawaan:</strong></p>
                  <p>• Admin: <strong className="font-mono text-pink-300">admin</strong></p>
                  <p>• Password: <strong className="font-mono text-pink-300">admin 081239</strong></p>
                </div>
              </div>
            </div>
          ) : (

            /* Authenticated Content Area */
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Navigation Tabs & Unlock VIP Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    📊 Ringkasan &amp; Rekap Excel
                  </button>
                  <button
                    onClick={() => setActiveTab('addManual')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      activeTab === 'addManual'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    ➕ Catat Transaksi Manual
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    ⚙️ Pengaturan Passcode
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={async () => {
                      setIsSyncing(true);
                      await refreshTransactions();
                      setIsSyncing(false);
                    }}
                    disabled={isSyncing}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-zinc-700/50 disabled:opacity-50"
                    title="Sinkronkan data transaksi dengan Supabase Cloud Database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Singkron...' : 'Sync Cloud'}</span>
                  </button>

                  {packageTier === 'premium' ? (
                    <button
                      onClick={handleUnlockMyOwnerVIP}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-emerald-400/30"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Status VIP Owner: AKTIF ✅</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleUnlockMyOwnerVIP}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Crown className="w-4 h-4 text-amber-200" />
                      <span>Buka Akses Premium Saya Sekarang 👑</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Tab 1: Overview & Excel */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-purple-950/70 to-indigo-950/70 p-5 rounded-2xl border border-purple-800/40 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider">
                          Total Omset Penjualan
                        </span>
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                        Rp {totalRevenue.toLocaleString('id-ID')}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        Dari total {totalCount} transaksi tercatat
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-950/60 to-rose-950/60 p-5 rounded-2xl border border-pink-800/40 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-pink-300 uppercase tracking-wider">
                          Paket PREMIUM VIP (60 Hari)
                        </span>
                        <div className="p-2 rounded-xl bg-pink-500/20 text-pink-300">
                          <Crown className="w-5 h-5" />
                        </div>
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-white font-mono">
                        {premiumCount} <span className="text-sm font-normal text-pink-300">Terjual</span>
                      </h4>
                      <p className="text-[10px] text-pink-300/80 mt-1 font-medium">
                        Rp 135.000 / transaksi
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-5 rounded-2xl border border-zinc-700/50 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-zinc-300 uppercase tracking-wider">
                          Paket BASIC Pass (24 Jam)
                        </span>
                        <div className="p-2 rounded-xl bg-zinc-700/40 text-zinc-300">
                          <CreditCard className="w-5 h-5" />
                        </div>
                      </div>
                      <h4 className="text-2xl md:text-3xl font-black text-white font-mono">
                        {basicCount} <span className="text-sm font-normal text-zinc-400">Terjual</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        Rp 25.000 / transaksi
                      </p>
                    </div>
                  </div>

                  {/* Main Action Bar: Export Excel & Clear */}
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        Unduh Rekap Laporan Penjualan (Excel)
                      </h4>
                      <p className="text-xs text-zinc-400">
                        File berupa format .csv (.xlsx) rapi dengan pemisah kolom rupiah &amp; tanggal.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleExportExcel}
                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>📥 Download File Excel (.xlsx)</span>
                      </button>

                      {transactions.length > 0 && (
                        <button
                          onClick={() => {
                            if (confirm('Yakin ingin mereset seluruh catatan transaksi?')) {
                              clearTransactions();
                            }
                          }}
                          className="px-3.5 py-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                          title="Hapus Semua Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Table of Transactions */}
                  <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        Daftar Riwayat Transaksi ({transactions.length})
                      </h4>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-xs">
                        Belum ada transaksi tercatat.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-zinc-300">
                          <thead className="bg-zinc-900/80 text-[10.5px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-800">
                            <tr>
                              <th className="px-4 py-3">No</th>
                              <th className="px-4 py-3">Invoice ID</th>
                              <th className="px-4 py-3">Nama User / Pemesan</th>
                              <th className="px-4 py-3">Bukti Bayar</th>
                              <th className="px-4 py-3">Tanggal</th>
                              <th className="px-4 py-3">Paket</th>
                              <th className="px-4 py-3">Metode</th>
                              <th className="px-4 py-3">Nominal</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                          </thead>


                          <tbody className="divide-y divide-zinc-800/60">
                            {transactions.map((t, idx) => (
                              <tr key={t.id + idx} className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-4 py-3 text-zinc-500 font-mono">{idx + 1}</td>
                                <td className="px-4 py-3 font-mono font-bold text-pink-300">{t.id}</td>
                                <td className="px-4 py-3 font-extrabold text-white">
                                  {t.customerName || 'Pelanggan Photobooth'}
                                </td>
                                <td className="px-4 py-3">
                                  {t.paymentProofUrl ? (
                                    <div
                                      onClick={() => setSelectedProofImage(t.paymentProofUrl || null)}
                                      className="flex items-center gap-2 cursor-pointer group"
                                      title="Klik foto untuk melihat bukti transfer ukuran besar & jernih"
                                    >
                                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-purple-500/60 group-hover:border-pink-500 shadow-md shrink-0 bg-zinc-950 transition-all">
                                        <img
                                          src={t.paymentProofUrl}
                                          alt="Thumbnail Resi"
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                        />
                                        <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <Eye className="w-4 h-4 text-white" />
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProofImage(t.paymentProofUrl || null);
                                        }}
                                        className="px-2.5 py-1.5 bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 hover:text-white text-[10.5px] font-black rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                                      >
                                        <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                                        <span>Perbesar Resi 🔍</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-zinc-600 font-mono">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{t.date}</td>
                                <td className="px-4 py-3 font-semibold text-zinc-200">
                                  {t.packageName}
                                </td>


                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/40 text-[10px] text-purple-300 font-semibold">
                                    {t.paymentMethod}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono font-black text-emerald-400">
                                  Rp {t.amount.toLocaleString('id-ID')}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                                    {t.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => deleteTransaction(t.id)}
                                    className="p-1.5 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus baris"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Manual Add Transaction */}
              {activeTab === 'addManual' && (
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 max-w-xl mx-auto space-y-4">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-base text-white">➕ Catat Transaksi Manual (Offline/Manual Transfer)</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Gunakan form ini jika pelanggan membayar langsung via cash atau transfer manual tanpa sistem otomatis.
                    </p>
                  </div>

                  {addSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {addSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleAddManualSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Invoice ID (Opsional)</label>
                        <input
                          type="text"
                          value={manualInvoice}
                          onChange={(e) => setManualInvoice(e.target.value)}
                          placeholder="Misal: #SNAP-992100"
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Nama Pemesan / User</label>
                        <input
                          type="text"
                          value={manualCustomerName}
                          onChange={(e) => setManualCustomerName(e.target.value)}
                          placeholder="Misal: Kak Budi / Ani"
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>


                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Pilih Paket</label>
                        <select
                          value={manualTier}
                          onChange={(e) => {
                            const tier = e.target.value as PackageTier;
                            setManualTier(tier);
                            setManualAmount(tier === 'premium' ? '135000' : '25000');
                          }}
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="premium">Paket PREMIUM VIP Pass (Rp 135.000)</option>
                          <option value="basic">Paket BASIC Pass (Rp 25.000)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1">Metode Pembayaran</label>
                        <select
                          value={manualMethod}
                          onChange={(e) => setManualMethod(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="QRIS Pribadi">QRIS Pribadi</option>
                          <option value="Transfer Bank">Transfer Bank</option>
                          <option value="Manual Offline">Manual / Cash</option>
                          <option value="Owner Passcode">Owner Passcode</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Nominal (Rp)</label>
                      <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Catatan Tambahan (Opsional)</label>
                      <input
                        type="text"
                        value={manualNote}
                        onChange={(e) => setManualNote(e.target.value)}
                        placeholder="Misal: Pembayaran via DANA Budi"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-colors"
                    >
                      Simpan ke Laporan Keuangan 💾
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Passcode Settings */}
              {activeTab === 'settings' && (
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 max-w-xl mx-auto space-y-4">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-base text-white">⚙️ Pengaturan Secret Passcode Owner</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Ubah kata sandi rahasia yang dipakai untuk membuka paket VIP dan mengakses laporan ini.
                    </p>
                  </div>

                  {passChangeSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Passcode Owner Berhasil Diperbarui!
                    </div>
                  )}

                  <div className="p-3 bg-purple-950/40 border border-purple-800/30 rounded-xl text-xs">
                    <span className="text-zinc-400 font-bold block">Passcode Owner Saat Ini:</span>
                    <span className="font-mono font-bold text-pink-300 text-sm tracking-wider">{ownerPasscode}</span>
                  </div>

                  <form onSubmit={handleSaveNewPasscode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Passcode Baru</label>
                      <input
                        type="text"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="Ketik Passcode Baru (misal: RANGGA-VIP-2026)"
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 font-mono tracking-wider"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!newPasscode.trim()}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-colors"
                    >
                      Simpan Passcode Baru 🔒
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal Preview Bukti Transfer Resi */}
      <AnimatePresence>
        {selectedProofImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedProofImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl sm:max-w-3xl w-full bg-zinc-900 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 shrink-0">
                <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-pink-400" />
                  Foto Bukti Pembayaran / Resi Transfer (Resolusi Asli HD 🔍)
                </h4>
                <button
                  onClick={() => setSelectedProofImage(null)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full flex-1 overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/90 p-3 flex items-center justify-center min-h-[300px] max-h-[75vh]">
                <img
                  src={selectedProofImage}
                  alt="Resi Pembayaran Pelanggan"
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
                />
              </div>

              <div className="mt-4 w-full flex items-center justify-between shrink-0 border-t border-zinc-800/80 pt-3">
                <a
                  href={selectedProofImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka di Tab Baru / Tab Penuh 🔗</span>
                </a>

                <button
                  onClick={() => setSelectedProofImage(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-all"
                >
                  Tutup Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

