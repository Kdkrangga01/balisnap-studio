import { supabase, isSupabaseClientConfigured } from './supabaseClient';

export interface FeedbackItem {
  id: string;
  name: string;
  rating: number; // 1 to 5
  category: 'ulasan' | 'saran' | 'kritik';
  comment: string;
  createdAt: string; // ISO date string
  avatarColor?: string;
}

const AVATAR_COLORS = [
  'from-pink-500 to-rose-400',
  'from-purple-500 to-indigo-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-cyan-500 to-blue-400',
  'from-fuchsia-500 to-pink-400'
];

// Baris mentah dari Supabase -> bentuk FeedbackItem yang dipakai UI
function mapRow(row: any): FeedbackItem {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    category: row.category,
    comment: row.comment,
    createdAt: row.created_at,
    avatarColor: row.avatar_color || undefined
  };
}

/**
 * Ambil semua testimoni dari Supabase, terbaru duluan.
 */
export async function getFeedbacks(): Promise<FeedbackItem[]> {
  if (!isSupabaseClientConfigured) {
    try {
      const local = localStorage.getItem('balisnap_local_feedbacks');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return [
      {
        id: 'sample-1',
        name: 'Gek Maya',
        rating: 5,
        category: 'ulasan',
        comment: 'Studio photobooth paling aesthetic di Bali! Hasil fotonya jernih banget dan banyak pilihan bingkai lucu.',
        createdAt: new Date().toISOString(),
        avatarColor: 'from-pink-500 to-rose-400'
      },
      {
        id: 'sample-2',
        name: 'Putu Agus',
        rating: 5,
        category: 'saran',
        comment: 'Tambahkan lebih banyak stiker bertema pantai dan sunset dong biar makin seru!',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        avatarColor: 'from-amber-500 to-orange-400'
      }
    ];
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal mengambil feedback dari Supabase:', error);
    return [];
  }

  return (data || []).map(mapRow);
}

/**
 * Simpan testimoni baru ke Supabase atau localStorage jika Supabase belum dikonfigurasi.
 */
export async function saveFeedback(
  item: Omit<FeedbackItem, 'id' | 'createdAt' | 'avatarColor'>
): Promise<FeedbackItem> {
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  if (!isSupabaseClientConfigured) {
    const newItem: FeedbackItem = {
      id: `local-${Date.now()}`,
      name: item.name,
      rating: item.rating,
      category: item.category,
      comment: item.comment,
      createdAt: new Date().toISOString(),
      avatarColor
    };
    try {
      const existing = JSON.parse(localStorage.getItem('balisnap_local_feedbacks') || '[]');
      localStorage.setItem('balisnap_local_feedbacks', JSON.stringify([newItem, ...existing]));
    } catch {}
    return newItem;
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      name: item.name,
      rating: item.rating,
      category: item.category,
      comment: item.comment,
      avatar_color: avatarColor
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Gagal menyimpan feedback ke Supabase:', error);
    throw new Error('STORAGE_SAVE_FAILED');
  }

  return mapRow(data);
}

export async function getFeedbackStats(): Promise<{ average: number; total: number }> {
  const feedbacks = await getFeedbacks();
  if (feedbacks.length === 0) {
    return { average: 5.0, total: 0 };
  }
  const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
  const average = Number((sum / feedbacks.length).toFixed(1));
  return { average, total: feedbacks.length };
}

/**
 * Dengerin perubahan realtime di tabel feedbacks.
 */
export function subscribeToFeedbacks(onChange: () => void): () => void {
  if (!isSupabaseClientConfigured) {
    return () => {};
  }

  const channel = supabase
    .channel('feedbacks-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'feedbacks' },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}