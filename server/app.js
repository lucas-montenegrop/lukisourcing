import express from "express";
import apiRouter from "#api/index";
import errorHandler from "#middleware/errorHandler";
import getUserFromToken from "#middleware/getUserFromToken";

const app = express();

app.use(express.json());
app.use(getUserFromToken);
app.get("/", (req, res) => {
  res.send("LukiSourcing API is running.");
});
app.use("/api", apiRouter);
app.use(errorHandler);

export default app;
