export const EMAIL_OTP_LENGTH = 8;
export const PHONE_OTP_LENGTH = 6;

export function normaliseOtpToken(value: string, maxLength?: number) {
  const normalised = value.replace(/[\s-]/g, "").replace(/\D/g, "");
  return typeof maxLength === "number"
    ? normalised.slice(0, maxLength)
    : normalised;
}

export function isNumericOtp(value: string, length: number) {
  return new RegExp(`^\\d{${length}}$`).test(value);
}
