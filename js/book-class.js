// Rattler Group — class booking form: builds a mailto quote request, no server involved
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const noticeEl = document.getElementById('booking-notice');
  const QUOTE_EMAIL = 'info@rattler.group';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const fullName = data.get('fullName');
    const email = data.get('email');
    const groupName = data.get('groupName') || 'N/A';
    const location = data.get('location');
    const locationDetail = data.get('locationDetail') || 'N/A';
    const attendees = data.get('attendees');
    const classes = data.getAll('classes');
    const classList = classes.length ? classes.join(', ') : 'Not specified';

    const subject = `Class Booking Request — ${groupName !== 'N/A' ? groupName : fullName}`;
    const body = [
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Group / Organization: ${groupName}`,
      `Location: ${location}`,
      `City / Address: ${locationDetail}`,
      `Number Attending: ${attendees}`,
      `Class(es) Requested: ${classList}`,
    ].join('\n');

    const mailtoUrl = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    noticeEl.textContent = 'Opening your email client with this request addressed to Rattler Group — send it to complete your booking request.';
    noticeEl.hidden = false;
    noticeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});
