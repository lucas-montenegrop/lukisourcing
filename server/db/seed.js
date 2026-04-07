import bcrypt from "bcrypt";
import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("Database seeded.");

async function seed() {
  await db.query("DELETE FROM stages_of_material");
  await db.query("DELETE FROM fabrics");
  await db.query("DELETE FROM factory_contacts");
  await db.query("DELETE FROM factories");
  await db.query("DELETE FROM users");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const {
    rows: [user],
  } = await db.query(
    `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING *
    `,
    ["demo_user", hashedPassword],
  );

  const {
    rows: [factory],
  } = await db.query(
    `
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
    `,
    [
      user.id,
      "Mozartex",
      "China",
      "88 Textile Road, Guangzhou",
      "https://mozartex.example.com",
      "+86 20 5555 1000",
      "sales@mozartex.example.com",
      "SHIP-10001",
      "Use DHL account for urgent swatches.",
      "Main development mill for outerwear fabrics.",
    ],
  );

  const contactsToCreate = [
    [
      factory.id,
      "Lina Chen",
      "Sales Manager",
      "lina@mozartex.example.com",
      "+86 20 5555 1001",
      true,
      "Primary fabric development contact.",
    ],
    [
      factory.id,
      "David Wu",
      "Merchandiser",
      "david@mozartex.example.com",
      "+86 20 5555 1002",
      false,
      "Handles sampling follow-up.",
    ],
  ];

  for (const contact of contactsToCreate) {
    await db.query(
      `
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
      `,
      contact,
    );
  }

  const fabricsToCreate = [
    [
      factory.id,
      "Core Collection",
      "25F012-F6",
      null,
      "Chalk Wax Melange",
      "Face-side chalk-mark wax coating on cross dye melange tencel",
      "Tencel/Cotton/Poly 35/50/15",
      "57.5",
      "146",
      408.8,
      280,
      8.26,
      "FOC0000928",
      "ST257862",
      "GREEN",
      "soft/hard & non-chalk wax type customizable",
      true,
      "Wax coating",
      "2025-08-15",
      "Can be reviewed for lower-impact coating alternatives.",
      "First sample received.",
      "active",
    ],
    [
      factory.id,
      null,
      "PF10002065",
      null,
      "Stretch Cotton Nylon Twill",
      "166G/M2 Stretch Cotton Nylon Twill",
      "66% Cotton 29% Nylon 5% Spandex",
      "54",
      null,
      null,
      166,
      4.9,
      null,
      null,
      null,
      null,
      false,
      null,
      "2025-08-16",
      null,
      "Fabric cutting for qly ref",
      "active",
    ],
  ];

  for (const fabric of fabricsToCreate) {
    await db.query(
      `
        INSERT INTO fabrics (
          factory_id,
          fabric_collection_name,
          material_code,
          item_no,
          fabric_name,
          description,
          composition,
          width_inch,
          width_cm,
          weight_glm,
          weight_gsm,
          weight_oz,
          barcode,
          color_code,
          color_name,
          handfeel,
          has_image,
          finish,
          record_date,
          sustainability_notes,
          remarks,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        )
      `,
      fabric,
    );
  }
}
