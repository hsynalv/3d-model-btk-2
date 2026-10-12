// Tüm koordinatlar build-model.mjs'nin ürettiği sahne uzayındadır:
// metre, Y yukarı, dairenin XZ merkezi orijinde (+x salon tarafı, -x yatak odaları; -z mutfak cephesi, +z yemek alanı).
//
// match kuralları (herhangi biri eşleşirse üçgen eşyaya aittir):
//   { node: 'Object_13' }                    → kaynak node'un tüm üçgenleri
//   { node: 'Object_74', box: [[x,y,z],[x,y,z]] } → o node'da, merkezi kutuya düşen üçgenler
// Kaynak 3ds export'u eşyaları malzemeye göre birleştirdiği için (ör. tüm beyaz eşyalar
// "White" mesh'lerinde) kutu kuralları bu birleşik mesh'leri parçalamak için kullanılır.

const ALL_Y = [-1, 3];
const box = (x0, x1, z0, z1, [y0, y1] = ALL_Y) => [
  [x0, y0, z0],
  [x1, y1, z1],
];
const nodes = (...names) => names.map((node) => ({ node }));

// light: oda tavan ışığı konumu; aynı nokta eşyaya odaklanırken kameranın geri çekileceği oda merkezidir.
export const ROOMS = {
  salon: { label: 'Salon', light: [3.6, 2.25, 0.2] },
  yemek: { label: 'Yemek Alanı', light: [1.2, 2.25, 2.1] },
  mutfak: { label: 'Mutfak', light: [1.0, 2.25, -1.4] },
  koridor: { label: 'Koridor', light: [-0.9, 2.25, 0.7] },
  banyo1: { label: 'Banyo', light: [-0.9, 2.25, 2.4] },
  banyo2: { label: 'Ebeveyn Banyosu', light: [-0.9, 2.25, -2.3] },
  yatak1: { label: 'Yatak Odası', light: [-3.7, 2.25, -1.4] },
  yatak2: { label: 'Çalışma Odası', light: [-3.7, 2.25, 2.0] },
};

