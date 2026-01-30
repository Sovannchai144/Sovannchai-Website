// Plain JS to add interactivity:
// - Hero carousel (autoplay, controls, keyboard)
// - Clickable laptop visuals swap screen images
// - Search filter (debounced)
// - Add to cart with cart counter saved in localStorage

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- CART ---------- */
  const cartCountEl = document.getElementById('cartCount');
  const CART_KEY = 'demo_cart_count';
  let cartCount = parseInt(localStorage.getItem(CART_KEY) || '0', 10);
  cartCountEl.textContent = cartCount;

  function setCartCount(n) {
    cartCount = n;
    cartCountEl.textContent = cartCount;
    localStorage.setItem(CART_KEY, String(cartCount));
  }

  // handle add-to-cart buttons
  document.querySelectorAll('.card-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setCartCount(cartCount + 1);
      // small animation feedback
      btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 220 });
    });
  });

  /* ---------- SEARCH FILTER (debounced) ---------- */
  const searchInput = document.getElementById('search');
  const productGrid = document.getElementById('productGrid');
  const cards = Array.from(productGrid.querySelectorAll('.card'));

  function filterProducts(query) {
    const q = query.trim().toLowerCase();
    cards.forEach(card => {
      const title = card.getAttribute('data-title') || '';
      if (!q || title.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  let searchTimer = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const val = e.target.value;
    searchTimer = setTimeout(() => filterProducts(val), 180);
  });

  /* ---------- HERO CAROUSEL ---------- */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const dotsContainer = document.getElementById('dots');
  const carouselEl = document.getElementById('heroCarousel');

  let current = 0;
  let autoPlayTimer = null;
  const AUTO_INTERVAL = 4500;

  // create dots
  slides.forEach((s, i) => {
    const d = document.createElement('button');
    d.className = 'dot-ind' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to slide ${i+1}`);
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  });
  const dots = Array.from(dotsContainer.children);

  function showSlide(idx) {
    slides.forEach((s, i) => {
      const hidden = i !== idx;
      s.hidden = hidden;
      s.setAttribute('aria-hidden', String(hidden));
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    showSlide(current);
    restartAuto();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // keyboard navigation
  carouselEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  function startAuto() {
    stopAuto();
    autoPlayTimer = setInterval(() => goTo(current + 1), AUTO_INTERVAL);
  }
  function stopAuto() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }
  function restartAuto() {
    stopAuto();
    startAuto();
  }

  carouselEl.addEventListener('mouseenter', stopAuto);
  carouselEl.addEventListener('mouseleave', startAuto);

  showSlide(current);
  startAuto();

  /* ---------- CLICKABLE LAPTOP VISUALS: swap screen images ---------- */
  // clicking a laptop will cycle its image among slide images (simulating change of screen content)
  function cycleImage(imgEl, urls) {
    const currentSrc = imgEl.getAttribute('src');
    const idx = urls.indexOf(currentSrc);
    const next = urls[(idx + 1) % urls.length];
    imgEl.setAttribute('src', next);
  }

  // Collect unique screen URLs from data-screen attributes in all slides
  const leftScreens = [];
  const rightScreens = [];
  slides.forEach(slide => {
    const left = slide.querySelector('.laptop-left');
    const right = slide.querySelector('.laptop-right');
    if (left) {
      const url = left.getAttribute('data-screen');
      if (url && !leftScreens.includes(url)) leftScreens.push(url);
    }
    if (right) {
      const url = right.getAttribute('data-screen');
      if (url && !rightScreens.includes(url)) rightScreens.push(url);
    }
  });

  // Click handler: when user clicks a laptop in the visible slide, cycle its image
  slides.forEach(slide => {
    const left = slide.querySelector('.laptop-left img');
    const right = slide.querySelector('.laptop-right img');
    if (left) {
      left.addEventListener('click', (e) => {
        e.preventDefault();
        cycleImage(left, leftScreens);
      });
      left.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') cycleImage(left, leftScreens);
      });
      left.tabIndex = 0;
    }
    if (right) {
      right.addEventListener('click', (e) => {
        e.preventDefault();
        cycleImage(right, rightScreens);
      });
      right.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') cycleImage(right, rightScreens);
      });
      right.tabIndex = 0;
    }
  });

  /* ---------- SMALL UX: shopCollection scroll ---------- */
  document.getElementById('shopCollection').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.products').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- OPTIONAL: show toast for cart actions (simple) ---------- */
  function showToast(msg = 'Added to cart') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed',
      right: '18px',
      bottom: '18px',
      background: '#333',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
      zIndex: 9999,
      opacity: '0',
      transform: 'translateY(8px)',
      transition: 'opacity .22s, transform .22s',
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(8px)';
      setTimeout(() => t.remove(), 280);
    }, 1100);
  }

  // Add toast when cart changes
  document.querySelectorAll('.card-add').forEach(btn =>
    btn.addEventListener('click', () => showToast('Added to cart'))
  );
});