import express from "express";
import apiRouter from "#api/index";
import allowFrontendOrigin from "#middleware/allowFrontendOrigin";
import errorHandler from "#middleware/errorHandler";
import getUserFromToken from "#middleware/getUserFromToken";

const app = express();

app.use(allowFrontendOrigin);
app.use(express.json());
app.use(getUserFromToken);
app.get("/", (req, res) => {
  res.send("LukiSourcing API is running.");
});
app.get("/greet", (req, res) => {
  res.status(200).send("Hello from LukiSourcing.");
});
app.use("/api", apiRouter);
app.use(errorHandler);

export default app;
