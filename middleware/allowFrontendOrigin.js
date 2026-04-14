function parseAllowedOrigins() {
  const configuredOrigins = process.env.FRONTEND_URL
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins?.length) {
    return configuredOrigins;
  }

  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ];
}

export default function allowFrontendOrigin(req, res, next) {
  const allowedOrigins = parseAllowedOrigins();
  const requestOrigin = req.get("origin");

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
}
