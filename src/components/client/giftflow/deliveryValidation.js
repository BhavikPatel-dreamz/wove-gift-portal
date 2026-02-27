export const DEFAULT_COUNTRY_CODE = "+27";

export const COUNTRY_CODES = [
  { code: "+1", country: "United States/Canada" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+64", country: "New Zealand" },
  { code: "+65", country: "Singapore" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+86", country: "China" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+31", country: "Netherlands" },
  { code: "+41", country: "Switzerland" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+974", country: "Qatar" },
  { code: "+965", country: "Kuwait" },
  { code: "+968", country: "Oman" },
  { code: "+973", country: "Bahrain" },
  { code: "+60", country: "Malaysia" },
  { code: "+63", country: "Philippines" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+880", country: "Bangladesh" },
  { code: "+92", country: "Pakistan" },
  { code: "+27", country: "South Africa" },
];

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const NAME_REGEX = /^[A-Za-z\u00C0-\u024F]+(?:[ .'-][A-Za-z\u00C0-\u024F]+)*$/;

export const normalizeCountryCode = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `+${digits}` : DEFAULT_COUNTRY_CODE;
};

export const normalizePhoneDigits = (value) =>
  String(value || "").replace(/\D/g, "");

export const normalizePhoneInput = (value, countryCode) => {
  const rawValue = String(value || "").trim();
  const phoneDigits = normalizePhoneDigits(rawValue);
  if (!phoneDigits) return "";

  const codeDigits = normalizeCountryCode(countryCode).replace(/\D/g, "");
  const hasInternationalPrefix =
    rawValue.startsWith("+") || rawValue.startsWith("00");

  if (
    hasInternationalPrefix &&
    codeDigits &&
    phoneDigits.startsWith(codeDigits) &&
    phoneDigits.length - codeDigits.length >= 6
  ) {
    return phoneDigits.slice(codeDigits.length);
  }

  return phoneDigits;
};

export const normalizeNameInput = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trimStart();

export const normalizeEmailInput = (value) =>
  String(value || "").trim().toLowerCase();

export const isValidEmail = (value) => EMAIL_REGEX.test(normalizeEmailInput(value));

export const isValidName = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed.length >= 2 && NAME_REGEX.test(trimmed);
};

export const buildE164Number = (countryCode, phoneNumber) => {
  const codeDigits = normalizeCountryCode(countryCode).replace(/\D/g, "");
  const localDigits = normalizePhoneInput(phoneNumber, countryCode).replace(
    /^0+/,
    ""
  );

  if (!codeDigits || !localDigits) return null;
  return `+${codeDigits}${localDigits}`;
};

export const validatePhoneWithCountryCode = (
  phoneNumber,
  countryCode,
  { required = false, label = "phone number" } = {}
) => {
  const localDigits = normalizePhoneInput(phoneNumber, countryCode).replace(
    /^0+/,
    ""
  );

  if (!localDigits) {
    return required ? `${label} is required` : null;
  }

  if (localDigits.length < 6 || localDigits.length > 14) {
    return `Please enter a valid ${label} (6-14 digits)`;
  }

  const e164Number = buildE164Number(countryCode, localDigits);
  if (!e164Number) {
    return `Please enter a valid ${label}`;
  }

  const totalDigits = e164Number.replace(/\D/g, "").length;
  if (totalDigits < 8 || totalDigits > 15) {
    return `Please enter a valid ${label} for the selected country code`;
  }

  return null;
};
