# Trilocale Milano · 3D Tur

Milano'daki üç odalı bir dairenin 3D modelinde scroll ile ilerleyen etkileşimli web turu (Vite + Three.js).

- **Scroll turu:** Sayfa kaydırıldıkça kamera odadan odaya geçer, her durakta ilgili eşyalar vurgulanır.
- **Serbest keşif:** Sürükleyerek döndür, tekerlekle yakınlaş; eşyaya tıklayınca kamera ona odaklanır.

## Kurulum

```bash
npm install
npm run dev      # modeli üretir ve http://127.0.0.1:5173 adresinde dev sunucusunu açar
npm run build    # production çıktısı: dist/
```

## Model hazırlama

`3d-model/` kaynak dosyaları içerir. `npm run build:model` (dev/build öncesi otomatik çalışır),
`scripts/build-model.mjs` ile `public/models/apartment.glb` dosyasını üretir:

1. Dönüşümleri geometriye uygular, cm → m çevirir ve daireyi orijine merkezler.
2. Malzemeye göre birleştirilmiş mesh'lerden eşyaları ayrı, adlandırılmış node'lara ayırır
   (`scripts/items.config.mjs`).
3. Tavan ve oda başına `KHR_lights_punctual` ışıkları ekler.

Tur durakları ve kart metinleri `src/tour/stops.js` içindedir.

## Debug

- `?debug`: ışık ayarları paneli
- `?debug=labels`: eşya kutuları ve parça adları
- `?debug=grid&step=0.5`: zemin koordinat ızgarası
- `?cam=x,y,z&look=x,y,z`: kamerayı sabit bir poza kilitler

## Lisans / atıf

This work is based on ["Trilocale Via Boncompagni Milano"](https://sketchfab.com/3d-models/trilocale-via-boncompagni-milano-dd261cf6c2e647cab915f015230bb15e)
by [Fabio Siccardi](https://sketchfab.com/FabioSiccardi) licensed under [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/).
