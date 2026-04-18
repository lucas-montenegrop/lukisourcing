import bcrypt from "bcrypt";
import db from "#db/client";

export async function createUser(
  first_name,
  last_name,
  company,
  email,
  password,
) {
  // WHY: Normalizing at the database boundary protects functionality even if another route calls createUser later without pre-cleaning the email.
  const normalizedEmail = email.trim().toLowerCase();
  const sql = `
    INSERT INTO users (first_name, last_name, company, email, password)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [
    first_name,
    last_name,
    company,
    normalizedEmail,
    hashedPassword,
  ]);
  return user;
}

export async function getUserByEmail(email) {
  // WHY: Looking up emails in one consistent format improves login reliability and keeps the query logic easier to understand for future maintenance.
  const normalizedEmail = email.trim().toLowerCase();
  const sql = `
    SELECT *
    FROM users
    WHERE email = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [normalizedEmail]);
  return user;
}

export async function getUserById(id) {
  const sql = `
    SELECT *
    FROM users
    WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}
