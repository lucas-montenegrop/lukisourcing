import bcrypt from "bcrypt";
import db from "#db/client";

export async function createUser(username, password) {
  const sql = `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [username, hashedPassword]);
  return user;
}

export async function getUserByUsername(username) {
  const sql = `
    SELECT *
    FROM users
    WHERE username = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username]);
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
