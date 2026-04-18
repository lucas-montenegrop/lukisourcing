import bcrypt from "bcrypt";
import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("Database seeded.");

async function seed() {
  await db.query("DELETE FROM activity_log");
  await db.query("DELETE FROM notes");
  await db.query("DELETE FROM material_fibers");
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
      "Fall",
      2025,
      "Outerwear / Collection A",
      280,
      "gsm",
      57.5,
      "inches",
      56.25,
      "inches",
      "Crosshatch twill weave",
      12.5,
      "USD/yard",
      "Mina Cho",
      "mina@agency.example.com",
      "+82 10 5555 3000",
      "sampling requested",
      1,
    ],
    [
      user.id,
      "Stretch Cotton Nylon Twill",
      "Spring",
      2026,
      "Bottoms / Collection B",
      166,
      "gsm",
      54,
      "inches",
      53,
      "inches",
      "Twill construction",
      9.75,
      "USD/yard",
      null,
      null,
      null,
      "pulled",
      2,
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
          season,
          year,
          category_collection,
          weight_value,
          weight_unit,
          width_value,
          width_unit,
          cutable_width_value,
          cutable_width_unit,
          construction,
          price_value,
          price_unit,
          agent_name,
          agent_email,
          agent_phone,
          status,
          option_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
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
        supplier_quality_name,
        quoted_cost,
        lead_time,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      createdMaterials[0].id,
      createdFactories[0].id,
      "MZT-WAX-2048",
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
        supplier_quality_name,
        quoted_cost,
        lead_time,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      createdMaterials[1].id,
      createdFactories[1].id,
      "BMBX-STN-166",
      9.75,
      "18 days",
      "Requested quote and available yardage.",
    ],
  );

  await db.query(
    `
      INSERT INTO material_fibers (material_id, percentage, fiber_name)
      VALUES
        ($1, $2, $3),
        ($1, $4, $5),
        ($1, $6, $7)
    `,
    [createdMaterials[0].id, 70, "Tencel", 20, "Cotton", 10, "Linen"],
  );

  await db.query(
    `
      INSERT INTO material_fibers (material_id, percentage, fiber_name)
      VALUES
        ($1, $2, $3),
        ($1, $4, $5),
        ($1, $6, $7)
    `,
    [createdMaterials[1].id, 66, "Cotton", 29, "Nylon", 5, "Spandex"],
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
    [createdMaterials[0].id, user.id, "status_update", "pulled", "sampling requested"],
  );
}
