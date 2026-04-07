export default function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.code === "22P02") {
    return res.status(400).send("Invalid input.");
  }

  if (err.code === "23505") {
    return res.status(400).send("Duplicate value.");
  }

  console.error(err);
  res.status(500).send("Internal server error.");
}
