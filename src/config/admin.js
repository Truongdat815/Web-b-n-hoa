const raw = import.meta.env.VITE_ADMIN_EMAILS || 'admin@gmail.com';

export const ADMIN_EMAILS = raw
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};


