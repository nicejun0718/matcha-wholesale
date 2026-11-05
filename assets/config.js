/*
  Where inquiry and sample forms are delivered.

  endpoint: a form service URL that accepts POST (Formspree, Web3Forms, your own server).
  email:    used only when endpoint is empty. Opens the visitor's email app with the message filled in.

  While both are empty the form validates input but sends nothing, and tells the visitor so.
*/
var ENDPOINT = "https://formspree.io/f/mnppwgry"; // Formspree form: Wholesale Inquiry
window.SITE_CONFIG = {
  // All inquiries go to FJK Wellness.
  en: { endpoint: ENDPOINT, email: "contact@fjkwellness.com" },
  ko: { endpoint: ENDPOINT, email: "contact@fjkwellness.com" },
  ja: { endpoint: ENDPOINT, email: "contact@fjkwellness.com" },
  es: { endpoint: ENDPOINT, email: "contact@fjkwellness.com" }
};
