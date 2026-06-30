'use strict';

// ============================================================
//  CONFIG
// ============================================================
const API_BASE = 'https://backend-b2nr.onrender.com/api';
const PAGE_SIZE = 15;

// ============================================================
//  DOM REFERENCES
// ============================================================
const burgerBtn = document.getElementById('burger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuCloseBtn = document.getElementById('menu-close-btn');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

const sliderList = document.getElementById('slider-list');
const sliderPrev = document.getElementById('slider-prev');
const sliderNext = document.getElementById('slider-next');
const sliderDots = document.querySelectorAll('.slider-dot');

const productsList = document.getElementById('products-list');
const showMoreBtn = document.getElementById('show-more-btn');
const bouquetsLoaderWrap = document.getElementById('bouquets-loader-wrap');
const bouquetsErrorEl = document.getElementById('bouquets-error');
const bouquetsEndMessageEl = document.getElementById('bouquets-end-message');
const bouquetsFilterForm = document.getElementById('bouquets-filter-form');
const footerSubscribeForm = document.getElementById('footer-subscribe-form');

const reviewsPrev = document.getElementById('reviews-prev');
const reviewsNext = document.getElementById('reviews-next');

const productModal = document.getElementById('product-modal');
const orderModal = document.getElementById('order-modal');
const buyNowBtn = document.getElementById('buy-now-btn');
const orderForm = document.getElementById('order-form');

const modalProductImage = document.getElementById('modal-product-image');
const modalProductName = document.getElementById('modal-product-name');
const modalProductPrice = document.getElementById('modal-product-price');
const modalProductDesc = document.getElementById('modal-product-desc');

// ============================================================
//  STATE
// ============================================================
let sliderIndex = 0;
const SLIDER_TOTAL = document.querySelectorAll('.slider-card').length;

let reviewIndex = 0;
const reviewCards = document.querySelectorAll('.review-card');

let currentPage = 1;
let isLoading = false;
let hasMorePages = true;
let bouquetsSearchQuery = '';
let bouquetLightbox = null;

// ============================================================
//  MOBILE MENU
// ============================================================
function openMenu() {
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}

function closeMenu() {
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}

burgerBtn?.addEventListener('click', openMenu);
menuCloseBtn?.addEventListener('click', closeMenu);

// Close menu when nav link is clicked
mobileNavLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (mobileMenu?.classList.contains('is-open')) closeMenu();
    if (productModal?.getAttribute('aria-hidden') === 'false') closeProductModal();
    if (orderModal?.getAttribute('aria-hidden') === 'false') closeOrderModal();
  }
});

// ============================================================
//  SLIDER (Bestsellers)
// ============================================================
function getSlideWidth() {
  const card = sliderList?.querySelector('.slider-card');
  if (!card) return 0;
  const gap = 24;
  return card.offsetWidth + gap;
}

function goToSlide(index) {
  if (!sliderList) return;

  // Clamp index
  sliderIndex = (index + SLIDER_TOTAL) % SLIDER_TOTAL;

  const offset = sliderIndex * getSlideWidth();
  sliderList.style.transform = `translateX(-${offset}px)`;

  // Update dots
  sliderDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === sliderIndex);
  });
}

sliderNext?.addEventListener('click', () => goToSlide(sliderIndex + 1));
sliderPrev?.addEventListener('click', () => goToSlide(sliderIndex - 1));

sliderDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.index, 10);
    goToSlide(idx);
  });
});

// Auto-play slider every 5s
let sliderTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);

sliderList?.closest('.slider-wrapper')?.addEventListener('mouseenter', () => {
  clearInterval(sliderTimer);
});

sliderList?.closest('.slider-wrapper')?.addEventListener('mouseleave', () => {
  sliderTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);
});

// Touch / swipe support for slider
let touchStartX = 0;
let touchEndX = 0;

sliderList?.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

sliderList?.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    goToSlide(diff > 0 ? sliderIndex + 1 : sliderIndex - 1);
  }
});

