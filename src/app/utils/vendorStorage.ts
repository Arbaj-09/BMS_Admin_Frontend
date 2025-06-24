export function getVendorsFromStorage() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('vendors');
    if (stored) return JSON.parse(stored);
  }
  return [];
}

export function setVendorsToStorage(vendors: unknown[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vendors', JSON.stringify(vendors));
  }
}
