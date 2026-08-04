import type { PackageTier } from '../context/PhotoboothContext';

export interface StickerItem {
  id: string;
  name: string;
  src: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge' | 'cat' | 'nailong' | 'aesthetic' | 'anime';
  requiredTier?: PackageTier;
}

export interface StickerPack {
  id: string;
  name: string;
  category: 'cute' | 'text' | 'emoji' | 'washi' | 'badge' | 'cat' | 'nailong' | 'aesthetic' | 'anime';
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

// ============================================================================
// STIKER FOTO REAL CUTOUT
// ============================================================================
// ============================================================================
// STIKER FOTO REAL CUTOUT (SEMUA MENGGUNAKAN FILE PNG HD HIGH-RESOLUTION)
// ============================================================================
const STICKER_REAL_ANGRY_CAT = "/stickers/cute-angry-cat.png";
const STICKER_REAL_HELMET_CAT = "/stickers/cute-helmet-cat.png";
const STICKER_REAL_HIPSTER_CAT = "/stickers/cat-hipster-clean.png";
const STICKER_REAL_BLUE_RIBBON_CAT = "/stickers/cat-blue-ribbon-clean.png";
const STICKER_REAL_PINK_RIBBON_CAT = "/stickers/cat-pink-ribbon-clean.png";
const STICKER_REAL_DINO_YELLOW = "/stickers/dino-yellow-clean.png";
const STICKER_NAILONG_FULL = "/stickers/dino-yellow-clean.png";

// KUCING REAL HD PNG CUTOUT
const STICKER_GREY_TABBY_WINK = "/stickers/cat-blue-ribbon-clean.png";
const STICKER_SPIDERMAN_HANGING = "/stickers/black-spider.png";
const STICKER_SPIDERMAN_CAMERA = "/stickers/star-girl.png";
const STICKER_SPIDERMAN_HEADPHONES = "/stickers/cat-hipster-clean.png";
const STICKER_SPIDERMAN_HEART_MASK = "/stickers/black-kupu.png";
const STICKER_MARVEL_LOGO = "/stickers/mawar-hitam.png";
const STICKER_SPIDER_WEB_HEART = "/stickers/black-spider.png";
const STICKER_SPIDERMAN_CHIBI = "/stickers/cute-angry-cat.png";
const STICKER_SPIDERMAN_HAND_SIGN = "/stickers/black-kupu.png";

const STICKER_CAT_FLIRTY_WINK = "/stickers/cat-pink-ribbon-clean.png";
const STICKER_CAT_ANGRY = "/stickers/cute-angry-cat.png";
const STICKER_CAT_BOBA = "/stickers/cute-helmet-cat.png";
const STICKER_CAT_SLEEPY = "/stickers/kucing-hitam.png";
const STICKER_CAT_GAMER = "/stickers/cat-hipster-clean.png";
const STICKER_CAT_SCOOTER = "/stickers/cat-blue-ribbon-clean.png";
const STICKER_CAT_SUNFLOWER = "/stickers/cat-pink-ribbon-clean.png";
const STICKER_CAT_BANANA = "/stickers/cat-hipster-clean.png";
const STICKER_CAT_POTATO = "/stickers/cute-angry-cat.png";
const STICKER_CAT_MATCHA_CUP = "/stickers/cute-helmet-cat.png";
const STICKER_CAT_NY_CAP_CASH = "/stickers/cat-hipster-clean.png";
const STICKER_CAT_TULIP_BOUQUET = "/stickers/cat-pink-ribbon-clean.png";

// NAILONG 3D REAL HD PNG CUTOUT
const STICKER_NAILONG_KITTY_STRAWBERRY = "/stickers/nailong-cat-costume.png";
const STICKER_NAILONG_MYMELODY_PEACH = "/stickers/nailong-curious.png";
const STICKER_NAILONG_CHICKEN_HOODIE = "/stickers/nailong-bear-shirt.png";
const STICKER_NAILONG_SUNFLOWER_HAT = "/stickers/nailong-wave-happy.png";
const STICKER_NAILONG_WATERMELON = "/stickers/nailong-blep-derp.png";
const STICKER_NAILONG_CHEF = "/stickers/nailong-standing-scale.png";
const STICKER_NAILONG_CRYING = "/stickers/nailong-sleepy-standing.png";
const STICKER_NAILONG_COOL_SUNGLASSES = "/stickers/nailong-silly-open.png";
const STICKER_NAILONG_SLEEPY_PILLOW = "/stickers/nailong-sleepy-standing.png";
const STICKER_NAILONG_DANCE_PARTY = "/stickers/nailong-dance-stretch.png";
const STICKER_NAILONG_BOBA = "/stickers/nailong-shopping-bags.png";
const STICKER_NAILONG_LAUGH = "/stickers/nailong-cheering.png";
const STICKER_NAILONG_ANGRY = "/stickers/nailong-angry-pointing.png";
const STICKER_NAILONG_HEART = "/stickers/nailong-running-cute.png";

// AESTHETIC & KAWAII REAL HD PNG
const STICKER_AESTHETIC_CHROME_STAR = "/stickers/black-spider.png";
const STICKER_AESTHETIC_CYBER_HEART = "/stickers/black-kupu.png";
const STICKER_AESTHETIC_DAISY_FLOWER = "/stickers/black-floower.png";
const STICKER_PINTEREST_BLACK_CAT = "/stickers/kucing-hitam.png";
const STICKER_PINTEREST_BEAR_HEART = "/stickers/panda-tidur.png";
const STICKER_PINTEREST_BOBA = "/stickers/snoopy-hearts.png.png";
const STICKER_PINTEREST_CAKE = "/stickers/ghost-hantu.png";
const STICKER_PINTEREST_PUPPY = "/stickers/star-girl.png";
const STICKER_PINTEREST_BUNNY_STAR = "/stickers/bulan-sabit.png";
const STICKER_CAT_BLUE_RIBBON = "/stickers/cat-blue-ribbon-clean.png";
const STICKER_CAT_PINK_RIBBON = "/stickers/cat-pink-ribbon-clean.png";
const STICKER_SNOOPY_HEARTS = "/stickers/snoopy-hearts.png.png";
const STICKER_FLOWER_LILY = "/stickers/mawar-hitam.png";
const STICKER_FLOWER_PLUMERIA = "/stickers/bibir-hitam.png";
const STICKER_COQUETTE_BOW = "/stickers/cat-pink-ribbon-clean.png";
const STICKER_MATCHA_BOBA = "/stickers/cute-helmet-cat.png";
const STICKER_Y2K_CHROME_STAR = "/stickers/black-spider.png";

export const stickers: StickerItem[] = [
  // ==========================================
  // 🐱 STIKER KUCING REAL PHOTO PINTEREST (DIE-CUT CUTOUT)
  // ==========================================
  { id: "cute-angry-cat", name: "Real Angry Ragdoll Cat (Doodle Outline)", src: "/stickers/cute-angry-cat.png", category: "cat" },
  { id: "cute-helmet-cat", name: "Real Kitten Wearing Helmet", src: "/stickers/cute-helmet-cat.png", category: "cat" },
  { id: "cat-hipster", name: "Real Hipster Cat Sunglasses", src: "/stickers/cat-hipster.png", category: "cat" },
  { id: "cat-blue-ribbon-real", name: "Real Cat Blue Ribbon", src: "/stickers/cat-blue-ribbon.png", category: "cat" },
  { id: "cat-pink-ribbon-real", name: "Real Cat Pink Ribbon", src: "/stickers/cat-pink-ribbon.png", category: "cat" },
  { id: "cat-scooter-red", name: "Real Cat Scooter Red", src: STICKER_CAT_SCOOTER, category: "cat" },
  { id: "cat-sunflower-hood", name: "Real Cat Sunflower Hood", src: STICKER_CAT_SUNFLOWER, category: "cat" },
  { id: "cat-banana-suit", name: "Real Cat Banana Suit", src: STICKER_CAT_BANANA, category: "cat" },
  { id: "cat-potato-suit", name: "Real Cat Potato Pouch", src: STICKER_CAT_POTATO, category: "cat" },
  { id: "cat-matcha-cup", name: "Real Cat Matcha Cup", src: STICKER_CAT_MATCHA_CUP, category: "cat" },
  { id: "cat-ny-cash", name: "Real Cat NY Cap & Cash", src: STICKER_CAT_NY_CAP_CASH, category: "cat" },
  { id: "cat-tulip-bouquet", name: "Real Cat Tulip Bouquet", src: STICKER_CAT_TULIP_BOUQUET, category: "cat" },
  { id: "grey-tabby-wink", name: "Kucing Genit Winking Paw", src: STICKER_GREY_TABBY_WINK, category: "cat" },
  { id: "cat-flirty-wink", name: "Kucing Genit Kiss Heart", src: STICKER_CAT_FLIRTY_WINK, category: "cat" },
  { id: "cat-angry-pout", name: "Kucing Marah Gemes", src: STICKER_CAT_ANGRY, category: "cat" },
  { id: "cat-boba-drink", name: "Kucing Minum Boba", src: STICKER_CAT_BOBA, category: "cat" },
  { id: "cat-sleepy-cloud", name: "Kucing Tidur Zzz Cloud", src: STICKER_CAT_SLEEPY, category: "cat" },
  { id: "cat-gamer-headphone", name: "Kucing Gamer Pink Headphones", src: STICKER_CAT_GAMER, category: "cat" },
  { id: "cat-blue-ribbon-svg", name: "Kucing Pita Biru SVG", src: STICKER_CAT_BLUE_RIBBON, category: "cat" },
  { id: "cute-cat", name: "Cute Kitten White", src: "/stickers/cute-cat.svg", category: "cat" },

  // ==========================================
  // 🐲 STIKER NAILONG 3D KOSTUM PINTEREST (REAL 3D CUTOUT FULL BODY)
  // ==========================================
  // ==========================================
  // 🐲 STIKER NAILONG 3D KOSTUM PINTEREST (REAL 3D CUTOUT FULL BODY)
  // ==========================================
  { id: "nailong-cat-costume", name: "Nailong Kostum Kucing Full Body", src: "/stickers/nailong-cat-costume.png", category: "nailong" },
  { id: "nailong-dance-stretch", name: "Nailong Joget Stretch Full Body", src: "/stickers/nailong-dance-stretch.png", category: "nailong" },
  { id: "nailong-wave-happy", name: "Nailong Waving Happy Full Body", src: "/stickers/nailong-wave-happy.png", category: "nailong" },
  { id: "nailong-wave-face", name: "Nailong Intip Lucu Full Body", src: "/stickers/nailong-wave-face.png", category: "nailong" },
  { id: "nailong-silly-open", name: "Nailong Silly Lidah Melet Full Body", src: "/stickers/nailong-silly-open.png", category: "nailong" },
  { id: "nailong-shopping-bags", name: "Nailong Belanja Shopping Bags Full Body", src: "/stickers/nailong-shopping-bags.png", category: "nailong" },
  { id: "nailong-bear-shirt", name: "Nailong Kaos Beruang Full Body", src: "/stickers/nailong-bear-shirt.png", category: "nailong" },
  { id: "nailong-blep-derp", name: "Nailong Melet Gemes Full Body", src: "/stickers/nailong-blep-derp.png", category: "nailong" },
  { id: "nailong-curious", name: "Nailong Penasaran Gemes Full Body", src: "/stickers/nailong-curious.png", category: "nailong" },
  { id: "nailong-cheering", name: "Nailong Cheering Sorak Full Body", src: "/stickers/nailong-cheering.png", category: "nailong" },
  { id: "nailong-standing-scale", name: "Nailong Timbangan Berat Badan Full Body", src: "/stickers/nailong-standing-scale.png", category: "nailong" },
  { id: "nailong-sleepy-standing", name: "Nailong Ngantuk Tidur Full Body", src: "/stickers/nailong-sleepy-standing.png", category: "nailong" },
  { id: "nailong-angry-pointing", name: "Nailong Marah Menunjuk Full Body", src: "/stickers/nailong-angry-pointing.png", category: "nailong" },
  { id: "nailong-running-cute", name: "Nailong Lari Imut Full Body", src: "/stickers/nailong-running-cute.png", category: "nailong" },
  { id: "dino-yellow-real", name: "Real 3D Nailong Full Body", src: "/stickers/dino-yellow.png", category: "nailong" },
  { id: "nailong-kitty-strawberry", name: "Nailong 3D Hello Kitty Stroberi", src: "/stickers/nailong-cat-costume.png", category: "nailong" },
  { id: "nailong-mymelody-peach", name: "Nailong 3D My Melody Peach", src: "/stickers/nailong-curious.png", category: "nailong" },
  { id: "nailong-chicken-hoodie", name: "Nailong 3D Hoodie Ayam", src: "/stickers/nailong-cat-costume.png", category: "nailong" },
  { id: "nailong-sunflower-hat", name: "Nailong 3D Topi Bunga Matahari", src: "/stickers/nailong-wave-happy.png", category: "nailong" },
  { id: "nailong-watermelon", name: "Nailong Makan Semangka Segar", src: "/stickers/nailong-blep-derp.png", category: "nailong" },
  { id: "nailong-chef", name: "Nailong Chef Topi Koki", src: "/stickers/nailong-standing-scale.png", category: "nailong" },
  { id: "nailong-crying", name: "Nailong Menangis Gemes", src: "/stickers/nailong-sleepy-standing.png", category: "nailong" },
  { id: "nailong-cool-sunglasses", name: "Nailong Kacamata Hitam Cool", src: "/stickers/nailong-silly-open.png", category: "nailong" },
  { id: "nailong-sleepy-pillow", name: "Nailong Tidur Bantal Zzz", src: "/stickers/nailong-sleepy-standing.png", category: "nailong" },
  { id: "nailong-dance-party", name: "Nailong Joget Dance Party", src: "/stickers/nailong-dance-stretch.png", category: "nailong" },
  { id: "dino-yellow-full", name: "Nailong Full Body Cute", src: "/stickers/nailong-dance-stretch.png", category: "nailong" },
  { id: "nailong-boba-drink", name: "Nailong Minum Boba Tea", src: "/stickers/nailong-shopping-bags.png", category: "nailong" },
  { id: "nailong-laughing", name: "Nailong Ketawa Bahagia", src: "/stickers/nailong-cheering.png", category: "nailong" },
  { id: "nailong-angry-pout", name: "Nailong Marah Gemes", src: "/stickers/nailong-angry-pointing.png", category: "nailong" },
  { id: "nailong-hug-heart", name: "Nailong Peluk Hati Pink", src: "/stickers/nailong-curious.png", category: "nailong" },

  // ==========================================
  // ✨ STIKER AESTHETIC Y2K & COQUETTE (PINTEREST TREND)
  // ==========================================
  { id: "aesthetic-chrome-star", name: "Silver Chrome Y2K Star", src: STICKER_AESTHETIC_CHROME_STAR, category: "aesthetic" },
  { id: "aesthetic-cyber-heart", name: "Cyberpunk Gradient Heart", src: STICKER_AESTHETIC_CYBER_HEART, category: "aesthetic" },
  { id: "aesthetic-daisy-flower", name: "Cute Daisy Flower", src: STICKER_AESTHETIC_DAISY_FLOWER, category: "aesthetic" },
  { id: "pinterest-black-cat", name: "Cat Night Moon", src: STICKER_PINTEREST_BLACK_CAT, category: "aesthetic" },
  { id: "pinterest-bear-heart", name: "Teddy Hug Heart", src: STICKER_PINTEREST_BEAR_HEART, category: "aesthetic" },
  { id: "pinterest-boba", name: "Boba Creamy Drink", src: STICKER_PINTEREST_BOBA, category: "aesthetic" },
  { id: "pinterest-cake", name: "Choco Berry Cake", src: STICKER_PINTEREST_CAKE, category: "aesthetic" },
  { id: "pinterest-puppy", name: "Cute Puppy Fluffy", src: STICKER_PINTEREST_PUPPY, category: "aesthetic" },
  { id: "pinterest-bunny-star", name: "Bunny Star Yellow", src: STICKER_PINTEREST_BUNNY_STAR, category: "aesthetic" },

  { id: "cute-bear", name: "Teddy Bear", src: "/stickers/cute-bear.svg", category: "cute" },
  { id: "cute-bunny", name: "Fluffy Bunny", src: "/stickers/cute-bunny.svg", category: "cute" },
  { id: "cute-cloud", name: "Friendly Cloud", src: "/stickers/cute-cloud.svg", category: "cute" },
  { id: "cute-rainbow", name: "Sweet Rainbow", src: "/stickers/cute-rainbow.svg", category: "cute" },
  { id: "cute-heart", name: "Love Pink", src: "/stickers/cute-heart.svg", category: "cute" },
  { id: "cute-star", name: "Star Face", src: "/stickers/cute-star.svg", category: "cute" },
  { id: "cute-ghost", name: "Cute Ghost", src: "/stickers/cute-ghost.svg", category: "cute" },

  // Text & Speech Bubbles
  { id: "bubble-bestie", name: "Best Friends Bubble", src: "/stickers/bubble-bestie.svg", category: "text" },
  { id: "bubble-love", name: "Love Bubble", src: "/stickers/bubble-love.svg", category: "text" },
  { id: "bubble-ootd", name: "OOTD Tag", src: "/stickers/bubble-ootd.svg", category: "text" },
  { id: "bubble-happy", name: "Happy Day Speech", src: "/stickers/bubble-happy.svg", category: "text" },
  { id: "bubble-empty", name: "Blank Bubble", src: "/stickers/bubble-empty.svg", category: "text" },
  { id: "bubble-together", name: "Together Bubble", src: "/stickers/bubble-together.svg", category: "text" },

  // Emoji & Sparkles
  { id: "sparkle-gold", name: "Sparkle Gold", src: "/stickers/sparkle-gold.svg", category: "emoji" },
  { id: "sparkle-pink", name: "Sparkle Pink", src: "/stickers/sparkle-pink.svg", category: "emoji" },
  { id: "sparkle-blue", name: "Sparkle Blue", src: "/stickers/sparkle-blue.svg", category: "emoji" },
  { id: "emoji-smiley", name: "Smiley Emoji", src: "/stickers/emoji-smiley.svg", category: "emoji" },
  { id: "emoji-flower", name: "Sakura Flower", src: "/stickers/emoji-flower.svg", category: "emoji" },
  { id: "emoji-cherry", name: "Cherry Twins", src: "/stickers/emoji-cherry.svg", category: "emoji" },
  { id: "emoji-sun", name: "Cool Sun", src: "/stickers/emoji-sun.svg", category: "emoji" },

  { id: "cute-angry-cat", name: "Real Angry Ragdoll Cat (Doodle Outline)", src: STICKER_REAL_ANGRY_CAT, category: "cat" },
  { id: "cute-helmet-cat", name: "Real Kitten Wearing Helmet", src: STICKER_REAL_HELMET_CAT, category: "cat" },
  { id: "cat-hipster", name: "Real Hipster Cat Sunglasses", src: STICKER_REAL_HIPSTER_CAT, category: "cat" },
  { id: "cat-blue-ribbon-real", name: "Real Cat Blue Ribbon", src: STICKER_REAL_BLUE_RIBBON_CAT, category: "cat" },
  { id: "cat-pink-ribbon-real", name: "Real Cat Pink Ribbon", src: STICKER_REAL_PINK_RIBBON_CAT, category: "cat" },
  { id: "cat-scooter-red", name: "Real Cat Scooter Red", src: STICKER_CAT_SCOOTER, category: "cat" },
  { id: "cat-sunflower-hood", name: "Real Cat Sunflower Hood", src: STICKER_CAT_SUNFLOWER, category: "cat" },
  { id: "cat-banana-suit", name: "Real Cat Banana Suit", src: STICKER_CAT_BANANA, category: "cat" },
  { id: "cat-potato-suit", name: "Real Cat Potato Pouch", src: STICKER_CAT_POTATO, category: "cat" },
  { id: "cat-matcha-cup", name: "Real Cat Matcha Cup", src: STICKER_CAT_MATCHA_CUP, category: "cat" },
  { id: "cat-ny-cash", name: "Real Cat NY Cap & Cash", src: STICKER_CAT_NY_CAP_CASH, category: "cat" },
  { id: "cat-tulip-bouquet", name: "Real Cat Tulip Bouquet", src: STICKER_CAT_TULIP_BOUQUET, category: "cat" },
  { id: "grey-tabby-wink", name: "Kucing Genit Winking Paw", src: STICKER_GREY_TABBY_WINK, category: "cat" },
  { id: "cat-flirty-wink", name: "Kucing Genit Kiss Heart", src: STICKER_CAT_FLIRTY_WINK, category: "cat" },
  { id: "cat-angry-pout", name: "Kucing Marah Gemes", src: STICKER_CAT_ANGRY, category: "cat" },
  { id: "cat-boba-drink", name: "Kucing Minum Boba", src: STICKER_CAT_BOBA, category: "cat" },
  { id: "cat-sleepy-cloud", name: "Kucing Tidur Zzz Cloud", src: STICKER_CAT_SLEEPY, category: "cat" },
  { id: "cat-gamer-headphone", name: "Kucing Gamer Pink Headphones", src: STICKER_CAT_GAMER, category: "cat" },
  { id: "cat-blue-ribbon-svg", name: "Kucing Pita Biru SVG", src: STICKER_CAT_BLUE_RIBBON, category: "cat" },
  { id: "cute-cat", name: "Cute Kitten White", src: "/stickers/cute-cat.svg", category: "cat" },

  // ==========================================
  // 🐲 STIKER NAILONG 3D KOSTUM PINTEREST (REAL 3D CUTOUT)
  // ==========================================
  { id: "dino-yellow-real", name: "Real 3D Nailong Full Body", src: STICKER_REAL_DINO_YELLOW, category: "nailong" },
  { id: "nailong-kitty-strawberry", name: "Nailong 3D Hello Kitty Stroberi", src: STICKER_NAILONG_KITTY_STRAWBERRY, category: "nailong" },
  { id: "nailong-mymelody-peach", name: "Nailong 3D My Melody Peach", src: STICKER_NAILONG_MYMELODY_PEACH, category: "nailong" },
  { id: "nailong-chicken-hoodie", name: "Nailong 3D Hoodie Ayam", src: STICKER_NAILONG_CHICKEN_HOODIE, category: "nailong" },
  { id: "nailong-sunflower-hat", name: "Nailong 3D Topi Bunga Matahari", src: STICKER_NAILONG_SUNFLOWER_HAT, category: "nailong" },
  { id: "nailong-watermelon", name: "Nailong Makan Semangka Segar", src: STICKER_NAILONG_WATERMELON, category: "nailong" },
  { id: "nailong-chef", name: "Nailong Chef Topi Koki", src: STICKER_NAILONG_CHEF, category: "nailong" },
  { id: "nailong-crying", name: "Nailong Menangis Gemes", src: STICKER_NAILONG_CRYING, category: "nailong" },
  { id: "nailong-cool-sunglasses", name: "Nailong Kacamata Hitam Cool", src: STICKER_NAILONG_COOL_SUNGLASSES, category: "nailong" },
  { id: "nailong-sleepy-pillow", name: "Nailong Tidur Bantal Zzz", src: STICKER_NAILONG_SLEEPY_PILLOW, category: "nailong" },
  { id: "nailong-dance-party", name: "Nailong Joget Dance Party", src: STICKER_NAILONG_DANCE_PARTY, category: "nailong" },
  { id: "dino-yellow-full", name: "Nailong Full Body Cute", src: STICKER_NAILONG_FULL, category: "nailong" },
  { id: "nailong-boba-drink", name: "Nailong Minum Boba Tea", src: STICKER_NAILONG_BOBA, category: "nailong" },
  { id: "nailong-laughing", name: "Nailong Ketawa Bahagia", src: STICKER_NAILONG_LAUGH, category: "nailong" },
  { id: "nailong-angry-pout", name: "Nailong Marah Gemes", src: STICKER_NAILONG_ANGRY, category: "nailong" },
  { id: "nailong-hug-heart", name: "Nailong Peluk Hati Pink", src: STICKER_NAILONG_HEART, category: "nailong" },

  // ==========================================
  // ✨ STIKER AESTHETIC & MODERN
  // ==========================================
  { id: "aesthetic-chrome-star", name: "Y2K Metallic Chrome Starburst", src: STICKER_AESTHETIC_CHROME_STAR, category: "aesthetic" },
  { id: "aesthetic-cyber-heart", name: "Cyber Holographic Pink Heart", src: STICKER_AESTHETIC_CYBER_HEART, category: "aesthetic" },
  { id: "aesthetic-daisy-flower", name: "Modern Minimalist White Daisy", src: STICKER_AESTHETIC_DAISY_FLOWER, category: "aesthetic" },
  { id: "y2k-chrome-star", name: "Y2K Metallic Star Burst", src: STICKER_Y2K_CHROME_STAR, category: "aesthetic" },
  { id: "coquette-bow", name: "Coquette Pink Velvet Bow", src: STICKER_COQUETTE_BOW, category: "aesthetic" },
  { id: "matcha-boba", name: "Matcha Latte Boba Cup", src: STICKER_MATCHA_BOBA, category: "aesthetic" },
  { id: "flower-lily", name: "Aesthetic Lily Flower Pink", src: STICKER_FLOWER_LILY, category: "aesthetic" },
  { id: "flower-plumeria", name: "Bunga Kamboja Bali Aesthetic", src: STICKER_FLOWER_PLUMERIA, category: "aesthetic" },

  // ==========================================
  // 🦸 SPIDERMAN MARVEL & OTHER BADGES
  // ==========================================
  { id: "spiderman-hanging", name: "Spiderman Hanging Upside Down", src: STICKER_SPIDERMAN_HANGING, category: "badge" },
  { id: "spiderman-camera", name: "Spiderman Taking Photo", src: STICKER_SPIDERMAN_CAMERA, category: "badge" },
  { id: "spiderman-headphones", name: "Spiderman Beats Headphones", src: STICKER_SPIDERMAN_HEADPHONES, category: "badge" },
  { id: "spiderman-heart-mask", name: "Spiderman Heart Mask", src: STICKER_SPIDERMAN_HEART_MASK, category: "badge" },
  { id: "marvel-logo-box", name: "Marvel Red Logo Box", src: STICKER_MARVEL_LOGO, category: "badge" },
  { id: "spider-web-heart", name: "Spider Web Heart Y2K", src: STICKER_SPIDER_WEB_HEART, category: "emoji" },
  { id: "spiderman-chibi", name: "Chibi Spiderman Mini", src: STICKER_SPIDERMAN_CHIBI, category: "cute" },
  { id: "spiderman-hand-sign", name: "Spiderman Web Shooter Hand", src: STICKER_SPIDERMAN_HAND_SIGN, category: "badge" },

  // KOLEKSI KAWAII & PINTEREST
  { id: "pinterest-bear-heart", name: "Teddy Bear Holding Heart", src: STICKER_PINTEREST_BEAR_HEART, category: "cute" },
  { id: "pinterest-boba-tea", name: "Boba Milk Tea Heart", src: STICKER_PINTEREST_BOBA, category: "cute" },
  { id: "pinterest-choco-cake", name: "Bear Chocolate Cake", src: STICKER_PINTEREST_CAKE, category: "cute" },
  { id: "pinterest-puppy-bear", name: "Fluffy Puppy & Bear", src: STICKER_PINTEREST_PUPPY, category: "cute" },
  { id: "pinterest-bunny-star", name: "Winking Bunny Star", src: STICKER_PINTEREST_BUNNY_STAR, category: "cute" },
  { id: "snoopy-hearts", name: "Snoopy Peluk Hati", src: STICKER_SNOOPY_HEARTS, category: "cute" },
  { id: "cute-bear", name: "Teddy Bear", src: "/stickers/cute-bear.svg", category: "cute" },
  { id: "cute-bunny", name: "Fluffy Bunny", src: "/stickers/cute-bunny.svg", category: "cute" },
  { id: "cute-cloud", name: "Friendly Cloud", src: "/stickers/cute-cloud.svg", category: "cute" },
  { id: "cute-rainbow", name: "Sweet Rainbow", src: "/stickers/cute-rainbow.svg", category: "cute" },
  { id: "cute-heart", name: "Love Pink", src: "/stickers/cute-heart.svg", category: "cute" },
  { id: "cute-star", name: "Star Face", src: "/stickers/cute-star.svg", category: "cute" },
  { id: "cute-ghost", name: "Cute Ghost", src: "/stickers/cute-ghost.svg", category: "cute" },

  // TEXT BUBBLES
  { id: "bubble-bestie", name: "Best Friends Bubble", src: "/stickers/bubble-bestie.svg", category: "text" },
  { id: "bubble-love", name: "Love Bubble", src: "/stickers/bubble-love.svg", category: "text" },
  { id: "bubble-ootd", name: "OOTD Tag", src: "/stickers/bubble-ootd.svg", category: "text" },
  { id: "bubble-happy", name: "Happy Day Speech", src: "/stickers/bubble-happy.svg", category: "text" },
  { id: "bubble-empty", name: "Blank Bubble", src: "/stickers/bubble-empty.svg", category: "text" },
  { id: "bubble-together", name: "Together Bubble", src: "/stickers/bubble-together.svg", category: "text" },

  // SPARKLES / EMOJIS
  { id: "sparkle-gold", name: "Sparkle Gold", src: "/stickers/sparkle-gold.svg", category: "emoji" },
  { id: "sparkle-pink", name: "Sparkle Pink", src: "/stickers/sparkle-pink.svg", category: "emoji" },
  { id: "sparkle-blue", name: "Sparkle Blue", src: "/stickers/sparkle-blue.svg", category: "emoji" },
  { id: "emoji-smiley", name: "Smiley Emoji", src: "/stickers/emoji-smiley.svg", category: "emoji" },
  { id: "emoji-flower", name: "Sakura Flower", src: "/stickers/emoji-flower.svg", category: "emoji" },
  { id: "emoji-cherry", name: "Cherry Twins", src: "/stickers/emoji-cherry.svg", category: "emoji" },
  { id: "emoji-sun", name: "Cool Sun", src: "/stickers/emoji-sun.svg", category: "emoji" },

  // WASHI TAPES
  { id: "tape-mint", name: "Washi Mint", src: "/stickers/tape-mint.svg", category: "washi" },
  { id: "tape-pink", name: "Washi Pink", src: "/stickers/tape-pink.svg", category: "washi" },
  { id: "tape-gold", name: "Washi Gold", src: "/stickers/tape-gold.svg", category: "washi" },
  { id: "tape-purple", name: "Washi Purple", src: "/stickers/tape-purple.svg", category: "washi" },
  { id: "tape-blue", name: "Washi Blue", src: "/stickers/tape-blue.svg", category: "washi" },

  // BADGES & CELEBRATION
  { id: "badge-ribbon", name: "Gold Ribbon Medal", src: "/stickers/badge-ribbon.svg", category: "badge" },
  { id: "badge-cake", name: "Birthday Cake", src: "/stickers/badge-cake.svg", category: "badge" },
  { id: "badge-balloon", name: "Party Balloon", src: "/stickers/badge-balloon.svg", category: "badge" },
  { id: "badge-star", name: "Star Badge Medal", src: "/stickers/badge-star.svg", category: "badge" },
  { id: "emoji-camera", name: "Photo Camera", src: "/stickers/emoji-camera.svg", category: "emoji" },
  { id: "disco-ball", name: "Disco Ball", src: "/stickers/disco-ball.svg", category: "badge" },
  { id: "vinyl-record", name: "Vinyl Record", src: "/stickers/vinyl-record.svg", category: "badge" },

  // ==========================================
  // 🏴‍☠️ STIKER ONE PIECE & LUFFY (NEW)
  // ==========================================
  { id: "monkey-dluffy", name: "Monkey D. Luffy Pirate", src: "/stickers/monkey-dluffy.png", category: "anime" },
  { id: "luffy-onpeace", name: "Luffy One Piece Peace Sign", src: "/stickers/luffy-onpeace.png", category: "anime" },
  { id: "luffy-boon", name: "Luffy Cute Smile", src: "/stickers/luffy-boon.png", category: "anime" },
  { id: "kapal-luffy", name: "Kapal Bajak Laut Going Merry / Sunny", src: "/stickers/kapal-luffy.png", category: "anime" },

  // ==========================================
  // 🖤 STIKER BLACK Y2K & GOTHIC DARK (NEW)
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
  // 🦊 STIKER HEWAN KAWAII EXTRA (NEW)
  // ==========================================
  { id: "cute-corgi", name: "Cute Corgi Dog", src: "/stickers/cute-corgi.svg", category: "cute" },
  { id: "cute-duckling", name: "Cute Yellow Duckling", src: "/stickers/cute-duckling.svg", category: "cute" },
  { id: "cute-fox", name: "Cute Red Fox", src: "/stickers/cute-fox.svg", category: "cute" },
  { id: "cute-otter", name: "Cute Playful Otter", src: "/stickers/cute-otter.svg", category: "cute" },
  { id: "cute-panda", name: "Cute Panda Bear", src: "/stickers/cute-panda.svg", category: "cute" },
  { id: "cute-penguin", name: "Cute Baby Penguin", src: "/stickers/cute-penguin.svg", category: "cute" },
  { id: "cute-unicorn", name: "Cute Magical Unicorn", src: "/stickers/cute-unicorn.svg", category: "cute" },
  { id: "cute-boba-svg", name: "Cute Boba Drink SVG", src: "/stickers/cute-boba.svg", category: "cute" },
  { id: "ghost-hantu", name: "Cute Ghost Hantu", src: "/stickers/ghost-hantu.png", category: "cute" },
  { id: "panda-tidur", name: "Panda Tidur Cute", src: "/stickers/panda-tidur.png", category: "cute" },
  { id: "snoopy-hearts-hd", name: "Snoopy Peluk Hati HD", src: "/stickers/snoopy-hearts.png.png", category: "cute" },

  // ==========================================
  // 🐱 STIKER REAL CATS PNG CLEAN CUTOUTS (NEW)
  // ==========================================
  { id: "cat-blue-ribbon-clean", name: "Real Cat Blue Ribbon PNG", src: "/stickers/cat-blue-ribbon-clean.png", category: "cat" },
  { id: "cat-hipster-clean", name: "Real Cat Hipster PNG", src: "/stickers/cat-hipster-clean.png", category: "cat" },
  { id: "cat-pink-ribbon-clean", name: "Real Cat Pink Ribbon PNG", src: "/stickers/cat-pink-ribbon-clean.png", category: "cat" },
  { id: "cute-angry-cat-png", name: "Real Angry Cat PNG", src: "/stickers/cute-angry-cat.png", category: "cat" },
  { id: "cute-helmet-cat-png", name: "Real Kitten Helmet PNG", src: "/stickers/cute-helmet-cat.png", category: "cat" },
  { id: "kucing-hitam-png", name: "Black Cat Gemes PNG", src: "/stickers/kucing-hitam.png", category: "cat" },
  { id: "dino-yellow-clean", name: "Nailong Yellow Clean PNG", src: "/stickers/dino-yellow-clean.png", category: "nailong" }
];

// ============================================================================
// PAKET AUTO-SPREAD BARU (KUCING SQUAD, NAILONG PARTY, AESTHETIC Y2K & SPIDERMAN)
// ============================================================================
export const stickerPacks: StickerPack[] = [
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
    id: "pack-cat-squad",
    name: "Real Cat Photo Pinterest 🐱",
    category: "cat",
    icon: "/stickers/cat-blue-ribbon-clean.png",
    stickers: [
      "/stickers/cat-blue-ribbon-clean.png",
      "/stickers/cat-pink-ribbon-clean.png",
      "/stickers/cat-hipster-clean.png",
      "/stickers/kucing-hitam.png",
      "/stickers/cute-angry-cat.png",
      "/stickers/cute-helmet-cat.png"
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
      "/stickers/chioo-del.png",
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
    id: "pack-cat-squad",
    name: "Real Cat Photo Pinterest 🐱",
    category: "cat",
    icon: STICKER_REAL_ANGRY_CAT,
    stickers: [
      STICKER_REAL_ANGRY_CAT,
      STICKER_REAL_HELMET_CAT,
      STICKER_REAL_HIPSTER_CAT,
      STICKER_REAL_PINK_RIBBON_CAT
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
    id: "pack-aesthetic-modern",
    name: "Aesthetic Y2K & Coquette ✨",
    category: "aesthetic",
    icon: STICKER_AESTHETIC_CHROME_STAR,
    requiredTier: 'premium',
    stickers: [
      STICKER_AESTHETIC_CHROME_STAR,
      STICKER_AESTHETIC_CYBER_HEART,
      STICKER_COQUETTE_BOW,
      STICKER_AESTHETIC_DAISY_FLOWER
    ]
  },
  {
    id: "pack-spiderman-ultimate",
    name: "Spiderman Marvel Ultimate 🕷️",
    category: "badge",
    icon: STICKER_SPIDERMAN_HANGING,
    requiredTier: 'premium',
    stickers: [
      STICKER_SPIDERMAN_HANGING,
      STICKER_SPIDERMAN_CAMERA,
      STICKER_SPIDERMAN_HEADPHONES,
      STICKER_SPIDERMAN_HEART_MASK
    ]
  },
  {
    id: "pack-spiderman-y2k",
    name: "Marvel Web & Beats 🎧",
    category: "badge",
    icon: STICKER_MARVEL_LOGO,
    requiredTier: 'premium',
    stickers: [
      STICKER_MARVEL_LOGO,
      STICKER_SPIDER_WEB_HEART,
      STICKER_SPIDERMAN_CHIBI,
      STICKER_SPIDERMAN_HAND_SIGN
    ]
  },
  {
    id: "pack-pinterest-kawaii",
    name: "Cute Kawaii Collection 🎀",
    category: "cute",
    icon: STICKER_PINTEREST_BLACK_CAT,
    requiredTier: 'basic',
    stickers: [
      STICKER_PINTEREST_BLACK_CAT,
      STICKER_PINTEREST_BEAR_HEART,
      STICKER_PINTEREST_BOBA,
      STICKER_PINTEREST_CAKE
    ]
  },
  {
    id: "pack-coquette-vibe",
    name: "Coquette Bow & Cherries 🌸",
    category: "cute",
    icon: STICKER_COQUETTE_BOW,
    requiredTier: 'premium',
    stickers: [
      STICKER_COQUETTE_BOW,
      STICKER_GREY_TABBY_WINK,
      STICKER_CAT_PINK_RIBBON,
      STICKER_FLOWER_LILY
    ]
  },
  {
    id: "pack-cat-classic",
    name: "Kucing Cute Pack 🐾",
    category: "cute",
    icon: "/stickers/cute-cat.svg",
    requiredTier: 'free',
    stickers: [
      "/stickers/cute-cat.svg",
      "/stickers/cute-angry-cat.png",
      "/stickers/cute-helmet-cat.png",
      "/stickers/cute-heart.svg"
    ]
  },
  {
    id: "pack-kawaii",
    name: "Kawaii Friends ☁️",
    category: "cute",
    icon: "/stickers/cute-bunny.svg",
    requiredTier: 'free',
    stickers: [
      "/stickers/cute-bunny.svg",
      "/stickers/cute-bear.svg",
      "/stickers/cute-cloud.svg",
      "/stickers/cute-rainbow.svg"
    ]
  },
  {
    id: "pack-sparkles",
    name: "Sparkle Y2K Magic ✨",
    category: "emoji",
    icon: "/stickers/sparkle-gold.svg",
    requiredTier: 'basic',
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
    requiredTier: 'basic',
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
    requiredTier: 'basic',
    stickers: [
      "/stickers/bubble-love.svg",
      "/stickers/bubble-bestie.svg",
      "/stickers/bubble-happy.svg",
      "/stickers/bubble-ootd.svg"
    ]
  }
]