// ============================================================
//  REVIEWS CAROUSEL
// ============================================================
function updateReviews(direction) {
  // On desktop all 3 are shown; on mobile scroll one at a time
  if (window.innerWidth >= 768) return;

  reviewCards.forEach((card, i) => {
    card.style.display = i === reviewIndex ? 'flex' : 'none';
  });
}

function initReviews() {
  if (window.innerWidth < 768) {
    reviewCards.forEach((card, i) => {
      card.style.display = i === 0 ? 'flex' : 'none';
    });
  } else {
    reviewCards.forEach(card => {
      card.style.display = '';
    });
  }
}

reviewsNext?.addEventListener('click', () => {
  reviewIndex = (reviewIndex + 1) % reviewCards.length;
  updateReviews(1);
});

reviewsPrev?.addEventListener('click', () => {
  reviewIndex = (reviewIndex - 1 + reviewCards.length) % reviewCards.length;
  updateReviews(-1);
});

window.addEventListener('resize', initReviews);
initReviews();

// ============================================================
//  PRODUCT MODAL
// ============================================================
function openProductModal(card) {
  const name = card.dataset.name;
  const price = card.dataset.price;
  const description = card.dataset.description;
  const image = card.dataset.image;

  modalProductImage.src = image;
  modalProductImage.alt = name;
  modalProductName.textContent = name;
  modalProductPrice.textContent = price;
  modalProductDesc.textContent = description;

  productModal.classList.add('is-open');
  productModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');

  // Focus the modal for accessibility
  productModal.querySelector('.modal-close-btn')?.focus();
}

function closeProductModal() {
  productModal.classList.remove('is-open');
  productModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

// Open product modal on card click (image lightbox link uses stopPropagation)
document.addEventListener('click', e => {
  if (e.target.closest('a.card-lightbox')) return;
  const card = e.target.closest('#products-list .product-card');
  if (card) openProductModal(card);
});

// Close on backdrop click
productModal?.addEventListener('click', e => {
  if (e.target === productModal) closeProductModal();
});

// Close btn inside modal
productModal?.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', closeProductModal);
});

// ============================================================
//  ORDER MODAL
// ============================================================
function openOrderModal() {
  closeProductModal();

  orderModal.classList.add('is-open');
  orderModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');

  orderModal.querySelector('.modal-close-btn')?.focus();
}

function closeOrderModal() {
  orderModal.classList.remove('is-open');
  orderModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
}

buyNowBtn?.addEventListener('click', openOrderModal);

orderModal?.addEventListener('click', e => {
  if (e.target === orderModal) closeOrderModal();
});

orderModal?.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', closeOrderModal);
});

// ============================================================
//  ORDER FORM VALIDATION & SUBMIT
// ============================================================
function validateField(input, errorEl, rule) {
  const value = input.value.trim();
  let message = '';

  if (rule.required && !value) {
    message = 'This field is required.';
  } else if (rule.pattern && value && !rule.pattern.test(value)) {
    message = rule.patternMsg || 'Invalid value.';
  }

  if (message) {
    input.classList.add('is-invalid');
    errorEl.textContent = message;
    return false;
  } else {
    input.classList.remove('is-invalid');
    errorEl.textContent = '';
    return true;
  }
}

