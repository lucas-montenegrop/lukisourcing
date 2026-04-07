import express from "express";
import {
  createFabric,
  getFabricById,
  getFabricsByFactoryId,
  updateFabric,
} from "#db/queries/fabrics";
import { getFactoryById } from "#db/queries/factories";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

const router = express.Router();

router.post(
  "/",
  requireUser,
  requireBody(["factory_id", "fabric_name"]),
  async (req, res) => {
    const factory = await getFactoryById(req.body.factory_id);
    if (!factory) {
      return res.status(404).send("Factory not found.");
    }

    if (factory.user_id !== req.user.id) {
      return res.status(403).send("Forbidden");
    }

    const fabric = await createFabric(req.body);
    res.status(201).send(fabric);
  },
);

router.get("/factory/:factoryId", requireUser, async (req, res) => {
  const factory = await getFactoryById(req.params.factoryId);
  if (!factory) {
    return res.status(404).send("Factory not found.");
  }

  if (factory.user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  const fabrics = await getFabricsByFactoryId(factory.id);
  res.send(fabrics);
});

router.get("/:id", requireUser, async (req, res) => {
  const fabric = await getFabricById(req.params.id);
  if (!fabric) {
    return res.status(404).send("Fabric not found.");
  }

  if (fabric.factory_user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  res.send(fabric);
});

router.patch("/:id", requireUser, async (req, res) => {
  const existingFabric = await getFabricById(req.params.id);
  if (!existingFabric) {
    return res.status(404).send("Fabric not found.");
  }

  if (existingFabric.factory_user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  const updatedValues = {
    factory_id: existingFabric.factory_id,
    fabric_collection_name:
      req.body.fabric_collection_name ?? existingFabric.fabric_collection_name,
    material_code: req.body.material_code ?? existingFabric.material_code,
    item_no: req.body.item_no ?? existingFabric.item_no,
    fabric_name: req.body.fabric_name ?? existingFabric.fabric_name,
    description: req.body.description ?? existingFabric.description,
    composition: req.body.composition ?? existingFabric.composition,
    width_inch: req.body.width_inch ?? existingFabric.width_inch,
    width_cm: req.body.width_cm ?? existingFabric.width_cm,
    weight_glm: req.body.weight_glm ?? existingFabric.weight_glm,
    weight_gsm: req.body.weight_gsm ?? existingFabric.weight_gsm,
    weight_oz: req.body.weight_oz ?? existingFabric.weight_oz,
    barcode: req.body.barcode ?? existingFabric.barcode,
    color_code: req.body.color_code ?? existingFabric.color_code,
    color_name: req.body.color_name ?? existingFabric.color_name,
    handfeel: req.body.handfeel ?? existingFabric.handfeel,
    has_image: req.body.has_image ?? existingFabric.has_image,
    finish: req.body.finish ?? existingFabric.finish,
    record_date: req.body.record_date ?? existingFabric.record_date,
    sustainability_notes:
      req.body.sustainability_notes ?? existingFabric.sustainability_notes,
    remarks: req.body.remarks ?? existingFabric.remarks,
    status: req.body.status ?? existingFabric.status,
  };

  const fabric = await updateFabric(existingFabric.id, updatedValues);
  res.send(fabric);
});

export default router;
