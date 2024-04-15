import express from "express";
import cache from "./cache.mjs";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// add a expense - request body should contain a title, category, amount and an date
app.post("/expense-list/expenses", (req, res) => {
  const { title, date, category, amount } = req.body;
  const uuid = uuidv4();
  if (!(category === "Recurring" || category === "Capital" || category === "Other")) {
    return res.status(400).json({
      error: "category is invalid. Accepted categories: Recurring | Capital | Other",
    });
  }
  if (!title || !date || !category || !amount) {
    return res.status(400).json({ error: "Title, category, amount or date is empty" });
  }
  const value = { uuid, title, date, category, amount };
  cache.set(uuid, value, 86400);
  return res.status(201).json({ uuid, title, date, category, amount });
});

// update category of a expense by uuid
app.put("/expense-list/expenses/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  const { category } = req.body;
  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "missing or invalid UUID" });
  }
  if (!cache.has(uuid)) {
    return res.status(404).json({ error: "UUID does not exist" });
  }
  if (!(category === "Recurring" || category === "Capital" || category === "Other")) {
    return res.status(400).json({
      error: "category is invalid. Accepted categoryes: Recurring | Capital | Other",
    });
  }
  const value = cache.get(uuid);
  value.category = category;
  cache.set(uuid, value);
  return res.json({ uuid, category });
});

// get the list of expenses
app.get("/expense-list/expenses", (_, res) => {
  const keys = cache.keys();
  const allData = {};
  for (const key of keys) {
    allData[key] = cache.get(key);
  }
  return res.json(allData);
});

// get a expense by uuid
app.get("/expense-list/expenses/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "missing or invalid UUID" });
  }
  if (!cache.has(uuid)) {
    return res.status(404).json({ error: "UUID does not exist" });
  }
  const value = cache.get(uuid);
  return res.json(value);
});

// delete a expense by uuid
app.delete("/expense-list/expenses/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  if (!uuid || typeof uuid !== "string") {
    return res.status(400).json({ error: "missing or invalid UUID" });
  }
  if (!cache.has(uuid)) {
    return res.status(404).json({ error: "UUID does not exist" });
  }
  cache.del(uuid);
  return res.json({ uuid });
});

// health check
app.get("/healthz", (_, res) => {
  return res.sendcategory(200);
});

app.use((err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res.status(500);
  res.json({ error: err.message });
});

app.use("*", (_, res) => {
  return res
    .category(404)
    .json({ error: "the requested resource does not exist on this server" });
});

export default app;
