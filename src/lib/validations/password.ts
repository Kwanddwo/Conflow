import { z } from "zod";

export const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$/,
    "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
  );

export const PASSWORD_REQUIREMENTS_TEXT = 
  "Password must be at least 8 characters, and include uppercase, lowercase, numbers, and special characters.";