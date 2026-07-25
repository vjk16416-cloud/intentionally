import { expect, test } from "@playwright/test";

import {
  EMAIL_OTP_LENGTH,
  isNumericOtp,
  normaliseOtpToken,
  PHONE_OTP_LENGTH,
} from "@/lib/auth/otp";

test.describe("login OTP validation", () => {
  test("keeps email and phone OTP lengths separate", () => {
    expect(EMAIL_OTP_LENGTH).toBe(8);
    expect(PHONE_OTP_LENGTH).toBe(6);
  });

  test("normalises pasted email codes with spaces or hyphens", () => {
    expect(normaliseOtpToken("1234 5678", EMAIL_OTP_LENGTH)).toBe("12345678");
    expect(normaliseOtpToken("1234-5678", EMAIL_OTP_LENGTH)).toBe("12345678");
    expect(normaliseOtpToken("12 34-56 78", EMAIL_OTP_LENGTH)).toBe("12345678");
    expect(normaliseOtpToken("1234-56789")).toBe("123456789");
  });

  test("rejects email codes that are not exactly 8 digits", () => {
    expect(isNumericOtp("12345678", EMAIL_OTP_LENGTH)).toBe(true);
    expect(isNumericOtp("1234567", EMAIL_OTP_LENGTH)).toBe(false);
    expect(isNumericOtp("123456789", EMAIL_OTP_LENGTH)).toBe(false);
  });

  test("leaves phone OTP length at 6 digits", () => {
    expect(isNumericOtp("123456", PHONE_OTP_LENGTH)).toBe(true);
    expect(isNumericOtp("12345678", PHONE_OTP_LENGTH)).toBe(false);
  });
});
