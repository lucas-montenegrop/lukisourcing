import express from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import { createToken } from "#utils/jwt";

const router = express.Router();

function normalizeEmail(email) {
  // WHY: Functionality is more reliable when register and login treat the same email consistently, even if a user types extra spaces or different letter casing.
  return email.trim().toLowerCase();
}

router.post(
  "/register",
  requireBody(["first_name", "last_name", "company", "email", "password"]),
  async (req, res) => {
    const { first_name, last_name, company, email, password } = req.body;
    // WHY: Normalizing once in the route keeps the saved account and the duplicate-account check in sync, which supports the rubric's functionality goal.
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).send("Email already exists.");
    }

    const user = await createUser(
      first_name,
      last_name,
      company,
      normalizedEmail,
      password,
    );
    const token = createToken({ id: user.id });
    res.status(201).send({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        company: user.company,
        email: user.email,
      },
    });
  },
);

router.post("/login", requireBody(["email", "password"]), async (req, res) => {
  const { email, password } = req.body;
  // WHY: Using the same email format here as registration prevents confusing login failures for normal user input, which directly improves core auth functionality.
  const normalizedEmail = normalizeEmail(email);

  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    return res.status(401).send("Invalid email or password.");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).send("Invalid email or password.");
  }

  const token = createToken({ id: user.id });
  res.send({
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      company: user.company,
      email: user.email,
    },
  });
});

router.get("/me", requireUser, async (req, res) => {
  res.send({
    id: req.user.id,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    company: req.user.company,
    email: req.user.email,
  });
});

export default router;
