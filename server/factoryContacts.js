import express from "express";
import {
  createFactoryContact,
  getContactsByFactoryId,
} from "#db/queries/factoryContacts";
import { getFactoryById } from "#db/queries/factories";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

const router = express.Router();

router.post(
  "/",
  requireUser,
  requireBody(["factory_id", "full_name"]),
  async (req, res) => {
    const factory = await getFactoryById(req.body.factory_id);
    if (!factory) {
      return res.status(404).send("Factory not found.");
    }

    if (factory.user_id !== req.user.id) {
      return res.status(403).send("Forbidden");
    }

    const contact = await createFactoryContact(req.body);
    res.status(201).send(contact);
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

  const contacts = await getContactsByFactoryId(factory.id);
  res.send(contacts);
});

export default router;
