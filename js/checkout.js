// Rattler Group — checkout page: order review, address form, tax estimate
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkout-form');
  if (!form) return; // not on the checkout page

  const STORAGE_KEY = 'rattler-cart';
  const ORIGIN_ZIP = '78608'; // ships from Bandera County, TX

  // Approximate USPS zone by leading digit of destination ZIP, relative to the 786xx origin.
  // Real USPS zone charts are keyed by exact ZIP3-to-ZIP3 distance; this is a simplified estimate.
  const ZONE_BY_LEADING_DIGIT = { 0: 8, 1: 8, 2: 7, 3: 6, 4: 6, 5: 6, 6: 5, 7: 3, 8: 4, 9: 8 };
  const NEARBY_ZIP3 = ['750','751','752','753','754','756','757','758','759','760','761','762',
    '763','764','765','766','767','768','769','770','772','773','774','775','776','777','778',
    '779','780','781','782','783','784','785','786','787','788','789'];

  // Approximate USPS Ground Advantage retail rates by zone: base rate covers the first pound.
  const USPS_RATES = {
    1: { base: 8.10, perLb: 0.95 },
    2: { base: 8.75, perLb: 1.05 },
    3: { base: 9.50, perLb: 1.15 },
    4: { base: 10.60, perLb: 1.30 },
    5: { base: 11.75, perLb: 1.45 },
    6: { base: 12.90, perLb: 1.60 },
    7: { base: 14.25, perLb: 1.80 },
    8: { base: 15.75, perLb: 2.05 },
  };

  const getShippingZone = (destZip) => {
    if (!/^\d{5}$/.test(destZip)) return null;
    const zip3 = destZip.slice(0, 3);
    if (zip3 === ORIGIN_ZIP.slice(0, 3)) return 1;
    if (NEARBY_ZIP3.includes(zip3)) return 2;
    return ZONE_BY_LEADING_DIGIT[destZip[0]] || 8;
  };

  const calcUspsShipping = (destZip, totalWeightLb) => {
    if (totalWeightLb <= 0) return { cost: 0, zone: null, label: 'No shipping required' };
    const zone = getShippingZone(destZip);
    if (!zone) return { cost: null, zone: null, label: 'Enter ZIP for rate' };
    const rate = USPS_RATES[zone];
    const extraLb = Math.max(0, Math.ceil(totalWeightLb) - 1);
    const cost = rate.base + extraLb * rate.perLb;
    return { cost, zone, label: `Ground Advantage · Zone ${zone} · ${totalWeightLb.toFixed(1)} lb` };
  };

  // Approximate combined state + average local sales tax rates, for estimate purposes only.
  const STATE_TAX_RATES = {
    AL: 0.0922, AK: 0.0176, AZ: 0.0837, AR: 0.0946, CA: 0.0868, CO: 0.0778,
    CT: 0.0635, DE: 0, FL: 0.0705, GA: 0.0732, HI: 0.0444, ID: 0.0603,
    IL: 0.0886, IN: 0.0723, IA: 0.0694, KS: 0.0865, KY: 0.06, LA: 0.0955,
    ME: 0.055, MD: 0.06, MA: 0.0625, MI: 0.06, MN: 0.0781, MS: 0.0707,
    MO: 0.0838, MT: 0, NE: 0.0694, NV: 0.0823, NH: 0, NJ: 0.0663,
    NM: 0.0765, NY: 0.0852, NC: 0.0698, ND: 0.0696, OH: 0.0723, OK: 0.0895,
    OR: 0, PA: 0.0634, RI: 0.07, SC: 0.0743, SD: 0.0640, TN: 0.0955,
    TX: 0.0820, UT: 0.0719, VT: 0.0622, VA: 0.0575, WA: 0.0921, WV: 0.0655,
    WI: 0.0543, WY: 0.0533, DC: 0.06,
  };
  const STATE_NAMES = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia',
  };

  const stateSelect = document.getElementById('state-select');
  Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b])).forEach(code => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = STATE_NAMES[code];
    stateSelect.appendChild(opt);
  });

  const emptyEl = document.getElementById('checkout-empty');
  const itemsEl = document.getElementById('checkout-items');
  const noticeEl = document.getElementById('checkout-notice');

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
  const money = (n) => `$${n.toFixed(2)}`;

  const renderItems = () => {
    const cart = getCart();

    if (!cart.length) {
      form.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    form.hidden = false;
    emptyEl.hidden = true;

    itemsEl.innerHTML = cart.map(item => `
      <div class="checkout-item" data-id="${item.id}">
        <div class="checkout-item-info">
          <div class="checkout-item-name">${item.name}</div>
          <div class="checkout-item-price">${money(item.price)} each</div>
        </div>
        <div class="cart-item-qty">
          <button type="button" class="qty-decrease" aria-label="Decrease quantity">-</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-increase" aria-label="Increase quantity">+</button>
        </div>
        <div class="checkout-item-total">${money(item.price * item.qty)}</div>
      </div>
    `).join('');
  };

  const changeQty = (id, delta) => {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (delta > 0) window.RattlerBulkModal && window.RattlerBulkModal.checkQty(item.qty);
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(cart);
    renderItems();
    updateSummary();
  };

  itemsEl.addEventListener('click', (e) => {
    const row = e.target.closest('.checkout-item');
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.classList.contains('qty-increase')) changeQty(id, 1);
    if (e.target.classList.contains('qty-decrease')) changeQty(id, -1);
  });

  const subtotalEl = document.getElementById('sum-subtotal');
  const shippingEl = document.getElementById('sum-shipping');
  const shippingDetailEl = document.getElementById('sum-shipping-detail');
  const taxEl = document.getElementById('sum-tax');
  const taxRateEl = document.getElementById('sum-tax-rate');
  const totalEl = document.getElementById('sum-total');
  const zipInput = document.getElementById('zip-input');

  const updateSummary = () => {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalWeight = cart.reduce((sum, item) => sum + (item.weight || 0) * item.qty, 0);
    const shippingInfo = calcUspsShipping(zipInput.value, totalWeight);
    const shipping = shippingInfo.cost || 0;
    const rate = STATE_TAX_RATES[stateSelect.value] || 0;
    const tax = subtotal * rate;
    const total = subtotal + shipping + tax;

    subtotalEl.textContent = money(subtotal);
    shippingEl.textContent = shippingInfo.cost === null ? '—' : money(shipping);
    shippingDetailEl.textContent = ` (${shippingInfo.label})`;
    taxRateEl.textContent = stateSelect.value ? ` (${(rate * 100).toFixed(2)}%)` : '';
    taxEl.textContent = money(tax);
    totalEl.textContent = money(total);
  };

  stateSelect.addEventListener('change', updateSummary);
  zipInput.addEventListener('input', updateSummary);

  window.addEventListener('cart:updated', () => {
    renderItems();
    updateSummary();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    noticeEl.textContent = 'This is a demo checkout — no order was placed and no payment was processed.';
    noticeEl.hidden = false;
    noticeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  renderItems();
  updateSummary();
});
