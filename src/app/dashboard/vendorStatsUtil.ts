
export function getVendorStats(vendors: any[]) {
  const total = vendors.length;
  const active = vendors.filter(v => v.status === 'Active').length;
  const inactive = vendors.filter(v => v.status === 'Inactive').length;
  return { total, active, inactive };
}
