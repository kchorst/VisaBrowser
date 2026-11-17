export const stamp = '2026-11-17T12:00:00+00:00';
const row = (option, fields = {}) => ({ options: [option], ...fields });
const free = row('free', { stay: '30 days' });
export const sample = {
  US: { lastSuccess: stamp, rules: {
    A: free, B: free, C: row('evisa'), D: free, E: row('advance'),
    AW: row('free', { flags: ['Tourist registration'] }), BAN: row('denied'),
    CONFLICT: { reason: 'Source rules conflict', notes: ['Visa required', 'Visa not required'] },
    BOTH: { options: ['arrival', 'evisa'] }
  } },
  RW: { lastSuccess: stamp, rules: {
    A: free, B: row('evisa'),
    C: row('arrival', { condition: 'Enter at Harbor International Airport.' }),
    D: row('advance', { exceptions: [{ issuers: ['US'], types: ['permit'], result: free }] }),
    E: row('advance'), AW: free
  } }
};
export const alex = { id: 'alex', name: 'Alex', passport: 'US', documents: [] };
export const aline = { id: 'aline', name: 'Aline', passport: 'RW', documents: [{ id: 'doc', issuer: 'US' }] };
