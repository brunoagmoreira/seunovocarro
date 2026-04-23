const DEFAULT_SUPER_ADMIN_EMAILS = ['brunoagmoreira@gmail.com'];

function normalizeEmails(emails: string[]): string[] {
  return emails
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getSuperAdminEmails(): string[] {
  const fromEnv = (process.env.SUPER_ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(
    new Set(normalizeEmails([...DEFAULT_SUPER_ADMIN_EMAILS, ...fromEnv])),
  );
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getSuperAdminEmails().includes(email.toLowerCase());
}
