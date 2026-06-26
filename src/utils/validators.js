// ─── Email Validation ─────────────────────────────────────────
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// ─── Phone Validation ─────────────────────────────────────────
export const isValidPhone = (phone) => {
  const regex = /^[0-9]{10}$/;
  return regex.test(phone);
};

// ─── GST Validation ───────────────────────────────────────────
export const isValidGST = (gst) => {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gst);
};

// ─── Password Validation ──────────────────────────────────────
export const isValidPassword = (password) => {
  return password.length >= 6;
};

// ─── PAN Validation ───────────────────────────────────────────
export const isValidPAN = (pan) => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan);
};

// ─── Pincode Validation ───────────────────────────────────────
export const isValidPincode = (pincode) => {
  const regex = /^[0-9]{6}$/;
  return regex.test(pincode);
};