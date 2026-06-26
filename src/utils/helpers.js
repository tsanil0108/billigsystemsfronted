export const formatINR = (amount) => {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

// ─── Date ─────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateLong = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const todayISO = () => new Date().toISOString().split('T')[0];

export const toISOFormat = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

// ─── Status Colors ────────────────────────────────────────────
export const getStatusColor = (status) => {
  const map = {
    PAID: 'success', paid: 'success', 
    ACTIVE: 'success', active: 'success',
    FINAL: 'success',
    UNPAID: 'warning', unpaid: 'warning',
    PENDING: 'warning', pending: 'warning',
    TRIAL: 'info',
    OVERDUE: 'danger', overdue: 'danger',
    CANCELLED: 'danger', cancelled: 'danger',
    SUSPENDED: 'danger',
    DRAFT: 'gray', draft: 'gray',
    PARTIAL: 'warning',
    EXPIRED: 'danger',
    SUCCESS: 'success',
    FAILED: 'danger',
  };
  return map[status] || 'gray';
};

// ─── Error Handling ───────────────────────────────────────────
export const getErrorMsg = (err) => {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
};

// ─── Truncate ──────────────────────────────────────────────────
export const truncate = (str, len = 30) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

// ─── Generate ID ──────────────────────────────────────────────
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}