// Utility helpers for CSV and HTML escaping

export const csvEsc = (v) => {
  const s = String(v ?? '');
  return `"${s.replace(/"/g, '""')}"`;
};

export const htmlEsc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m]));
