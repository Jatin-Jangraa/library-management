export const config = {
  library: {
    name: process.env.NEXT_PUBLIC_LIBRARY_NAME || "Study Library",
    description: process.env.NEXT_PUBLIC_LIBRARY_DESCRIPTION || "Your dedicated study space for serious students",
    logo: process.env.NEXT_PUBLIC_LIBRARY_LOGO || "",
  },
  hero: {
    heading: process.env.NEXT_PUBLIC_HERO_HEADING || "Your Dedicated Study Space",
    description: process.env.NEXT_PUBLIC_HERO_DESCRIPTION || "A quiet, comfortable, and well-equipped study library for serious students.",
  },
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 98765 43210",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@studylibrary.com",
    address: process.env.NEXT_PUBLIC_ADDRESS || "123 Study Street, City",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210",
  },
  currency: {
    code: process.env.NEXT_PUBLIC_CURRENCY || "INR",
    symbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹",
  },
  locale: process.env.NEXT_PUBLIC_LOCALE || "en-IN",
  timezone: process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Kolkata",
  dateFormat: process.env.NEXT_PUBLIC_DATE_FORMAT || "DD/MM/YYYY",
  prefixes: {
    studentId: process.env.NEXT_PUBLIC_STUDENT_ID_PREFIX || "LIB",
    receipt: process.env.NEXT_PUBLIC_RECEIPT_PREFIX || "RCP",
  },
  session: {
    maxAgeDays: parseInt(process.env.SESSION_MAX_AGE_DAYS || "15", 10),
  },
} as const;
