import express from "express";
import {
  createFactory,
  getFactoriesByUserId,
  getFactoryById,
} from "#db/queries/factories";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

const router = express.Router();

router.post(
  "/",
  requireUser,
  requireBody(["factory_name"]),
  async (req, res) => {
    const factory = await createFactory(req.user.id, req.body);
    res.status(201).send(factory);
  },
);

router.get("/", requireUser, async (req, res) => {
  const factories = await getFactoriesByUserId(req.user.id);
  res.send(factories);
});

router.get("/:id", requireUser, async (req, res) => {
  const factory = await getFactoryById(req.params.id);
  if (!factory) {
    return res.status(404).send("Factory not found.");
  }

  if (factory.user_id !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  res.send(factory);
});

export default router;
