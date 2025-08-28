export interface CooldownData {
  endTime: number;
  multiplier: number;
  count: number;
}

export type EmailType = "verification" | "password-reset";

export const getCooldownData = (
  email: string,
  type: EmailType
): CooldownData | null => {
  if (typeof window === "undefined") return null;
  const key = `email_${type}_cooldown_${email}`;
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setCooldownData = (
  email: string,
  type: EmailType,
  data: CooldownData
): void => {
  if (typeof window === "undefined") return;
  const key = `email_${type}_cooldown_${email}`;
  sessionStorage.setItem(key, JSON.stringify(data));
};

export const clearCooldownData = (
  email: string | null,
  type?: EmailType
): void => {
  if (typeof window === "undefined" || !email) return;

  if (type) {
    // Clear specific type
    const key = `email_${type}_cooldown_${email}`;
    sessionStorage.removeItem(key);
  } else {
    // Clear all cooldown types for this email
    const verificationKey = `email_verification_cooldown_${email}`;
    const passwordResetKey = `email_password-reset_cooldown_${email}`;
    sessionStorage.removeItem(verificationKey);
    sessionStorage.removeItem(passwordResetKey);
  }
};

// Cooldown configuration
export const COOLDOWN_CONFIG = {
  baseTime: 60, // 60 seconds base cooldown
  multipliers: {
    verification: 2, // 2x multiplier for verification emails
    "password-reset": 2, // 2x multiplier for password reset emails
  },
} as const;
