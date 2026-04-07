import express from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByUsername } from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import { createToken } from "#utils/jwt";

const router = express.Router();

router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }

    const user = await createUser(username, password);
    const token = createToken({ id: user.id });
    res.status(201).send(token);
  },
);

router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).send("Invalid username or password.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send("Invalid username or password.");
    }

    const token = createToken({ id: user.id });
    res.send(token);
  },
);

router.get("/me", requireUser, async (req, res) => {
  res.send({
    id: req.user.id,
    username: req.user.username,
  });
});

export default router;
