import type { PackageTier } from '../context/PhotoboothContext';

export interface StickerItem {
  id: string;
  name: string;
  src: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge' | 'cat' | 'nailong' | 'aesthetic' | 'anime' | 'panda';
  requiredTier?: PackageTier;
}

export interface StickerPack {
  id: string;
  name: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge' | 'cat' | 'nailong' | 'aesthetic' | 'anime' | 'panda';
  icon: string;
  stickers: string[];
  requiredTier?: PackageTier;
}

export function isStickerLocked(_sticker: StickerItem, _currentTier: PackageTier): boolean {
  return false;
}

export function isStickerPackLocked(_pack: StickerPack, _currentTier: PackageTier): boolean {
  return false;
}

export const stickers: StickerItem[] = [
  // ==========================================
  // 🐼 STIKER PANDA FULL PACKS HD JERNIH (DIE-CUT CUTOUT)
  // ==========================================
  { id: "panda-good-morning", name: "Panda Good Morning ☀️", src: "/stickers/panda-good-morning.png", category: "panda" },
  { id: "panda-whattt", name: "Panda Whattt Terkejut 😲", src: "/stickers/panda-whattt.png", category: "panda" },
  { id: "panda-huh", name: "Panda Huh Bingung 🤔", src: "/stickers/panda-huh.png", category: "panda" },
  { id: "panda-reminding", name: "Panda Reminding Kacamata 👓", src: "/stickers/panda-reminding.png", category: "panda" },
  { id: "panda-so-sleepy", name: "Panda So Sleepy Ngantuk 💤", src: "/stickers/panda-so-sleepy.png", category: "panda" },
  { id: "panda-wow", name: "Panda Wow Sparkling Eyes ✨", src: "/stickers/panda-wow.png", category: "panda" },
  { id: "panda-approved", name: "Panda Approved Centang Hijau ✅", src: "/stickers/panda-approved.png", category: "panda" },
  { id: "panda-nice", name: "Panda Nice Jempol Love 👍", src: "/stickers/panda-nice.png", category: "panda" },
  { id: "panda-hey-you", name: "Panda Hey You Menunjuk 👆", src: "/stickers/panda-hey-you.png", category: "panda" },
  { id: "panda-achoo", name: "Panda Achoo Bersin Tisu 🤧", src: "/stickers/panda-achoo.png", category: "panda" },
  { id: "panda-angry", name: "Panda Angry Ngambek 💢", src: "/stickers/panda-angry.png", category: "panda" },
  { id: "panda-huh-confused", name: "Panda Huh Cemas Gemes ❓", src: "/stickers/panda-huh-confused.png", category: "panda" },
  { id: "panda-good-night", name: "Panda Good Night Bintang 🌙", src: "/stickers/panda-good-night.png", category: "panda" },
  { id: "panda-too-cute", name: "Panda Too Cuteee Pink Love 💖", src: "/stickers/panda-too-cute.png", category: "panda" },
  { id: "panda-cool-guy", name: "Panda Cool Hoodie Kacamata 😎", src: "/stickers/panda-cool-guy.png", category: "panda" },

  // ==========================================
  // 🐱 STIKER KUCING REAL PHOTO HD PINTEREST (CUTOUT JERNIH)
  // ==========================================
  { id: "cat-kucing-1", name: "Cute Kitten Pose 1 HD", src: "/stickers/kucing-1.png", category: "cat" },
  { id: "cat-kucing-2", name: "Cute Kitten Pose 2 HD", src: "/stickers/kucing-2.png", category: "cat" },
  { id: "cat-kucing-3", name: "Cute Kitten Pose 3 HD", src: "/stickers/kucing-3.png", category: "cat" },
  { id: "cat-kucing-4", name: "Cute Kitten Pose 4 HD", src: "/stickers/kucing-4.png", category: "cat" },
  { id: "cat-blue-ribbon-clean", name: "Real Cat Pita Biru", src: "/stickers/cat-blue-ribbon-clean.png", category: "cat" },
  { id: "cat-pink-ribbon-clean", name: "Real Cat Pita Pink", src: "/stickers/cat-pink-ribbon-clean.png", category: "cat" },
  { id: "cat-hipster-clean", name: "Real Cat Hipster Kacamata", src: "/stickers/cat-hipster-clean.png", category: "cat" },
  { id: "cute-angry-cat-real", name: "Real Angry Ragdoll Cat", src: "/stickers/cute-angry-cat.png", category: "cat" },
  { id: "cute-helmet-cat-real", name: "Real Kitten Pakai Helm", src: "/stickers/cute-helmet-cat.png", category: "cat" },
  { id: "kucing-hitam-real", name: "Real Black Cat Cute", src: "/stickers/kucing-hitam.png", category: "cat" },
  { id: "cute-cat-white-svg", name: "Cute Kitten White Vector", src: "/stickers/cute-cat.svg", category: "cat" },

  // ==========================================
  // 🐲 STIKER NAILONG 3D REAL CUTOUT FULL BODY
  // ==========================================
  { id: "nailong-cat-costume", name: "Nailong Kostum Kucing", src: "/stickers/nailong-cat-costume.png", category: "nailong" },
  { id: "nailong-dance-stretch", name: "Nailong Joget Stretch", src: "/stickers/nailong-dance-stretch.png", category: "nailong" },
  { id: "nailong-wave-happy", name: "Nailong Waving Happy", src: "/stickers/nailong-wave-happy.png", category: "nailong" },
  { id: "nailong-wave-face", name: "Nailong Intip Lucu", src: "/stickers/nailong-wave-face.png", category: "nailong" },
  { id: "nailong-silly-open", name: "Nailong Melet Lidah", src: "/stickers/nailong-silly-open.png", category: "nailong" },
  { id: "nailong-shopping-bags", name: "Nailong Belanja Shopping Bags", src: "/stickers/nailong-shopping-bags.png", category: "nailong" },
  { id: "nailong-bear-shirt", name: "Nailong Kaos Beruang", src: "/stickers/nailong-bear-shirt.png", category: "nailong" },
  { id: "nailong-blep-derp", name: "Nailong Derp Gemes", src: "/stickers/nailong-blep-derp.png", category: "nailong" },
  { id: "nailong-curious", name: "Nailong Penasaran Gemes", src: "/stickers/nailong-curious.png", category: "nailong" },
  { id: "nailong-cheering", name: "Nailong Cheering Hore", src: "/stickers/nailong-cheering.png", category: "nailong" },
  { id: "nailong-standing-scale", name: "Nailong Timbangan Berat", src: "/stickers/nailong-standing-scale.png", category: "nailong" },
  { id: "nailong-sleepy-standing", name: "Nailong Ngantuk Tidur", src: "/stickers/nailong-sleepy-standing.png", category: "nailong" },
  { id: "nailong-angry-pointing", name: "Nailong Marah Menunjuk", src: "/stickers/nailong-angry-pointing.png", category: "nailong" },
  { id: "nailong-running-cute", name: "Nailong Lari Imut", src: "/stickers/nailong-running-cute.png", category: "nailong" },
  { id: "dino-yellow-clean", name: "Nailong 3D Yellow Clean", src: "/stickers/dino-yellow-clean.png", category: "nailong" },

  // ==========================================
  // 🏴‍☠️ STIKER ONE PIECE & LUFFY
  // ==========================================
  { id: "monkey-dluffy", name: "Monkey D. Luffy Pirate", src: "/stickers/monkey-dluffy.png", category: "anime" },
  { id: "luffy-onpeace", name: "Luffy Peace Sign", src: "/stickers/luffy-onpeace.png", category: "anime" },
  { id: "luffy-boon", name: "Luffy Cute Smile", src: "/stickers/luffy-boon.png", category: "anime" },
  { id: "kapal-luffy", name: "Kapal Bajak Laut Going Merry", src: "/stickers/kapal-luffy.png", category: "anime" },

  // ==========================================
  // 🖤 STIKER BLACK Y2K & AESTHETIC DARK
  // ==========================================
  { id: "black-spider", name: "Black Spider Dark Y2K", src: "/stickers/black-spider.png", category: "aesthetic" },
  { id: "black-kupu", name: "Black Butterfly Aesthetic", src: "/stickers/black-kupu.png", category: "aesthetic" },
  { id: "black-floower", name: "Black Flower Dark Rose", src: "/stickers/black-floower.png", category: "aesthetic" },
  { id: "star-girl", name: "Star Girl Aesthetic Cutout", src: "/stickers/star-girl.png", category: "aesthetic" },
  { id: "converse-chiolino", name: "Converse Chiolino Sneakers", src: "/stickers/converse-chiolino.png", category: "aesthetic" },
  { id: "chioo-del", name: "Chioo Cute Cutout", src: "/stickers/chioo-del.png", category: "aesthetic" },
  { id: "mawar-hitam", name: "Mawar Hitam Dark Y2K", src: "/stickers/mawar-hitam.png", category: "aesthetic" },
  { id: "bibir-hitam", name: "Bibir Hitam Y2K Cutout", src: "/stickers/bibir-hitam.png", category: "aesthetic" },
  { id: "bulan-sabit", name: "Bulan Sabit Aesthetic", src: "/stickers/bulan-sabit.png", category: "aesthetic" },

  // ==========================================
  // 🧸 STIKER KAWAII & HEWAN IMUT
  // ==========================================
  { id: "snoopy-hearts-hd", name: "Snoopy Peluk Hati HD", src: "/stickers/snoopy-hearts.png.png", category: "cute" },
  { id: "panda-tidur", name: "Panda Tidur Gemes", src: "/stickers/panda-tidur.png", category: "cute" },
  { id: "ghost-hantu", name: "Cute Ghost Hantu", src: "/stickers/ghost-hantu.png", category: "cute" },
  { id: "cute-bear", name: "Teddy Bear Classic", src: "/stickers/cute-bear.svg", category: "cute" },
  { id: "cute-bunny", name: "Fluffy Bunny White", src: "/stickers/cute-bunny.svg", category: "cute" },
  { id: "cute-corgi", name: "Cute Corgi Dog", src: "/stickers/cute-corgi.svg", category: "cute" },
  { id: "cute-duckling", name: "Cute Yellow Duckling", src: "/stickers/cute-duckling.svg", category: "cute" },
  { id: "cute-fox", name: "Cute Red Fox", src: "/stickers/cute-fox.svg", category: "cute" },
  { id: "cute-otter", name: "Cute Playful Otter", src: "/stickers/cute-otter.svg", category: "cute" },
  { id: "cute-panda-svg", name: "Cute Panda Bear Vector", src: "/stickers/cute-panda.svg", category: "cute" },
  { id: "cute-penguin", name: "Cute Baby Penguin", src: "/stickers/cute-penguin.svg", category: "cute" },
  { id: "cute-unicorn", name: "Cute Magical Unicorn", src: "/stickers/cute-unicorn.svg", category: "cute" },
  { id: "cute-cloud", name: "Friendly Cloud Smile", src: "/stickers/cute-cloud.svg", category: "cute" },
  { id: "cute-rainbow", name: "Sweet Pastel Rainbow", src: "/stickers/cute-rainbow.svg", category: "cute" },
  { id: "cute-heart", name: "Love Pink Heart", src: "/stickers/cute-heart.svg", category: "cute" },
  { id: "cute-star", name: "Star Face Yellow", src: "/stickers/cute-star.svg", category: "cute" },
  { id: "cute-ghost-svg", name: "Cute Ghost Vector", src: "/stickers/cute-ghost.svg", category: "cute" },
  { id: "cute-boba-svg", name: "Cute Boba Drink SVG", src: "/stickers/cute-boba.svg", category: "cute" },

  // ==========================================
  // ✨ STIKER EMOJI & SPARKLES
  // ==========================================
  { id: "sparkle-gold", name: "Sparkle Gold Glitter", src: "/stickers/sparkle-gold.svg", category: "emoji" },
  { id: "sparkle-pink", name: "Sparkle Pink Glitter", src: "/stickers/sparkle-pink.svg", category: "emoji" },
  { id: "sparkle-blue", name: "Sparkle Blue Glitter", src: "/stickers/sparkle-blue.svg", category: "emoji" },
  { id: "emoji-smiley", name: "Smiley Emoji Happy", src: "/stickers/emoji-smiley.svg", category: "emoji" },
  { id: "emoji-flower", name: "Sakura Cherry Blossom", src: "/stickers/emoji-flower.svg", category: "emoji" },
  { id: "emoji-cherry", name: "Cherry Sweet Twins", src: "/stickers/emoji-cherry.svg", category: "emoji" },
  { id: "emoji-sun", name: "Cool Sunglasses Sun", src: "/stickers/emoji-sun.svg", category: "emoji" },
  { id: "emoji-camera", name: "Retro Photo Camera", src: "/stickers/emoji-camera.svg", category: "emoji" },

  // ==========================================
  // 💬 SPEECH & TEXT BUBBLES
  // ==========================================
  { id: "bubble-bestie", name: "Best Friends Bubble", src: "/stickers/bubble-bestie.svg", category: "text" },
  { id: "bubble-love", name: "Love Speech Bubble", src: "/stickers/bubble-love.svg", category: "text" },
  { id: "bubble-ootd", name: "OOTD Fashion Tag", src: "/stickers/bubble-ootd.svg", category: "text" },
  { id: "bubble-happy", name: "Happy Day Speech", src: "/stickers/bubble-happy.svg", category: "text" },
  { id: "bubble-empty", name: "Blank Note Bubble", src: "/stickers/bubble-empty.svg", category: "text" },
  { id: "bubble-together", name: "Together Speech Bubble", src: "/stickers/bubble-together.svg", category: "text" },

  // ==========================================
  // 🎀 WASHI TAPES
  // ==========================================
  { id: "tape-mint", name: "Washi Tape Mint", src: "/stickers/tape-mint.svg", category: "washi" },
  { id: "tape-pink", name: "Washi Tape Pink", src: "/stickers/tape-pink.svg", category: "washi" },
  { id: "tape-gold", name: "Washi Tape Gold", src: "/stickers/tape-gold.svg", category: "washi" },
  { id: "tape-purple", name: "Washi Tape Purple", src: "/stickers/tape-purple.svg", category: "washi" },
  { id: "tape-blue", name: "Washi Tape Blue", src: "/stickers/tape-blue.svg", category: "washi" },

  // ==========================================
  // 🏅 BADGES & PARTY DECORATIONS
  // ==========================================
  { id: "badge-ribbon", name: "Gold Ribbon Medal", src: "/stickers/badge-ribbon.svg", category: "badge" },
  { id: "badge-cake", name: "Sweet Birthday Cake", src: "/stickers/badge-cake.svg", category: "badge" },
  { id: "badge-balloon", name: "Party Balloon Festival", src: "/stickers/badge-balloon.svg", category: "badge" },
  { id: "badge-star", name: "Star Badge Winner Medal", src: "/stickers/badge-star.svg", category: "badge" },
  { id: "disco-ball", name: "Sparkling Disco Ball", src: "/stickers/disco-ball.svg", category: "badge" },
  { id: "vinyl-record", name: "Vintage Vinyl Record", src: "/stickers/vinyl-record.svg", category: "badge" }
];