export const ITEMS = [
  // ------------------------------------------------------------- salon
  {
    id: 'sofa',
    label: 'Kanepe',
    room: 'salon',
    description: 'Su yeşili kumaş döşemeli üçlü kanepe; TV duvarının tam karşısında.',
    match: nodes('Object_13'),
  },
  {
    id: 'bookcase',
    label: 'Kitaplık',
    room: 'salon',
    description: 'Siyah çerçeveli, asimetrik raflı ve pirinç kulplu çekmeceli kitaplık.',
    match: nodes('Object_18', 'Object_16'),
  },
  {
    id: 'tv-unit',
    label: 'TV Ünitesi',
    room: 'salon',
    description: 'Antrasit meşe alçak konsol, beton kaplamalı kolon, yüzen raflar ve televizyon.',
    match: [
      ...nodes('Object_56', 'Object_55', 'Object_57', 'Object_42', 'Object_21', 'Object_54'),
      { node: 'Object_25', box: box(1.95, 2.15, -1.2, 0.2) },
    ],
  },
  // ------------------------------------------------------------- yemek
  {
    id: 'dining',
    label: 'Yemek Masası',
    room: 'yemek',
    description: 'Mermer görünümlü yuvarlak tabla, çapraz ahşap ayaklar ve dört metal sandalye.',
    match: nodes('Object_63', 'Object_48', 'Object_12'),
  },
  {
    id: 'rug',
    label: 'Halı',
    room: 'yemek',
    description: 'Yemek masasının altında yeşil bordürlü yuvarlak halı.',
    match: nodes('Object_22', 'Object_4'),
  },
  // ------------------------------------------------------------- mutfak
  {
    id: 'cooktop',
    label: 'Ocak ve Fırın',
    room: 'mutfak',
    description: 'Tezgâha gömülü dört gözlü ocak ve altında dijital saatli ankastre fırın.',
    match: nodes('Object_2', 'Object_3', 'Object_7', 'Object_8', 'Object_19', 'Object_20', 'Object_23'),
  },
  {
    id: 'kitchen',
    label: 'Mutfak Dolapları',
    room: 'mutfak',
    description: 'L biçimli beyaz alt dolaplar, tezgâh ve üst dolaplar.',
    match: [
      ...nodes('Object_75', 'Object_15'),
      { node: 'Object_74', box: box(0.25, 1.9, -2.8, -1.4, [0, 0.9]) },
      { node: 'Object_36', box: box(0.25, 1.9, -2.8, -0.3, [0.85, 0.95]) },
      { node: 'Object_73', box: box(1.5, 1.9, -2.6, -0.35, [1.5, 2.3]) },
    ],
  },
  {
    id: 'tall-unit',
    label: 'Ankastre Kolon',
    room: 'mutfak',
    description: 'Buzdolabı ve ankastre cihazların yer aldığı boy dolabı.',
    match: [
      ...nodes('Object_37', 'Object_9', 'Object_17'),
      { node: 'Object_74', box: box(1.2, 1.9, -1.12, 0.3, [0, 1.8]) },
      { node: 'Object_50', box: box(1.25, 1.9, -0.4, 0.3, [0, 1.8]) },
    ],
  },
  // ------------------------------------------------------------- koridor
  {
    id: 'washer',
    label: 'Çamaşır Makinesi',
    room: 'koridor',
    description: 'Koridordaki nişte ön yüklemeli çamaşır makinesi ve üstünde açık raflar.',
    match: [
      ...nodes('Object_29', 'Object_14'),
      { node: 'Object_58', box: box(-0.5, 0.1, -0.95, 0.1, [0.7, 1.85]) },
      { node: 'Object_74', box: box(-0.55, 0.05, -0.7, -0.2, [0.2, 0.65]) },
      { node: 'Object_50', box: box(-0.5, -0.46, -0.7, -0.6) },
    ],
  },
  // ------------------------------------------------------------- banyo (+z)
  {
    id: 'sink-1',
    label: 'Lavabo',
    room: 'banyo1',
    description: 'Dolaplı seramik lavabo ve krom batarya; üstünde boydan ayna.',
    match: [...nodes('Object_51', 'Object_70'), { node: 'Object_49', box: box(-2, -1.5, 1, 3) }],
  },
  {
    id: 'toilet-1',
    label: 'Klozet',
    room: 'banyo1',
    description: 'Yerden klozet.',
    match: [{ node: 'Object_72', box: box(-0.5, 0.1, 2.5, 3.0) }],
  },
  {
    id: 'bidet-1',
    label: 'Bide',
    room: 'banyo1',
    description: 'Klozetin yanında bide ve bataryası.',
    match: [...nodes('Object_30', 'Object_65'), { node: 'Object_47', box: box(-0.3, 0.1, 1.5, 2.5) }],
  },
  {
    id: 'shower-1',
    label: 'Duş Kabini',
    room: 'banyo1',
    description: 'Cam kapılı duş kabini ve beyaz duş teknesi.',
    match: [
      { node: 'Object_33', box: box(-2, 0, 2, 3) },
      { node: 'Object_74', box: box(-1.85, -0.85, 2.5, 3.4, [0, 0.1]) },
      { node: 'Object_50', box: box(-1.85, -1.35, 2.8, 3.2, [1.75, 1.95]) },
    ],
  },
  // ------------------------------------------------------------- banyo (-z)
  {
    id: 'sink-2',
    label: 'Lavabo',
    room: 'banyo2',
    description: 'Dolaplı seramik lavabo ve krom batarya; üstünde boydan ayna.',
    match: [...nodes('Object_52', 'Object_71'), { node: 'Object_49', box: box(-2, -1.5, -3, -1) }],
  },
  {
    id: 'toilet-2',
    label: 'Klozet',
    room: 'banyo2',
    description: 'Yerden klozet.',
    match: [{ node: 'Object_74', box: box(-0.9, -0.35, -3.2, -2.8, [0, 0.45]) }],
  },
  {
    id: 'bidet-2',
    label: 'Bide',
    room: 'banyo2',
    description: 'Klozetin yanında bide ve bataryası.',
    match: [...nodes('Object_31', 'Object_66'), { node: 'Object_47', box: box(-0.7, -0.4, -2.6, -2.3) }],
  },
  {
    id: 'shower-2',
    label: 'Duş Kabini',
    room: 'banyo2',
    description: 'Cam kapılı duş kabini ve beyaz duş teknesi.',
    match: [
      { node: 'Object_33', box: box(-1, 0, -2, -0.9) },
      { node: 'Object_74', box: box(-0.85, 0.1, -1.9, -0.95, [0, 0.1]) },
      { node: 'Object_50', box: box(-0.35, 0.2, -1.5, -1.2, [1.75, 1.95]) },
    ],
  },
  // ------------------------------------------------------------- yatak odası (-z)
  {
    id: 'bed-1',
    label: 'Yatak',
    room: 'yatak1',
    description: 'Beyaz ahşap çerçeveli tek kişilik yatak ve mavi nevresim.',
    match: [
      ...nodes('Object_40'),
      { node: 'Object_76', box: box(-5.2, -4, -3.4, -1.2) },
      { node: 'Object_38', box: box(-5.2, -4, -3.4, -1.2) },
    ],
  },
  {
    id: 'desk-1',
    label: 'Çalışma Masası',
    room: 'yatak1',
    description: 'Çekmeceli koyu meşe çalışma masası.',
    match: [{ node: 'Object_60', box: box(-5.3, -4.5, -1, 0.3) }],
  },
  {
    id: 'chair-1',
    label: 'Çalışma Sandalyesi',
    room: 'yatak1',
    description: 'Tekerlekli, kumaş oturaklı çalışma sandalyesi.',
    match: [
      ...nodes('Object_27'),
      { node: 'Object_32', box: box(-5.1, -4.4, -0.5, 0.1) },
      { node: 'Object_25', box: box(-5.25, -4.65, 0.1, 0.3, [0, 0.1]) },
      { node: 'Object_72', box: box(-5.25, -4.65, -0.55, 0.25, [0, 0.1]) },
    ],
  },
  {
    id: 'wardrobe-1',
    label: 'Gardırop',
    room: 'yatak1',
    description: 'Koyu meşe kapaklı, tavana yakın boy gardırop.',
    match: [...nodes('Object_62'), { node: 'Object_60', box: box(-2.6, -1.9, -3.1, -0.9) }],
  },
  // ------------------------------------------------------------- çalışma / misafir odası (+z)
  {
    id: 'bed-2',
    label: 'Yatak',
    room: 'yatak2',
    description: 'Beyaz ahşap çerçeveli tek kişilik yatak ve yastık.',
    match: [
      ...nodes('Object_41', 'Object_39', 'Object_59'),
      { node: 'Object_76', box: box(-3.6, -1.9, 1.2, 3.4) },
      { node: 'Object_38', box: box(-3.6, -1.9, 1.2, 3.4) },
    ],
  },
  {
    id: 'desk-2',
    label: 'Çalışma Masası',
    room: 'yatak2',
    description: 'Beyaz meşe tablalı çalışma masası ve çekmeceli keson.',
    match: [
      { node: 'Object_76', box: box(-5, -4.2, 2.7, 3.4) },
      { node: 'Object_74', box: box(-4.3, -3.8, 2.7, 3.4) },
    ],
  },
  {
    id: 'chair-2',
    label: 'Çalışma Sandalyesi',
    room: 'yatak2',
    description: 'Tekerlekli, kumaş oturaklı çalışma sandalyesi.',
    match: [
      ...nodes('Object_28'),
      { node: 'Object_32', box: box(-4.9, -4.3, 2.5, 3.1) },
      { node: 'Object_25', box: box(-4.3, -4.2, 2.8, 3.35, [0, 0.1]) },
      { node: 'Object_73', box: box(-5, -4.2, 2.8, 3.35, [0, 0.1]) },
    ],
  },
  {
    id: 'wardrobe-2',
    label: 'Gardırop',
    room: 'yatak2',
    description: 'Beyaz meşe kapaklı gömme gardırop.',
    match: [...nodes('Object_61'), { node: 'Object_58', box: box(-5.2, -3.4, 0.3, 0.9) }],
  },
];

// Tavan: duvar mesh'inin (Object_67) ayak izi, duvarların üst kotunda.
export const CEILING = { min: [-5.51, 2.45, -3.58], max: [5.51, 2.5, 3.62] };
