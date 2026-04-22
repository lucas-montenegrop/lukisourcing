import express from "express";
import { getFactoryById } from "#db/queries/factories";
import {
  createMaterial,
  getMaterialById,
  getMaterialsByUserId,
  updateMaterial,
} from "#db/queries/materials";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

const router = express.Router();

async function validateFactoryAccess(factoryId, userId, res) {
  if (!factoryId) {
    return true;
  }

  const factory = await getFactoryById(factoryId);
  if (!factory) {
    res.status(404).send("Factory not found.");
    return false;
  }

  if (factory.user_id !== userId) {
    res.status(403).send("Forbidden");
    return false;
  }

  return true;
}

router.get("/", requireUser, async (req, res) => {
  const materials = await getMaterialsByUserId(req.user.id);
  res.send(materials);
});

router.post(
  "/",
  requireUser,
  requireBody(["name", "factory_id", "supplier_quality_name"]),
  async (req, res) => {
  const canUseFactory = await validateFactoryAccess(
    req.body.factory_id,
    req.user.id,
    res,
  );

  if (!canUseFactory) {
    return;
  }

  const material = await createMaterial(req.user.id, req.body);
  res.status(201).send(material);
  },
);

router.get("/:id", requireUser, async (req, res) => {
  const material = await getMaterialById(req.params.id, req.user.id);
  if (!material) {
    return res.status(404).send("Material not found.");
  }

  res.send(material);
});

router.patch("/:id", requireUser, async (req, res) => {
  const existingMaterial = await getMaterialById(req.params.id, req.user.id);
  if (!existingMaterial) {
    return res.status(404).send("Material not found.");
  }

  const nextFactoryId =
    req.body.factory_id === undefined
      ? existingMaterial.primary_factory_id
      : req.body.factory_id;

  const canUseFactory = await validateFactoryAccess(nextFactoryId, req.user.id, res);
  if (!canUseFactory) {
    return;
  }

  const materialUpdates = {
    name: req.body.name ?? existingMaterial.name,
    season: req.body.season ?? existingMaterial.season,
    year: req.body.year ?? existingMaterial.year,
    category_collection:
      req.body.category_collection ?? existingMaterial.category_collection,
    weight_value: req.body.weight_value ?? existingMaterial.weight_value,
    weight_unit: req.body.weight_unit ?? existingMaterial.weight_unit,
    width_value: req.body.width_value ?? existingMaterial.width_value,
    width_unit: req.body.width_unit ?? existingMaterial.width_unit,
    cutable_width_value:
      req.body.cutable_width_value ?? existingMaterial.cutable_width_value,
    cutable_width_unit:
      req.body.cutable_width_unit ?? existingMaterial.cutable_width_unit,
    construction: req.body.construction ?? existingMaterial.construction,
    price_value: req.body.price_value ?? existingMaterial.price_value,
    price_unit: req.body.price_unit ?? existingMaterial.price_unit,
    agent_name: req.body.agent_name ?? existingMaterial.agent_name,
    agent_email: req.body.agent_email ?? existingMaterial.agent_email,
    agent_phone: req.body.agent_phone ?? existingMaterial.agent_phone,
    status: req.body.status ?? existingMaterial.status,
    option_number: req.body.option_number ?? existingMaterial.option_number,
  };

  if ("factory_id" in req.body || "supplier_quality_name" in req.body) {
    materialUpdates.factory_id = nextFactoryId;
    materialUpdates.supplier_quality_name =
      req.body.supplier_quality_name ?? existingMaterial.supplier_quality_name;
  }

  if ("fibers" in req.body) {
    materialUpdates.fibers = req.body.fibers;
  }

  const updatedMaterial = await updateMaterial(req.params.id, req.user.id, materialUpdates);

  res.send(updatedMaterial);
});

export default router;
