import express from "express";
import factoriesRouter from "#api/factories";
import factoryContactsRouter from "#api/factoryContacts";
import fabricsRouter from "#api/fabrics";
import usersRouter from "#api/users";

const router = express.Router();

router.use("/users", usersRouter);
router.use("/factories", factoriesRouter);
router.use("/factory-contacts", factoryContactsRouter);
router.use("/fabrics", fabricsRouter);

export default router;
