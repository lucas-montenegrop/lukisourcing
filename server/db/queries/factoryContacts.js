import db from "#db/client";

export async function createFactoryContact(contactData) {
  const sql = `
    INSERT INTO factory_contacts (
      factory_id,
      full_name,
      job_title,
      email,
      phone,
      is_primary_contact,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    contactData.factory_id,
    contactData.full_name,
    contactData.job_title ?? null,
    contactData.email ?? null,
    contactData.phone ?? null,
    contactData.is_primary_contact ?? false,
    contactData.notes ?? null,
  ];

  const {
    rows: [contact],
  } = await db.query(sql, values);
  return contact;
}

export async function getContactsByFactoryId(factoryId) {
  const sql = `
    SELECT *
    FROM factory_contacts
    WHERE factory_id = $1
    ORDER BY id
  `;
  const { rows: contacts } = await db.query(sql, [factoryId]);
  return contacts;
}