// ============================================================================
// PAKET AUTO-SPREAD (SEMUA ID DAN NAMA UNIK, TANPA DUPLIKAT)
// ============================================================================
export const stickerPacks: StickerPack[] = [
  {
    id: "pack-panda-cute",
    name: "Panda Full Pack HD 🐼",
    category: "panda",
    icon: "/stickers/panda-good-morning.png",
    stickers: [
      "/stickers/panda-good-morning.png",
      "/stickers/panda-whattt.png",
      "/stickers/panda-huh.png",
      "/stickers/panda-reminding.png",
      "/stickers/panda-so-sleepy.png",
      "/stickers/panda-wow.png",
      "/stickers/panda-approved.png",
      "/stickers/panda-nice.png",
      "/stickers/panda-hey-you.png",
      "/stickers/panda-achoo.png",
      "/stickers/panda-angry.png",
      "/stickers/panda-huh-confused.png",
      "/stickers/panda-good-night.png",
      "/stickers/panda-too-cute.png",
      "/stickers/panda-cool-guy.png"
    ]
  },
  {
    id: "pack-cat-squad",
    name: "Real Cat Photo Pinterest 🐱",
    category: "cat",
    icon: "/stickers/kucing-1.png",
    stickers: [
      "/stickers/kucing-1.png",
      "/stickers/kucing-2.png",
      "/stickers/kucing-3.png",
      "/stickers/kucing-4.png",
      "/stickers/cat-blue-ribbon-clean.png",
      "/stickers/cat-pink-ribbon-clean.png",
      "/stickers/cat-hipster-clean.png",
      "/stickers/cute-angry-cat.png",
      "/stickers/cute-helmet-cat.png",
      "/stickers/kucing-hitam.png"
    ]
  },
  {
    id: "pack-luffy-onepiece",
    name: "One Piece Luffy Pirate 🏴‍☠️",
    category: "anime",
    icon: "/stickers/monkey-dluffy.png",
    stickers: [
      "/stickers/monkey-dluffy.png",
      "/stickers/luffy-onpeace.png",
      "/stickers/luffy-boon.png",
      "/stickers/kapal-luffy.png"
    ]
  },
  {
    id: "pack-black-gothic",
    name: "Dark Y2K & Spider 🖤",
    category: "aesthetic",
    icon: "/stickers/mawar-hitam.png",
    stickers: [
      "/stickers/mawar-hitam.png",
      "/stickers/black-spider.png",
      "/stickers/black-kupu.png",
      "/stickers/black-floower.png",
      "/stickers/bibir-hitam.png",
      "/stickers/bulan-sabit.png",
      "/stickers/star-girl.png"
    ]
  },
  {
    id: "pack-nailong-party",
    name: "Nailong 3D Real Photo 🐲",
    category: "nailong",
    icon: "/stickers/nailong-cat-costume.png",
    stickers: [
      "/stickers/nailong-cat-costume.png",
      "/stickers/nailong-shopping-bags.png",
      "/stickers/nailong-bear-shirt.png",
      "/stickers/nailong-silly-open.png",
      "/stickers/nailong-wave-happy.png",
      "/stickers/nailong-cheering.png"
    ]
  },
  {
    id: "pack-kawaii-friends",
    name: "Kawaii Friends & Snoopy 🧸",
    category: "cute",
    icon: "/stickers/snoopy-hearts.png.png",
    stickers: [
      "/stickers/snoopy-hearts.png.png",
      "/stickers/panda-tidur.png",
      "/stickers/ghost-hantu.png",
      "/stickers/cute-panda.svg",
      "/stickers/cute-bunny.svg",
      "/stickers/cute-corgi.svg"
    ]
  },
  {
    id: "pack-chioo-street",
    name: "Streetwear & Shoes 👟",
    category: "aesthetic",
    icon: "/stickers/converse-chiolino.png",
    stickers: [
      "/stickers/converse-chiolino.png",
      "/stickers/chioo-del.png"
    ]
  },
  {
    id: "pack-animal-squad",
    name: "Cute Animal Squad 🦊",
    category: "cute",
    icon: "/stickers/cute-corgi.svg",
    stickers: [
      "/stickers/cute-corgi.svg",
      "/stickers/cute-fox.svg",
      "/stickers/cute-panda.svg",
      "/stickers/cute-duckling.svg",
      "/stickers/cute-unicorn.svg",
      "/stickers/cute-otter.svg"
    ]
  },
  {
    id: "pack-sparkles",
    name: "Y2K Stars Deco ✨",
    category: "emoji",
    icon: "/stickers/sparkle-gold.svg",
    stickers: [
      "/stickers/sparkle-gold.svg",
      "/stickers/sparkle-pink.svg",
      "/stickers/sparkle-blue.svg",
      "/stickers/emoji-flower.svg"
    ]
  },
  {
    id: "pack-washi",
    name: "Scrapbook Washi Tape 🎀",
    category: "washi",
    icon: "/stickers/tape-pink.svg",
    stickers: [
      "/stickers/tape-pink.svg",
      "/stickers/tape-mint.svg",
      "/stickers/tape-gold.svg",
      "/stickers/tape-purple.svg"
    ]
  },
  {
    id: "pack-speech",
    name: "Cute Speech Bubbles 💬",
    category: "text",
    icon: "/stickers/bubble-love.svg",
    stickers: [
      "/stickers/bubble-love.svg",
      "/stickers/bubble-bestie.svg",
      "/stickers/bubble-happy.svg",
      "/stickers/bubble-ootd.svg"
    ]
  }
];