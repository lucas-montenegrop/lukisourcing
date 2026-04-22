import db from "#db/client";

function normalizeOptionalValue(value) {
  return value === "" ? null : value;
}

export async function createFactory(userId, factoryData) {
  const sql = `
    INSERT INTO factories (
      user_id,
      factory_name,
      country,
      address,
      main_phone,
      main_email,
      shipping_account_number,
      shipping_notes,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    userId,
    factoryData.factory_name,
    normalizeOptionalValue(factoryData.country),
    normalizeOptionalValue(factoryData.address),
    normalizeOptionalValue(factoryData.main_phone),
    normalizeOptionalValue(factoryData.main_email),
    normalizeOptionalValue(factoryData.shipping_account_number),
    normalizeOptionalValue(factoryData.shipping_notes),
    normalizeOptionalValue(factoryData.notes),
  ];

  const {
    rows: [factory],
  } = await db.query(sql, values);
  return factory;
}

export async function getFactoriesByUserId(userId) {
  const sql = `
    SELECT
      factories.*,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', factory_contacts.id,
            'full_name', factory_contacts.full_name,
            'job_title', factory_contacts.job_title,
            'email', factory_contacts.email,
            'phone', factory_contacts.phone,
            'is_primary_contact', factory_contacts.is_primary_contact,
            'notes', factory_contacts.notes
          )
        ) FILTER (WHERE factory_contacts.id IS NOT NULL),
        '[]'::json
      ) AS contacts
    FROM factories
    LEFT JOIN factory_contacts
      ON factory_contacts.factory_id = factories.id
    WHERE user_id = $1
    GROUP BY factories.id
    ORDER BY factories.id DESC
  `;
  const { rows: factories } = await db.query(sql, [userId]);
  return factories;
}

export async function getFactoryById(id) {
  const sql = `
    SELECT
      factories.*,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', factory_contacts.id,
            'full_name', factory_contacts.full_name,
            'job_title', factory_contacts.job_title,
            'email', factory_contacts.email,
            'phone', factory_contacts.phone,
            'is_primary_contact', factory_contacts.is_primary_contact,
            'notes', factory_contacts.notes
          )
        ) FILTER (WHERE factory_contacts.id IS NOT NULL),
        '[]'::json
      ) AS contacts
    FROM factories
    LEFT JOIN factory_contacts
      ON factory_contacts.factory_id = factories.id
    WHERE factories.id = $1
    GROUP BY factories.id
  `;
  const {
    rows: [factory],
  } = await db.query(sql, [id]);
  return factory;
}

export async function updateFactory(id, userId, factoryData) {
  const sql = `
    UPDATE factories
    SET
      factory_name = $3,
      country = $4,
      address = $5,
      main_phone = $6,
      main_email = $7,
      shipping_account_number = $8,
      shipping_notes = $9,
      notes = $10
    WHERE id = $1
      AND user_id = $2
    RETURNING *
  `;

  const {
    rows: [factory],
  } = await db.query(sql, [
    id,
    userId,
    factoryData.factory_name,
    normalizeOptionalValue(factoryData.country),
    normalizeOptionalValue(factoryData.address),
    normalizeOptionalValue(factoryData.main_phone),
    normalizeOptionalValue(factoryData.main_email),
    normalizeOptionalValue(factoryData.shipping_account_number),
    normalizeOptionalValue(factoryData.shipping_notes),
    normalizeOptionalValue(factoryData.notes),
  ]);

  return factory;
}
