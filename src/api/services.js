// ✅ CORRECT - Default import
import api from './api';  // <-- This must be the default import
import API from './endpoints';

// Test if api is working (remove after testing)
console.log('✅ api loaded:', typeof api.get); // Should print 'function'

// ─── Auth Service ──────────────────────────────────────────────
export const authService = {
  signup: (data) => api.post(API.AUTH.SIGNUP, data),
  login: (data) => api.post(API.AUTH.LOGIN, data),
  forgotPassword: (email) => api.post(API.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (data) => api.post(API.AUTH.RESET_PASSWORD, data),
  forgotLoginId: (data) => api.post(API.AUTH.FORGOT_LOGIN_ID, data),
};

// ─── Tenant Service ──────────────────────────────────────────
export const tenantService = {
  getProfile: () => api.get(API.TENANT.PROFILE),
  updateProfile: (data) => api.put(API.TENANT.PROFILE, data),
};

// ─── Users Service ────────────────────────────────────────────
export const usersService = {
  getAll: () => api.get(API.USERS.ALL),
  getById: (id) => api.get(API.USERS.BY_ID(id)),
  create: (data) => api.post(API.USERS.ALL, data),
  update: (id, data) => api.put(API.USERS.BY_ID(id), data),
  delete: (id) => api.delete(API.USERS.BY_ID(id)),
  deactivate: (id) => api.post(API.USERS.DEACTIVATE(id)),
  activate: (id) => api.post(API.USERS.ACTIVATE(id)),
};

// ─── Customers Service ──────────────────────────────────────
export const customerService = {
  getAll: () => api.get(API.CUSTOMERS.ALL),
  search: (query) => api.get(API.CUSTOMERS.SEARCH(query)),
  getById: (id) => api.get(API.CUSTOMERS.BY_ID(id)),
  create: (data) => api.post(API.CUSTOMERS.ALL, data),
  update: (id, data) => api.put(API.CUSTOMERS.BY_ID(id), data),
  delete: (id) => api.delete(API.CUSTOMERS.BY_ID(id)),
};

// ─── Products Service ──────────────────────────────────────
export const productService = {
  getAll: () => api.get(API.PRODUCTS.ALL),
  search: (query) => api.get(API.PRODUCTS.SEARCH(query)),
  getLowStock: () => api.get(API.PRODUCTS.LOW_STOCK),
  getById: (id) => api.get(API.PRODUCTS.BY_ID(id)),
  create: (data) => api.post(API.PRODUCTS.ALL, data),
  update: (id, data) => api.put(API.PRODUCTS.BY_ID(id), data),
  delete: (id) => api.delete(API.PRODUCTS.BY_ID(id)),
};

// ─── Purchases Service ──────────────────────────────────────
export const purchasesService = {
  getAll: () => api.get(API.PURCHASES.ALL),
  getById: (id) => api.get(`${API.PURCHASES.ALL}/${id}`),
  create: (data) => api.post(API.PURCHASES.ALL, data),
  update: (id, data) => api.put(`${API.PURCHASES.ALL}/${id}`, data),
  delete: (id) => api.delete(`${API.PURCHASES.ALL}/${id}`),
};

// ─── Invoices Service ──────────────────────────────────────
export const invoiceService = {
  getAll: () => api.get(API.INVOICES.ALL),
  getById: (id) => api.get(API.INVOICES.BY_ID(id)),
  create: (data) => api.post(API.INVOICES.ALL, data),
  update: (id, data) => api.put(API.INVOICES.BY_ID(id), data),
  markPaid: (id, data) => api.patch(API.INVOICES.MARK_PAID(id), data),
  cancel: (id) => api.patch(API.INVOICES.CANCEL(id)),

  // ✅ NEW - Send Invoice
  send: (id, data) => api.post(`/api/invoices/${id}/send`, data),

  // ✅ NEW - Download PDF
  downloadPDF: (id) => api.get(`/api/invoices/${id}/download`, { responseType: 'blob' }),

  // ✅ NEW - Generate Share Link
  getShareLink: (id) => api.get(`/api/invoices/${id}/share-link`),
};

// ─── Branding Service ──────────────────────────────────────
export const brandingService = {
  get: () => api.get(API.BRANDING.GET),
  save: (data) => api.post(API.BRANDING.SAVE, data),
};

// ─── Dashboard Service ──────────────────────────────────────
export const dashboardService = {
  getProfitLoss: (from, to) => api.get(API.DASHBOARD.PROFIT_LOSS(from, to)),
};

// ─── GST Service ──────────────────────────────────────────────
export const gstService = {
  getGSTR1: (year, month) => api.get(API.GST.GSTR1(year, month)),
};

// ─── Subscriptions Service ──────────────────────────────────
export const subscriptionsService = {
  getPlans: () => api.get(API.SUBSCRIPTIONS.PLANS),
  getCurrent: () => api.get(API.SUBSCRIPTIONS.CURRENT),
  upgrade: (data) => api.post(API.SUBSCRIPTIONS.UPGRADE, data),
  verify: (data) => api.post(API.SUBSCRIPTIONS.VERIFY, data),
  mockUpgrade: (data) => api.post(API.SUBSCRIPTIONS.MOCK_UPGRADE, data),
};

// ─── Payments Service ──────────────────────────────────────
export const paymentsService = {
  getMyPayments: () => api.get(API.PAYMENTS.MY),
  webhook: (data) => api.post(API.PAYMENTS.WEBHOOK, data),
};

// ─── Admin Service ──────────────────────────────────────────
export const adminService = {
  getTenants: () => api.get(API.ADMIN.TENANTS),
  getTenantById: (id) => api.get(API.ADMIN.TENANT_BY_ID(id)),
  suspendTenant: (id) => api.post(API.ADMIN.SUSPEND(id)),
  activateTenant: (id) => api.post(API.ADMIN.ACTIVATE(id)),
  getRevenue: () => api.get(API.ADMIN.REVENUE),
  getPayments: () => api.get(API.ADMIN.PAYMENTS),
  getNeedsAttention: () => api.get(API.ADMIN.NEEDS_ATTENTION),
  refundPayment: (id, data) => api.post(API.ADMIN.REFUND(id), data),
};

// ─── Setup Service ──────────────────────────────────────────
export const setupService = {
  createSuperAdmin: (data) => api.post('/api/setup/super-admin', data),
};

// ─── Export all services ──────────────────────────────────
export default {
  authService,
  tenantService,
  usersService,
  customerService,
  productService,
  purchasesService,
  invoiceService,
  brandingService,
  dashboardService,
  gstService,
  subscriptionsService,
  paymentsService,
  adminService,
  setupService,
};
// ─── Backup Service (Super Admin only) ──────────────────────
export const backupService = {
  getAll: () => api.get(API.BACKUP.LIST),
  create: (data) => api.post(API.BACKUP.CREATE, data),
  download: (id) => api.get(API.BACKUP.DOWNLOAD(id), { responseType: 'blob' }),
  restore: (id) => api.post(API.BACKUP.RESTORE(id)),
  delete: (id) => api.delete(API.BACKUP.DELETE(id)),
  restoreFromFile: (formData) => api.post(API.BACKUP.RESTORE_FILE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSchedule: () => api.get(API.BACKUP.SCHEDULE),
  saveSchedule: (data) => api.put(API.BACKUP.SCHEDULE, data),
};