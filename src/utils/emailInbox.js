/**
 * Returns the webmail inbox URL for a given email address, or null if unknown.
 * Used so "Check your email" opens the correct provider (Gmail, Yahoo, Outlook, etc.).
 */
export function getEmailInboxUrl(email) {
  if (!email || typeof email !== 'string') return null;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return 'https://mail.google.com';
  }
  if (domain.includes('yahoo.')) {
    return 'https://mail.yahoo.com';
  }
  if (
    domain.includes('outlook.') ||
    domain === 'hotmail.com' ||
    domain === 'hotmail.co.uk' ||
    domain.includes('live.') ||
    domain.includes('msn.') ||
    domain === 'outlook.com'
  ) {
    return 'https://outlook.live.com';
  }
  if (domain === 'icloud.com' || domain.includes('me.com')) {
    return 'https://www.icloud.com/mail';
  }
  if (domain === 'aol.com') {
    return 'https://mail.aol.com';
  }
  if (domain.includes('protonmail.') || domain === 'proton.me') {
    return 'https://mail.proton.me';
  }

  return null;
}

/**
 * Opens the user's email inbox in a new tab when possible (Gmail, Yahoo, Outlook, etc.).
 * If the provider is unknown, does nothing (user can check their email manually).
 */
export function openEmailInbox(email) {
  const url = getEmailInboxUrl(email);
  if (url) {
    window.open(url, '_blank');
  }
}
