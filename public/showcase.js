// The track scrolls and snaps natively, including on touchscreens.
const track = document.querySelector('.slides');
const slides = Array.from(track.children);
const picker = document.querySelector('.game-picker');
const dotList = picker.querySelector('.slide-dots');
const position = picker.querySelector('[role="status"]');

function currentIndex() {
  return Math.round(track.scrollLeft / track.clientWidth);
}

function selectSlide(index) {
  track.scrollTo({ left: index * track.clientWidth });
}

const dots = slides.map(() => {
  const dot = document.createElement('span');
  dotList.append(dot);
  return dot;
});

let active = -1;
function syncDots() {
  const current = currentIndex();
  if (!slides[current] || current === active) return;
  active = current;
  const name = slides[current].querySelector('h2').textContent.trim();
  position.textContent = `${name} (${current + 1}/${slides.length})`;
  dots.forEach((dot, i) => {
    dot.classList.toggle('current', i === current);
    slides[i].inert = i !== current;
    if (slides[i].inert) slides[i].querySelector('details[open]')?.removeAttribute('open');
  });
}

if (slides.length > 1) {
  picker.hidden = false;
  for (const button of picker.querySelectorAll('[data-step]')) {
    button.addEventListener('click', () => {
      selectSlide((currentIndex() + Number(button.dataset.step) + slides.length) % slides.length);
    });
  }
}

track.addEventListener('scroll', syncDots, { passive: true });
window.addEventListener('resize', syncDots);
syncDots();
