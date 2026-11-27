// The track scrolls and snaps natively, including on touchscreens.
const track = document.querySelector('.slides');
const slides = Array.from(track.children);
const picker = document.querySelector('.slide-dots');
const arrows = document.querySelector('.slide-arrows');

function currentIndex() {
  return Math.round(track.scrollLeft / track.clientWidth);
}

function selectSlide(index) {
  track.scrollTo({ left: index * track.clientWidth });
}

const dots = slides.map((slide, index) => {
  const name = slide.querySelector('h2').textContent.trim();
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.title = name;
  dot.setAttribute('aria-label', `${name} (${index + 1}/${slides.length})`);
  dot.setAttribute('aria-controls', slide.id);
  dot.addEventListener('click', () => selectSlide(index));
  picker.append(dot);
  return dot;
});

function syncDots() {
  const current = currentIndex();
  dots.forEach((dot, i) => {
    dot.setAttribute('aria-current', String(i === current));
    slides[i].inert = i !== current;
    if (slides[i].inert) slides[i].querySelector('details[open]')?.removeAttribute('open');
  });
}

picker.addEventListener('keydown', event => {
  const index = dots.indexOf(event.target);
  if (index < 0 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + dots.length) % dots.length;
  dots[next].focus();
  selectSlide(next);
});

if (slides.length > 1) {
  arrows.hidden = false;
  for (const button of arrows.children) {
    button.addEventListener('click', () => {
      selectSlide((currentIndex() + Number(button.dataset.step) + slides.length) % slides.length);
    });
  }
}

track.addEventListener('scroll', syncDots, { passive: true });
window.addEventListener('resize', syncDots);
syncDots();
