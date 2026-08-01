import { fetchCloudFeedbacks, saveCloudFeedback } from './supabase';

export interface FeedbackItem {
  id: string;
  name: string;
  rating: number; // 1 to 5
  category: 'ulasan' | 'saran' | 'kritik';
  comment: string;
  createdAt: string; // ISO date string
  avatarColor?: string;
}

export const STORAGE_KEY = 'balisnap_user_feedbacks_v1';
export const FEEDBACK_UPDATED_EVENT = 'balisnap_feedback_updated';

// Initial high quality sample reviews
const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-1',
    name: 'Sarah & Dito',
    rating: 5,
    category: 'ulasan',
    comment: 'Hasil foto frame BaliSnap keren banget! Proses fotonya gampang dan stiker-stikernya lucu-lucu banget buat kenang-kenangan.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    avatarColor: 'from-pink-500 to-rose-400'
  },
  {
    id: 'fb-2',
    name: 'Budi Santoso',
    rating: 5,
    category: 'ulasan',
    comment: 'Suka banget sama pilihan filter vintage-nya! Bisa langsung download hasil high-res tanpa ribet.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    avatarColor: 'from-purple-500 to-indigo-400'
  },
  {
    id: 'fb-3',
    name: 'Amanda L.',
    rating: 4,
    category: 'saran',
    comment: 'Fitur Boomerang GIF-nya seru banget! Kalau bisa tolong tambahkan opsi stiker bertema pantai Bali lebih banyak lagi yaa.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    avatarColor: 'from-amber-500 to-orange-400'
  },
  {
    id: 'fb-4',
    name: 'Rian & Gengs',
    rating: 5,
    category: 'ulasan',
    comment: 'Photobooth online terbaik yang pernah saya coba. Pilihan framenya beragam dan pas banget buat studio foto instan!',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    avatarColor: 'from-emerald-500 to-teal-400'
  }
];

/**
 * Returns currently cached feedbacks from LocalStorage synchronously.
 */
export function getFeedbacks(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACKS));
      return INITIAL_FEEDBACKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FEEDBACKS;
  } catch (error) {
    console.error('Failed to parse feedbacks from localStorage:', error);
    return INITIAL_FEEDBACKS;
  }
}

/**
 * Fetches latest feedbacks from Supabase Cloud (if configured),
 * merges them with local cache & sample initial feedbacks, and returns updated list.
 */
export async function fetchFeedbacks(): Promise<FeedbackItem[]> {
  const localList = getFeedbacks();

  try {
    const cloudList = await fetchCloudFeedbacks();
    if (cloudList && Array.isArray(cloudList)) {
      // Merge cloud list with local list, avoiding duplicates by ID
      const existingIds = new Set(cloudList.map((item) => item.id));

      // Retain initial sample feedbacks or local-only pending items if not yet in cloud
      const extraLocalItems = localList.filter((item) => !existingIds.has(item.id));

      const merged = [...cloudList, ...extraLocalItems];

      // Sort by creation date descending
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Update local storage cache
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to update local cache:', e);
      }

      return merged;
    }
  } catch (error) {
    console.error('Failed to fetch cloud feedbacks:', error);
  }

  return localList;
}

/**
 * Saves a new feedback entry.
 * Saves to LocalStorage first, dispatches local update event,
 * and asynchronously persists to Supabase Cloud DB.
 */
export async function saveFeedback(item: Omit<FeedbackItem, 'id' | 'createdAt'>): Promise<FeedbackItem> {
  const existing = getFeedbacks();
  const colors = [
    'from-pink-500 to-rose-400',
    'from-purple-500 to-indigo-400',
    'from-amber-500 to-orange-400',
    'from-emerald-500 to-teal-400',
    'from-cyan-500 to-blue-400',
    'from-fuchsia-500 to-pink-400'
  ];

  const newItem: FeedbackItem = {
    ...item,
    id: 'fb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    avatarColor: colors[Math.floor(Math.random() * colors.length)]
  };

  const updated = [newItem, ...existing];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save feedback to localStorage:', error);
    throw new Error('STORAGE_SAVE_FAILED');
  }

  // Notify listeners in the SAME tab
  window.dispatchEvent(new Event(FEEDBACK_UPDATED_EVENT));

  // Save to Supabase Cloud Database asynchronously
  try {
    await saveCloudFeedback(newItem);
  } catch (cloudErr) {
    console.warn('Failed to persist feedback to Supabase cloud:', cloudErr);
  }

  return newItem;
}

export function getFeedbackStats(customFeedbacks?: FeedbackItem[]) {
  const feedbacks = customFeedbacks || getFeedbacks();
  if (feedbacks.length === 0) {
    return { average: 5.0, total: 0 };
  }
  const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
  const average = Number((sum / feedbacks.length).toFixed(1));
  return { average, total: feedbacks.length };
}