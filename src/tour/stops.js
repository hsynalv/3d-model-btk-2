// Scroll turu. Koordinatlar metre (scripts/items.config.mjs ile aynı sahne uzayı, göz hizası ≈ 1.6 m).
// KEYFRAMES sırasıyla kamera rotasıdır: `stop` içeren kareler sayfadaki bir bölüme karşılık gelir,
// diğerleri duvarların içinden geçmemek için ara noktalardır (odalar arası geçişte kamera
// duvarların üstüne çıkar, tavan bu sırada otomatik gizlenir).

export const ITEM_LABELS = {
  sofa: 'Kanepe',
  bookcase: 'Kitaplık',
  'tv-unit': 'TV Ünitesi',
  dining: 'Yemek Masası',
  rug: 'Halı',
  cooktop: 'Ocak ve Fırın',
  kitchen: 'Mutfak Dolapları',
  'tall-unit': 'Ankastre Kolon',
  washer: 'Çamaşır Makinesi',
  'sink-1': 'Lavabo',
  'toilet-1': 'Klozet',
  'bidet-1': 'Bide',
  'shower-1': 'Duş Kabini',
  'sink-2': 'Lavabo',
  'shower-2': 'Duş Kabini',
  'bed-1': 'Yatak',
  'desk-1': 'Çalışma Masası',
  'chair-1': 'Sandalye',
  'wardrobe-1': 'Gardırop',
  'bed-2': 'Yatak',
  'desk-2': 'Çalışma Masası',
  'wardrobe-2': 'Gardırop',
};

export const STOPS = [
  {
    eyebrow: 'Genel bakış',
    title: 'Via Boncompagni’de üç oda',
    text: 'Milano’da, Via Boncompagni’de iki yatak odalı aydınlık bir daire. Aşağı kaydırarak odaları tek tek gezin; dilediğiniz eşyaya tıklayıp yakından inceleyin.',
  },
  {
    eyebrow: 'Salon',
    title: 'Ferah bir salon',
    text: 'Geniş pencerelerden gün ışığı alan salonda su yeşili kanepe ve siyah çerçeveli kitaplık mekânın karakterini belirliyor.',
    items: ['sofa', 'bookcase'],
    align: 'right',
  },
  {
    eyebrow: 'Salon',
    title: 'Medya duvarı',
    text: 'Mutfak duvarına yaslanan antrasit konsol, beton kaplı kolon ve yüzen raflarla tek parça bir TV ünitesi.',
    items: ['tv-unit'],
  },
  {
    eyebrow: 'Yemek alanı',
    title: 'Dört kişilik sofra',
    text: 'Mutfağın hemen önünde, yuvarlak halının üzerinde mermer tablalı yemek masası.',
    items: ['dining', 'rug'],
    align: 'right',
  },
  {
    eyebrow: 'Mutfak',
    title: 'Kompakt L mutfak',
    text: 'Beyaz lake dolaplar, gömme ocak ve fırın, buzdolabını saklayan boy kolonu. Kırmızı karo zemin mekâna sıcaklık katıyor.',
    items: ['kitchen', 'cooktop', 'tall-unit'],
  },
  {
    eyebrow: 'Koridor',
    title: 'Gizli çamaşır nişi',
    text: 'Salondan uzanan koridorun nişinde, rafların altına yerleşmiş çamaşır makinesi. Koridor iki banyoya ve iki odaya açılıyor.',
    items: ['washer'],
    align: 'right',
  },
  {
    eyebrow: 'Banyo',
    title: 'Mozaik banyo',
    text: 'Mavi cam mozaik zemin, granit desenli lambri, cam kapılı duş kabini, dolaplı lavabo ve vitrifiye.',
    items: ['shower-1', 'sink-1', 'toilet-1', 'bidet-1'],
  },
  {
    eyebrow: 'Yatak odası',
    title: 'Sakin bir yatak odası',
    text: 'Beyaz çerçeveli yatak, pencere yanında çalışma köşesi ve koyu meşe gardıroplu sade bir oda.',
    items: ['bed-1', 'wardrobe-1', 'desk-1', 'chair-1'],
    align: 'right',
  },
  {
    eyebrow: 'Çalışma odası',
    title: 'Misafir ve çalışma odası',
    text: 'İkinci oda; tek kişilik yatak, beyaz meşe çalışma masası ve gömme gardıropla hem misafir hem çalışma odası.',
    items: ['bed-2', 'desk-2', 'wardrobe-2'],
  },
  {
    eyebrow: 'Plan',
    title: 'Şimdi sıra sizde',
    text: 'Serbest keşif modunda daireyi dilediğiniz açıdan döndürün, yakınlaşın ve her eşyaya tıklayarak odaklanın.',
    cta: 'Serbest keşfe başla',
  },
];

const EYE = 1.6;
const HOP = 3.4; // odalar arası geçişte duvar üstü yüksekliği

export const KEYFRAMES = [
  { stop: true, pos: [-1.2, 10.5, 9.0], look: [-1.6, 0, 0.3] }, // genel bakış (kart solda, model sağa kaydırıldı)
  { pos: [2.2, 4.2, 3.6], look: [3.6, 0.6, -0.2] },
  { stop: true, pos: [1.5, EYE, 2.3], look: [4.7, 0.6, -0.6] }, // salon: kanepe + kitaplık
  { stop: true, pos: [5.0, 1.55, -0.4], look: [2.1, 0.95, -0.8] }, // TV ünitesi
  { stop: true, pos: [3.9, EYE, 0.0], look: [1.2, 0.5, 2.4] }, // yemek masası
  { stop: true, pos: [0.7, 1.7, 1.2], look: [1.3, 0.9, -2.2] }, // mutfak
  { pos: [0.6, EYE, 0.8], look: [-1.0, 1.2, 0.8] }, // koridor kapısı (x≈0.2, z 0.4–1.2)
  { pos: [-0.5, EYE, 0.8], look: [-1.5, 1.0, 0.2] },
  { stop: true, pos: [-1.5, 1.55, -0.3], look: [-0.2, 0.55, -0.45] }, // koridor + çamaşır nişi
  { pos: [-0.4, 1.65, 0.95], look: [-0.7, 0.8, 2.6] }, // banyo kapısı (x -0.69–0.07, z≈1.35)
  { stop: true, pos: [-0.4, 1.7, 1.6], look: [-1.0, 0.6, 3.0] }, // banyo
  { pos: [-0.5, HOP, 1.7], look: [-1.6, 0.6, 1.0] },
  { pos: [-2.4, HOP, -0.4], look: [-4.4, 0.6, -2.2] },
  { stop: true, pos: [-2.6, EYE, -0.55], look: [-4.5, 0.5, -2.2] }, // yatak odası
  { pos: [-2.6, HOP, -0.5], look: [-3.6, 0.6, 1.0] },
  { pos: [-2.15, HOP, 0.7], look: [-4.0, 0.6, 2.6] },
  { stop: true, pos: [-2.15, 1.85, 0.7], look: [-4.3, 0.4, 2.9] }, // çalışma odası
  { pos: [-1.0, 7.0, 4.0], look: [0, 0, 0.5] },
  { stop: true, pos: [-2.4, 13.5, 0.6], look: [-2.4, 0, 0] }, // plan görünümü
];
