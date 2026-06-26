const API = {
  // Auth
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    FORGOT_LOGIN_ID: '/api/auth/forgot-login-id',
  },

  // Tenant
  TENANT: {
    PROFILE: '/api/tenant/profile',
  },

  // Users
  USERS: {
    ALL: '/api/users',
    BY_ID: (id) => `/api/users/${id}`,
    DEACTIVATE: (id) => `/api/users/${id}/deactivate`,
    ACTIVATE: (id) => `/api/users/${id}/activate`,
  },

  // Customers
  CUSTOMERS: {
    ALL: '/api/customers',
    SEARCH: (query) => `/api/customers?search=${query}`,
    BY_ID: (id) => `/api/customers/${id}`,
  },

  // Products
  PRODUCTS: {
    ALL: '/api/products',
    SEARCH: (query) => `/api/products?search=${query}`,
    LOW_STOCK: '/api/products/low-stock',
    BY_ID: (id) => `/api/products/${id}`,
  },

  // Purchases (Stock Inward)
  PURCHASES: {
    ALL: '/api/purchases',
  },

  // Invoices
  INVOICES: {
    ALL: '/api/invoices',
    BY_ID: (id) => `/api/invoices/${id}`,
    MARK_PAID: (id) => `/api/invoices/${id}/mark-paid`,
    CANCEL: (id) => `/api/invoices/${id}/cancel`,
  },

  // Branding
  BRANDING: {
    GET: '/api/branding',
    SAVE: '/api/branding',
  },

  // Dashboard
  DASHBOARD: {
    PROFIT_LOSS: (from, to) => `/api/dashboard/profit-loss?from=${from}&to=${to}`,
  },

  // GST Reports
  GST: {
    GSTR1: (year, month) => `/api/reports/gst/gstr1?year=${year}&month=${month}`,
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/api/subscriptions/plans',
    CURRENT: '/api/subscriptions/current',
    UPGRADE: '/api/subscriptions/upgrade',
    VERIFY: '/api/subscriptions/upgrade/verify',
    MOCK_UPGRADE: '/api/subscriptions/upgrade/mock',
  },

  // Payments
  PAYMENTS: {
    MY: '/api/payments',
    WEBHOOK: '/api/payments/webhook',
  },

  // Admin (Super Admin only)
  ADMIN: {
    TENANTS: '/api/admin/tenants',
    TENANT_BY_ID: (id) => `/api/admin/tenants/${id}`,
    SUSPEND: (id) => `/api/admin/tenants/${id}/suspend`,
    ACTIVATE: (id) => `/api/admin/tenants/${id}/activate`,
    REVENUE: '/api/admin/revenue',
    PAYMENTS: '/api/admin/payments',
    NEEDS_ATTENTION: '/api/admin/payments/needs-attention',
    REFUND: (id) => `/api/admin/payments/${id}/refund`,
  },
};

export default API;