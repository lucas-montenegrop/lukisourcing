import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "test"

function getJwtSecret() {
  // WHY: Auth tokens should come from an intentional secret, because a hidden fallback can make login appear to work locally while weakening real authentication behavior.
  if (
    !JWT_SECRET ||
    process.env.JWT_SECRET === "replace_this_with_a_real_secret"
  ) {
    throw new Error(
      "JWT_SECRET must be set to a real secret before using authentication routes.",
    );
  }

  return JWT_SECRET;
}

export function createToken(payload) {
  // WHY: Reading the checked secret here keeps token creation tied to the documented environment setup, improving both functionality and documentation clarity.
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  // WHY: Verifying with the same guarded secret avoids confusing token mismatches and keeps the auth flow consistent.
  return jwt.verify(token, getJwtSecret());
}
