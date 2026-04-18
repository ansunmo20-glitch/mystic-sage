export const BETA_MODE = true;

export const FREE_PLAN_DAYS = 60;

export function isEntryLocked(entryDate: string, isPaidUser: boolean): boolean {
  if (BETA_MODE) return false;
  if (isPaidUser) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - FREE_PLAN_DAYS);
  const entryD = new Date(entryDate + 'T00:00:00');
  return entryD < cutoff;
}
