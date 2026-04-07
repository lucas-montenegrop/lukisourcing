import db from "#db/client";

export async function createFabric(fabricData) {
  const sql = `
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
    RETURNING *
  `;

  const values = [
    fabricData.factory_id,
    fabricData.fabric_collection_name ?? null,
    fabricData.material_code ?? null,
    fabricData.item_no ?? null,
    fabricData.fabric_name,
    fabricData.description ?? null,
    fabricData.composition ?? null,
    fabricData.width_inch ?? null,
    fabricData.width_cm ?? null,
    fabricData.weight_glm ?? null,
    fabricData.weight_gsm ?? null,
    fabricData.weight_oz ?? null,
    fabricData.barcode ?? null,
    fabricData.color_code ?? null,
    fabricData.color_name ?? null,
    fabricData.handfeel ?? null,
    fabricData.has_image ?? false,
    fabricData.finish ?? null,
    fabricData.record_date ?? null,
    fabricData.sustainability_notes ?? null,
    fabricData.remarks ?? null,
    fabricData.status ?? "active",
  ];

  const {
    rows: [fabric],
  } = await db.query(sql, values);
  return fabric;
}

export async function getFabricsByFactoryId(factoryId) {
  const sql = `
    SELECT *
    FROM fabrics
    WHERE factory_id = $1
    ORDER BY id
  `;
  const { rows: fabrics } = await db.query(sql, [factoryId]);
  return fabrics;
}

export async function getFabricById(id) {
  const sql = `
    SELECT fabrics.*, factories.user_id AS factory_user_id
    FROM fabrics
    JOIN factories ON fabrics.factory_id = factories.id
    WHERE fabrics.id = $1
  `;
  const {
    rows: [fabric],
  } = await db.query(sql, [id]);
  return fabric;
}

export async function updateFabric(id, fabricData) {
  const sql = `
    UPDATE fabrics
    SET factory_id = $2,
        fabric_collection_name = $3,
        material_code = $4,
        item_no = $5,
        fabric_name = $6,
        description = $7,
        composition = $8,
        width_inch = $9,
        width_cm = $10,
        weight_glm = $11,
        weight_gsm = $12,
        weight_oz = $13,
        barcode = $14,
        color_code = $15,
        color_name = $16,
        handfeel = $17,
        has_image = $18,
        finish = $19,
        record_date = $20,
        sustainability_notes = $21,
        remarks = $22,
        status = $23
    WHERE id = $1
    RETURNING *
  `;

  const values = [
    id,
    fabricData.factory_id,
    fabricData.fabric_collection_name,
    fabricData.material_code,
    fabricData.item_no,
    fabricData.fabric_name,
    fabricData.description,
    fabricData.composition,
    fabricData.width_inch,
    fabricData.width_cm,
    fabricData.weight_glm,
    fabricData.weight_gsm,
    fabricData.weight_oz,
    fabricData.barcode,
    fabricData.color_code,
    fabricData.color_name,
    fabricData.handfeel,
    fabricData.has_image,
    fabricData.finish,
    fabricData.record_date,
    fabricData.sustainability_notes,
    fabricData.remarks,
    fabricData.status,
  ];

  const {
    rows: [fabric],
  } = await db.query(sql, values);
  return fabric;
}
