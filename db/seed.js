import bcrypt from "bcrypt";
import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("Database seeded.");

async function seed() {
  await db.query("DELETE FROM activity_log");
  await db.query("DELETE FROM notes");
  await db.query("DELETE FROM material_factories");
  await db.query("DELETE FROM materials");
  await db.query("DELETE FROM factory_contacts");
  await db.query("DELETE FROM factories");
  await db.query("DELETE FROM users");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const {
    rows: [user],
  } = await db.query(
    `
      INSERT INTO users (first_name, last_name, company, email, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    ["Lucas", "Montenegro", "Luki Sourcing", "lucas@example.com", hashedPassword],
  );

  const factoriesToCreate = [
    [
      user.id,
      "Mozartex",
      "China",
      "88 Textile Road, Guangzhou",
      "https://mozartex.example.com",
      "+86 20 5555 1000",
      "sales@mozartex.example.com",
      "25 days",
      "SHIP-10001",
      "Use DHL account for urgent swatches.",
      "Main development mill for outerwear materials.",
    ],
    [
      user.id,
      "Bombyx",
      "Korea",
      "17 Mill Street, Seoul",
      "https://bombyx.example.com",
      "+82 2 5555 2000",
      "merch@bombyx.example.com",
      "18 days",
      null,
      null,
      "Good option for lightweight stretch materials.",
    ],
  ];

  const createdFactories = [];

  for (const factory of factoriesToCreate) {
    const {
      rows: [createdFactory],
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
          lead_time,
          shipping_account_number,
          shipping_notes,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      factory,
    );

    createdFactories.push(createdFactory);
  }

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
    [
      createdFactories[0].id,
      "Lina Chen",
      "Sales Manager",
      "lina@mozartex.example.com",
      "+86 20 5555 1001",
      true,
      "Primary development contact.",
    ],
  );

  const materialsToCreate = [
    [
      user.id,
      "Chalk Wax Melange",
      "Fabric",
      "Face-side chalk-mark wax coating on cross dye melange tencel.",
      "sampling",
      12.5,
      "2025-08-21",
    ],
    [
      user.id,
      "Stretch Cotton Nylon Twill",
      "Fabric",
      "166G/M2 stretch twill for development review.",
      "requested",
      9.75,
      "2025-08-25",
    ],
  ];

  const createdMaterials = [];

  for (const material of materialsToCreate) {
    const {
      rows: [createdMaterial],
    } = await db.query(
      `
        INSERT INTO materials (
          created_by,
          name,
          category,
          description,
          status,
          cost,
          eta
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      material,
    );

    createdMaterials.push(createdMaterial);
  }

  await db.query(
    `
      INSERT INTO material_factories (
        material_id,
        factory_id,
        quoted_cost,
        lead_time,
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      createdMaterials[0].id,
      createdFactories[0].id,
      12.5,
      "25 days",
      "First sample submitted for review.",
    ],
  );

  await db.query(
    `
      INSERT INTO material_factories (
        material_id,
        factory_id,
        quoted_cost,
        lead_time,
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      createdMaterials[1].id,
      createdFactories[1].id,
      9.75,
      "18 days",
      "Requested quote and available yardage.",
    ],
  );

  await db.query(
    `
      INSERT INTO notes (material_id, user_id, note)
      VALUES ($1, $2, $3)
    `,
    [createdMaterials[0].id, user.id, "Review handfeel and confirm coating option."],
  );

  await db.query(
    `
      INSERT INTO activity_log (material_id, user_id, action_type, old_value, new_value)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [createdMaterials[0].id, user.id, "status_update", "requested", "sampling"],
  );
}
