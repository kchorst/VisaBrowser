// Keep the accepted selector values aligned with Travel-Prep’s draft validator.
const isPassportCode = (value) => typeof value === 'string' && /^[A-Z][A-Z0-9-]{1,15}$/.test(value);
const modes = new Set(['air', 'land', 'sea']);
const selectors = new Map([
  ['passportCodes', isPassportCode],
  ['arrivalModes', (value) => modes.has(value)],
]);

export function isValidApplicability(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return entries.length > 0 && entries.every(([key, allowed]) =>
    selectors.has(key) && Array.isArray(allowed) && allowed.length > 0 &&
    new Set(allowed).size === allowed.length && allowed.every(selectors.get(key)));
}

export function matchesApplicability(value, context) {
  if (value === undefined) return true;
  if (!isValidApplicability(value)) return false;
  const { passportCodes, arrivalModes } = value;
  return (!passportCodes || passportCodes.includes(context?.passportCode)) &&
    (!arrivalModes || arrivalModes.includes(context?.arrivalMode));
}
