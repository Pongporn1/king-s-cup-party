// Name validation and bad word filtering

const badWords = [
  // Thai bad words (censored)
  "ควย",
  "หี",
  "เหี้ย",
  "สัส",
  "ไอ้",
  "เชี่ย",
  "มึง",
  "กู",
  "ส้นตีน",
  "ไอ้เหี้ย",
  "ไอสัส",
  "แม่ง",
  "สันดาน",
  // English bad words (censored)
  "fuck",
  "shit",
  "bitch",
  "ass",
  "damn",
  "hell",
  "dick",
  "pussy",
  "cock",
  "cunt",
  "bastard",
  // Inappropriate terms
  "nazi",
  "hitler",
  "xxx",
  "porn",
  "sex",
];

export interface NameValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateName(name: string): NameValidationResult {
  // Remove whitespace
  const trimmedName = name.trim();

  // Check length
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: "nameTooShort",
    };
  }

  if (trimmedName.length > 20) {
    return {
      isValid: false,
      error: "nameTooLong",
    };
  }

  // Check for bad words (case insensitive)
  const lowerName = trimmedName.toLowerCase();
  for (const badWord of badWords) {
    if (lowerName.includes(badWord.toLowerCase())) {
      return {
        isValid: false,
        error: "nameContainsBadWords",
      };
    }
  }

  // Check for only special characters
  const hasAlphanumeric = /[a-zA-Z0-9ก-๙]/.test(trimmedName);
  if (!hasAlphanumeric) {
    return {
      isValid: false,
      error: "invalidName",
    };
  }

  return {
    isValid: true,
  };
}

export function sanitizeName(name: string): string {
  // Remove extra whitespace
  return name.trim().replace(/\s+/g, " ");
}
