// Sayfa arayüzü: yükleme ekranı, scroll durak kartları, durak noktaları, mod düğmesi,
// eşya etiketi ve bilgi paneli.
export function createHud(stops, handlers) {
  const $ = (sel) => document.querySelector(sel);
  const loader = $('#loader');
  const loaderBar = $('#loader-bar');
  const tour = $('#tour');
  const dots = $('#dots');
  const modeBtn = $('#mode-toggle');
  const roomChip = $('#room-chip');
  const tooltip = $('#tooltip');
  const panel = $('#item-panel');
  const hint = $('#free-hint');

  // Durak kartları
  const cards = stops.map((stop, i) => {
    const section = document.createElement('section');
    section.className = `stop stop--${stop.align ?? 'left'}`;
    section.innerHTML = `
      <article class="card" data-ui>
        <span class="eyebrow">${String(i + 1).padStart(2, '0')} · ${stop.eyebrow}</span>
        <h2>${stop.title}</h2>
        <p>${stop.text}</p>
        ${stop.items?.length ? `<div class="chips">${stop.items.map((id) => `<button class="chip" data-item="${id}">${handlers.itemLabel(id)}</button>`).join('')}</div>` : ''}
        ${stop.cta ? `<button class="btn btn--primary" data-action="free">${stop.cta}</button>` : ''}
      </article>`;
    tour.appendChild(section);
    return section.querySelector('.card');
  });

  tour.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-item]');
    if (chip) handlers.onItem(chip.dataset.item);
    if (e.target.closest('[data-action="free"]')) handlers.onToggleMode();
  });

  // Yan durak noktaları
  const dotEls = stops.map((stop, i) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.title = stop.eyebrow;
    b.setAttribute('aria-label', stop.eyebrow);
    b.innerHTML = `<span>${stop.eyebrow}</span>`;
    b.addEventListener('click', () => handlers.onStop(i));
    dots.appendChild(b);
    return b;
  });

  modeBtn.addEventListener('click', handlers.onToggleMode);
  panel.querySelector('[data-action="close"]').addEventListener('click', handlers.onClosePanel);

  let activeStop = -1;

  return {
    setProgress(p) {
      loaderBar.style.transform = `scaleX(${p})`;
    },
    ready() {
      loader.classList.add('is-done');
      document.body.classList.add('is-ready');
    },

    // s: kesirli durak indeksi
    updateTour(s) {
      cards.forEach((card, i) => {
        const d = Math.abs(s - i);
        const o = Math.max(0, 1 - d * 2.2);
        card.style.opacity = o.toFixed(3);
        card.style.transform = `translateY(${((s - i) * -40).toFixed(1)}px)`;
        card.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      });
      const nearest = Math.round(s);
      if (nearest !== activeStop) {
        activeStop = nearest;
        dotEls.forEach((d, i) => d.classList.toggle('is-active', i === nearest));
        roomChip.textContent = stops[nearest].eyebrow;
      }
    },

    setMode(mode) {
      document.body.classList.toggle('is-free', mode === 'free');
      modeBtn.textContent = mode === 'free' ? 'Tura dön' : 'Serbest keşif';
      hint.classList.toggle('is-shown', mode === 'free');
      if (mode === 'free') roomChip.textContent = 'Serbest keşif';
      else activeStop = -1;
    },

    showTooltip(label, e) {
      if (!label) {
        tooltip.classList.remove('is-shown');
        return;
      }
      tooltip.textContent = label;
      tooltip.classList.add('is-shown');
      if (e) tooltip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 12}px)`;
    },
    moveTooltip(e) {
      tooltip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 12}px)`;
    },

    showItem(data) {
      panel.querySelector('.panel__room').textContent = data.roomLabel;
      panel.querySelector('.panel__title').textContent = data.label;
      panel.querySelector('.panel__text').textContent = data.description;
      panel.classList.add('is-shown');
    },
    hideItem() {
      panel.classList.remove('is-shown');
    },
  };
}
