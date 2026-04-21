import db from "#db/client";

function normalizeOptionalValue(value) {
  return value === "" ? null : value;
}

function normalizeFiberRows(fibers = []) {
  return fibers
    .map((fiber) => ({
      percentage: normalizeOptionalValue(fiber.percentage),
      fiber_name: fiber.fiber_name?.trim() ?? "",
    }))
    .filter((fiber) => fiber.fiber_name);
}

async function replaceMaterialFactories(materialId, factoryId, supplierQualityName) {
  await db.query(
    `
      DELETE FROM material_factories
      WHERE material_id = $1
    `,
    [materialId],
  );

  if (!factoryId) {
    return;
  }

  await db.query(
    `
      INSERT INTO material_factories (
        material_id,
        factory_id,
        supplier_quality_name
      )
      VALUES ($1, $2, $3)
    `,
    [materialId, factoryId, supplierQualityName],
  );
}

async function replaceMaterialFibers(materialId, fibers) {
  await db.query(
    `
      DELETE FROM material_fibers
      WHERE material_id = $1
    `,
    [materialId],
  );

  const normalizedFibers = normalizeFiberRows(fibers);

  for (const fiber of normalizedFibers) {
    await db.query(
      `
        INSERT INTO material_fibers (material_id, percentage, fiber_name)
        VALUES ($1, $2, $3)
      `,
      [materialId, fiber.percentage, fiber.fiber_name],
    );
  }
}

export async function createMaterial(userId, materialData) {
  const {
    rows: [material],
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
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      RETURNING *
    `,
    [
      userId,
      materialData.name,
      normalizeOptionalValue(materialData.season),
      normalizeOptionalValue(materialData.year),
      normalizeOptionalValue(materialData.category_collection),
      normalizeOptionalValue(materialData.weight_value),
      normalizeOptionalValue(materialData.weight_unit),
      normalizeOptionalValue(materialData.width_value),
      normalizeOptionalValue(materialData.width_unit),
      normalizeOptionalValue(materialData.cutable_width_value),
      normalizeOptionalValue(materialData.cutable_width_unit),
      normalizeOptionalValue(materialData.construction),
      normalizeOptionalValue(materialData.price_value),
      normalizeOptionalValue(materialData.price_unit),
      normalizeOptionalValue(materialData.agent_name),
      normalizeOptionalValue(materialData.agent_email),
      normalizeOptionalValue(materialData.agent_phone),
      normalizeOptionalValue(materialData.option_number),
      normalizeOptionalValue(materialData.status) ?? "pulled",
    ],
  );

  await replaceMaterialFactories(
    material.id,
    normalizeOptionalValue(materialData.factory_id),
    materialData.supplier_quality_name,
  );
  await replaceMaterialFibers(material.id, materialData.fibers);
  return getMaterialById(material.id, userId);
}

export async function getMaterialsByUserId(userId) {
  const { rows } = await db.query(
    `
      SELECT
        materials.*,
        COALESCE(
          string_agg(DISTINCT factories.factory_name, ', ')
            FILTER (WHERE factories.factory_name IS NOT NULL),
          ''
        ) AS factory_names,
        MIN(factories.id) AS primary_factory_id,
        MAX(material_factories.supplier_quality_name) AS supplier_quality_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', material_fibers.id,
              'percentage', material_fibers.percentage,
              'fiber_name', material_fibers.fiber_name
            )
          ) FILTER (WHERE material_fibers.id IS NOT NULL),
          '[]'::json
        ) AS fibers
      FROM materials
      LEFT JOIN material_factories
        ON material_factories.material_id = materials.id
      LEFT JOIN factories
        ON factories.id = material_factories.factory_id
      LEFT JOIN material_fibers
        ON material_fibers.material_id = materials.id
      WHERE materials.created_by = $1
      GROUP BY materials.id
      ORDER BY materials.id DESC
    `,
    [userId],
  );

  return rows;
}

export async function getMaterialById(id, userId) {
  const {
    rows: [material],
  } = await db.query(
    `
      SELECT
        materials.*,
        COALESCE(
          string_agg(DISTINCT factories.factory_name, ', ')
            FILTER (WHERE factories.factory_name IS NOT NULL),
          ''
        ) AS factory_names,
        MIN(factories.id) AS primary_factory_id,
        MAX(material_factories.supplier_quality_name) AS supplier_quality_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', material_fibers.id,
              'percentage', material_fibers.percentage,
              'fiber_name', material_fibers.fiber_name
            )
          ) FILTER (WHERE material_fibers.id IS NOT NULL),
          '[]'::json
        ) AS fibers
      FROM materials
      LEFT JOIN material_factories
        ON material_factories.material_id = materials.id
      LEFT JOIN factories
        ON factories.id = material_factories.factory_id
      LEFT JOIN material_fibers
        ON material_fibers.material_id = materials.id
      WHERE materials.id = $1
        AND materials.created_by = $2
      GROUP BY materials.id
    `,
    [id, userId],
  );

  return material;
}

export async function updateMaterial(id, userId, materialData) {
  const {
    rows: [material],
  } = await db.query(
    `
      UPDATE materials
      SET
        name = $3,
        season = $4,
        year = $5,
        category_collection = $6,
        weight_value = $7,
        weight_unit = $8,
        width_value = $9,
        width_unit = $10,
        cutable_width_value = $11,
        cutable_width_unit = $12,
        construction = $13,
        price_value = $14,
        price_unit = $15,
        agent_name = $16,
        agent_email = $17,
        agent_phone = $18,
        status = $19,
        option_number = $20
      WHERE id = $1
        AND created_by = $2
      RETURNING *
    `,
    [
      id,
      userId,
      materialData.name,
      normalizeOptionalValue(materialData.season),
      normalizeOptionalValue(materialData.year),
      normalizeOptionalValue(materialData.category_collection),
      normalizeOptionalValue(materialData.weight_value),
      normalizeOptionalValue(materialData.weight_unit),
      normalizeOptionalValue(materialData.width_value),
      normalizeOptionalValue(materialData.width_unit),
      normalizeOptionalValue(materialData.cutable_width_value),
      normalizeOptionalValue(materialData.cutable_width_unit),
      normalizeOptionalValue(materialData.construction),
      normalizeOptionalValue(materialData.price_value),
      normalizeOptionalValue(materialData.price_unit),
      normalizeOptionalValue(materialData.agent_name),
      normalizeOptionalValue(materialData.agent_email),
      normalizeOptionalValue(materialData.agent_phone),
      normalizeOptionalValue(materialData.status),
      normalizeOptionalValue(materialData.option_number),
    ],
  );

  if (!material) {
    return null;
  }

  await replaceMaterialFactories(
    material.id,
    normalizeOptionalValue(materialData.factory_id),
    materialData.supplier_quality_name,
  );
  await replaceMaterialFibers(material.id, materialData.fibers);
  return getMaterialById(material.id, userId);
}
