import express from "express";
import axios from "axios";

/** News router instance */
export const router = express.Router();
/** Base url for news api */
const baseApiUrl = "https://newsapi.org/v2";

/**
 * `everything search using query` endpoint
 * path: /api/news?query=...
 */
router.get("/", async (req, res) => {
  // Must have a query
  const query = req.query["query"];
  if (!query) return res.status(400).json({ error: "Must add a `query` query" });

  try {
    const requestUrl = formatRequest(`/everything?q=${query}`);
    const { data } = await axios.get(requestUrl);
    res.json({ message: "Ok", data: data.articles });
  } catch (err) {
    // Handle error
    res.status(err?.status || 500).json({ error: err?.response?.data?.message || "Internal server error" });
  }
});

/**
 * `top-headlines by category` endpoint
 * path: /api/news/top-headlines?category=...
 */
router.get("/top-headlines", async (req, res) => {
  // Must have a category
  const category = req.query["category"];
  if (!category) return res.status(400).json({ error: "Must add a `category` query" });

  try {
    const requestUrl = formatRequest(`/top-headlines?category=${category}`);
    const { data } = await axios.get(requestUrl);
    res.json({ message: "Ok", data: data.articles });
  } catch (err) {
    // Handle error
    res.status(err?.status || 500).json({ error: err?.response?.data?.message || "Internal server error" });
  }
});

/** Wraps a query with essential data and returns formatted request query */
function formatRequest(query) {
  return `${baseApiUrl}${query}&apiKey=${process.env.NEWSAPI_TOKEN}`;
}
