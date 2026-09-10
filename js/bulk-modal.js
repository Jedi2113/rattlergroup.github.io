// Rattler Group — bulk order prompt shown when cart quantity crosses the threshold
window.RattlerBulkModal = (() => {
  const overlay = document.getElementById('bulk-modal-overlay');
  const modal = document.getElementById('bulk-modal');
  if (!overlay || !modal) return { checkQty: () => {} };

  const dismissBtn = document.getElementById('bulk-modal-dismiss');
  const BULK_THRESHOLD = 2;

  const open = () => {
    overlay.classList.add('is-open');
    modal.classList.add('is-open');
    modal.hidden = false;
  };
  const close = () => {
    overlay.classList.remove('is-open');
    modal.classList.remove('is-open');
    modal.hidden = true;
  };

  overlay.addEventListener('click', close);
  dismissBtn.addEventListener('click', close);

  return {
    // Prompt only the moment quantity first exceeds the threshold, not on every increment after.
    checkQty(qty) {
      if (qty === BULK_THRESHOLD + 1) open();
    },
  };
})();
