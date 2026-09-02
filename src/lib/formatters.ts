// Bengali number and currency helpers

export function toBengaliNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '০';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)] || d);
}

export function formatPrice(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return `৳ ${toBengaliNumber(num.toLocaleString('en-US'))}`;
}

export function formatPriceNumeric(amount: number | string | undefined | null): string {
  const num = Number(amount) || 0;
  return `৳ ${num.toLocaleString('en-US')}`;
}

export function formatBengaliDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getStatusBadgeInfo(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'pending':
      return { label: 'পেন্ডিং', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'confirmed':
      return { label: 'কনফার্মড', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'processing':
      return { label: 'প্রসেসিং', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'shipped':
      return { label: 'শিপড', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'delivered':
      return { label: 'ডেলিভার্ড', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    case 'cancelled':
      return { label: 'ক্যানসেলড', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { label: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getPaymentMethodName(method: string): string {
  switch (method) {
    case 'cod':
      return 'ক্যাশ অন ডেলিভারি';
    case 'bkash':
      return 'বিকাশ';
    case 'nagad':
      return 'নগদ';
    default:
      return method;
  }
}
