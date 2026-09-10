// Rattler Group — product details expand + cart system
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'rattler-cart';

  // ---------- Details expand ----------
  document.querySelectorAll('.btn-details').forEach(btn => {
    if (btn.tagName !== 'BUTTON') return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const expanded = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', expanded);
      btn.textContent = expanded ? 'Hide Details' : 'Details';
    });
  });

  // ---------- Cart state ----------
  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  };
  const saveCart = (cart) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart:updated'));
  };

  const cartCountEl = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartToggle = document.querySelector('.cart-toggle');
  const cartClose = document.getElementById('cart-close');

  if (!cartCountEl) return; // cart UI not present on this page

  const render = () => {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = count;

    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      cartTotalEl.textContent = '$0';
      return;
    }

    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price} each</div>
          <button type="button" class="cart-item-remove">Remove</button>
        </div>
        <div class="cart-item-qty">
          <button type="button" class="qty-decrease" aria-label="Decrease quantity">-</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-increase" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotalEl.textContent = `$${total}`;
  };

  const addToCart = (id, name, price, weight) => {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
      window.RattlerBulkModal && window.RattlerBulkModal.checkQty(existing.qty);
    } else {
      cart.push({ id, name, price, weight, qty: 1 });
    }
    saveCart(cart);
    render();
  };

  const changeQty = (id, delta) => {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (delta > 0) window.RattlerBulkModal && window.RattlerBulkModal.checkQty(item.qty);
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart(cart);
    render();
  };

  const removeItem = (id) => {
    const cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
    render();
  };

  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const { id, name, price, weight } = card.dataset;
      addToCart(id, name, Number(price), Number(weight) || 0);
      openCart();
    });
  });

  cartItemsEl && cartItemsEl.addEventListener('click', (e) => {
    const cartItem = e.target.closest('.cart-item');
    if (!cartItem) return;
    const id = cartItem.dataset.id;
    if (e.target.classList.contains('qty-increase')) changeQty(id, 1);
    if (e.target.classList.contains('qty-decrease')) changeQty(id, -1);
    if (e.target.classList.contains('cart-item-remove')) removeItem(id);
  });

  const openCart = () => {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartToggle && cartToggle.setAttribute('aria-expanded', 'true');
  };
  const closeCart = () => {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartToggle && cartToggle.setAttribute('aria-expanded', 'false');
  };

  cartToggle && cartToggle.addEventListener('click', () => {
    cartDrawer.classList.contains('is-open') ? closeCart() : openCart();
  });
  cartClose && cartClose.addEventListener('click', closeCart);
  cartOverlay && cartOverlay.addEventListener('click', closeCart);

  window.addEventListener('cart:updated', render);
  render();
});
