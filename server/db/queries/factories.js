import db from "#db/client";

export async function createFactory(userId, factoryData) {
  const sql = `
    INSERT INTO factories (
      user_id,
      factory_name,
      country,
      address,
      website,
      main_phone,
      main_email,
      shipping_account_number,
      shipping_notes,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    userId,
    factoryData.factory_name,
    factoryData.country ?? null,
    factoryData.address ?? null,
    factoryData.website ?? null,
    factoryData.main_phone ?? null,
    factoryData.main_email ?? null,
    factoryData.shipping_account_number ?? null,
    factoryData.shipping_notes ?? null,
    factoryData.notes ?? null,
  ];

  const {
    rows: [factory],
  } = await db.query(sql, values);
  return factory;
}

export async function getFactoriesByUserId(userId) {
  const sql = `
    SELECT *
    FROM factories
    WHERE user_id = $1
    ORDER BY id
  `;
  const { rows: factories } = await db.query(sql, [userId]);
  return factories;
}

export async function getFactoryById(id) {
  const sql = `
    SELECT *
    FROM factories
    WHERE id = $1
  `;
  const {
    rows: [factory],
  } = await db.query(sql, [id]);
  return factory;
}