orderForm?.addEventListener('submit', async e => {
  e.preventDefault();

  const nameInput = orderForm.querySelector('#order-name');
  const phoneInput = orderForm.querySelector('#order-phone');
  const nameError = document.getElementById('name-error');
  const phoneError = document.getElementById('phone-error');

  const nameValid = validateField(nameInput, nameError, { required: true });
  const phoneValid = validateField(phoneInput, phoneError, {
    required: true,
    pattern: /^\+?[\d\s\-().]{7,20}$/,
    patternMsg: 'Enter a valid phone number.',
  });

  if (!nameValid || !phoneValid) return;

  const qtyRaw = document.getElementById('quantity-input')?.value;
  const quantity = Math.min(99, Math.max(1, parseInt(qtyRaw, 10) || 1));

  const payload = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    address: orderForm.querySelector('#order-address').value.trim(),
    message: orderForm.querySelector('#order-message').value.trim(),
    product: modalProductName.textContent,
    quantity,
  };

  const submitBtn = orderForm.querySelector('[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    if (typeof axios === 'undefined') throw new Error('axios is not loaded');

    await axios.post(`${API_BASE}/orders`, payload, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: s => s >= 200 && s < 300,
    });

    closeOrderModal();
    orderForm.reset();
    showToast('Order placed successfully! We will contact you shortly.');
  } catch (err) {
    console.error(err);
    const msg =
      err.response?.data?.errors?.[0]?.msg ||
      err.response?.data?.message ||
      err.message ||
      'Network error. Please try again.';
    showToast(`Could not place order: ${msg}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Go to Checkout';
  }
});

// ============================================================
//  TOAST NOTIFICATION
// ============================================================
function showToast(message, duration = 4000) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1a1a1a;
    color: #fff;
    padding: 14px 28px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    opacity: 0;
    transition: opacity 250ms ease, transform 250ms ease;
    white-space: nowrap;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Animate out
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
//  SCROLL REVEAL (observer must exist before bouquet helpers)
// ============================================================
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

// ============================================================
//  LOAD BOUQUETS (axios, pagination, SimpleLightbox, loader / errors)
// ============================================================
function setBouquetsError(message) {
  if (!bouquetsErrorEl) return;
  if (message) {
    bouquetsErrorEl.textContent = message;
    bouquetsErrorEl.hidden = false;
  } else {
    bouquetsErrorEl.textContent = '';
    bouquetsErrorEl.hidden = true;
  }
}

function setLoaderVisible(visible) {
  if (!bouquetsLoaderWrap) return;
  bouquetsLoaderWrap.classList.toggle('is-loading', visible);
  bouquetsLoaderWrap.setAttribute('aria-busy', visible ? 'true' : 'false');
}

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function observeRevealFor(elements) {
  elements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

function refreshBouquetLightbox() {
  if (typeof SimpleLightbox === 'undefined') return;
  const hasLinks = productsList?.querySelector('a.card-lightbox');
  if (!hasLinks) return;
  if (!bouquetLightbox) {
    bouquetLightbox = new SimpleLightbox('.products-list a.card-lightbox', {
      overlayOpacity: 0.88,
    });
  } else {
    bouquetLightbox.refresh();
  }
}

function createBouquetCard(bouquet) {
  const li = document.createElement('li');
  li.className = 'product-card';
  li.dataset.id = String(bouquet.id);
  li.dataset.name = bouquet.title;
  li.dataset.price = `$${bouquet.price}`;
  li.dataset.description = bouquet.description;
  const imgSrc = bouquet.photoURL || '';
  li.dataset.image = imgSrc;

  const safeName = escapeHtml(bouquet.title);
  const safeDesc = escapeHtml(bouquet.description);
  const safeSrc = escapeHtml(imgSrc);

  li.innerHTML = `
    <div class="card-image-wrap">
      <a href="${safeSrc}" class="card-lightbox" aria-label="Enlarge image: ${safeName}">
        <img
          src="${safeSrc}"
          alt="${safeName}"
          width="295"
          height="295"
          class="card-image"
          loading="lazy"
        />
      </a>
    </div>
    <h3 class="card-name">${safeName}</h3>
    <p class="card-desc">${safeDesc}</p>
    <span class="card-price">$${bouquet.price}</span>
  `;

  return li;
}

async function fetchBouquets(page = 1) {
  if (isLoading) return;
  if (page > 1 && !hasMorePages) return;

  isLoading = true;
  setBouquetsError('');
  setLoaderVisible(true);
  if (bouquetsEndMessageEl) bouquetsEndMessageEl.hidden = true;

  const previousCount = productsList ? productsList.children.length : 0;

  try {
    if (typeof axios === 'undefined') throw new Error('axios is not loaded');

    const params = { page, limit: PAGE_SIZE };
    if (bouquetsSearchQuery) params.search = bouquetsSearchQuery;

    const { data } = await axios.get(`${API_BASE}/bouquets`, {
      params,
      validateStatus: s => s >= 200 && s < 300,
    });

    const bouquets = data.data || [];
    const total = typeof data.total === 'number' ? data.total : bouquets.length;

    if (page === 1) {
      if (bouquetLightbox) {
        bouquetLightbox.destroy();
        bouquetLightbox = null;
      }
      if (productsList) productsList.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();
    const appended = [];
    bouquets.forEach(b => {
      const li = createBouquetCard(b);
      fragment.appendChild(li);
      appended.push(li);
    });
    productsList?.appendChild(fragment);

    if (appended.length) observeRevealFor(appended);

    currentPage = page;
    hasMorePages = productsList && productsList.children.length < total;

    if (showMoreBtn) {
      showMoreBtn.hidden = !hasMorePages || !productsList?.children.length;
    }

    if (bouquetsEndMessageEl) {
      bouquetsEndMessageEl.hidden =
        hasMorePages || !productsList?.children.length;
    }

    if (page > 1 && productsList && productsList.children.length > previousCount) {
      const firstNew = productsList.children[previousCount];
      if (firstNew) {
        const cardH = firstNew.getBoundingClientRect().height;
        window.scrollBy({
          top: cardH * 2,
          behavior: 'smooth',
        });
      }
    }

    refreshBouquetLightbox();
  } catch (err) {
    console.error(err);
    hasMorePages = false;
    if (showMoreBtn) showMoreBtn.hidden = true;
    if (bouquetsEndMessageEl) bouquetsEndMessageEl.hidden = true;
    const msg =
      err.response?.data?.message ||
      err.message ||
      'Unable to load bouquets. Is the API running?';
    setBouquetsError(msg);
    if (page === 1 && productsList) productsList.innerHTML = '';
  } finally {
    isLoading = false;
    setLoaderVisible(false);
  }
}

showMoreBtn?.addEventListener('click', () => {
  fetchBouquets(currentPage + 1);
});

bouquetsFilterForm?.addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('bouquets-search');
  bouquetsSearchQuery = input ? input.value.trim() : '';
  currentPage = 1;
  hasMorePages = true;
  fetchBouquets(1);
});

footerSubscribeForm?.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('subscribe-email');
  if (!email?.value.trim()) {
    showToast('Введіть email.');
    return;
  }
  showToast('Дякуємо за підписку!');
  footerSubscribeForm.reset();
});

// ============================================================
//  NAV LINK ACTIVE STATE ON SCROLL
// ============================================================
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(section => sectionObserver.observe(section));

// ============================================================
//  SCROLL REVEAL ANIMATION (static sections only; cards observe in JS)
// ============================================================
function initRevealAnimations() {
  const targets = [
    ...document.querySelectorAll('.review-card'),
    ...document.querySelectorAll('.section-title'),
    ...document.querySelectorAll('.about-content'),
    ...document.querySelectorAll('.about-image-wrap'),
    ...document.querySelectorAll('.hero-content'),
    ...document.querySelectorAll('.contacts-content'),
  ];

  targets.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

// ============================================================
//  HEADER: SHADOW ON SCROLL
// ============================================================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header?.classList.add('scrolled');
    if (!header?.querySelector('style[data-scrolled]')) {
      const s = document.createElement('style');
      s.setAttribute('data-scrolled', '');
      s.textContent =
        '.header.scrolled { box-shadow: 0 2px 16px rgba(0,0,0,0.08); }';
      document.head.appendChild(s);
    }
  } else {
    header?.classList.remove('scrolled');
  }
});

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimations();

  // Dynamic bouquets grid (static cards removed — filled via API)
  fetchBouquets(1);
});
