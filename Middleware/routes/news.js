import express from "express";
import axios from "axios";

export const router = express.Router();

const baseApiUrl = "https://newsapi.org/v2";

router.get("/", async (req, res) => {
  const query = req.query["query"];
  if (!query) return res.status(400).json({ error: "Must add a `query` query" });

  try {
    const requestUrl = formatRequest(`/everything?q=${query}`);
    const { data } = await axios.get(requestUrl);

    const filteredArticles = data.articles.filter((article) => !article.source.name.includes("Al Jazeera"));

    res.json({ message: "Ok", data: filteredArticles });
  } catch (err) {
    res.status(err?.status || 500).json({ error: err?.response?.data?.message || "Internal server error" });
  }
});

router.get("/top-headlines", async (req, res) => {
  const category = req.query["category"];
  if (!category) return res.status(400).json({ error: "Must add a `category` query" });

  try {
    const requestUrl = formatRequest(`/top-headlines?category=${category}`);
    const { data } = await axios.get(requestUrl);

    const filteredArticles = data.articles.filter((article) => !article.source.name.includes("Al Jazeera"));

    res.json({ message: "Ok", data: filteredArticles });
  } catch (err) {
    res.status(err?.status || 500).json({ error: err?.response?.data?.message || "Internal server error" });
  }
});

function formatRequest(query) {
  return `${baseApiUrl}${query}&apiKey=${process.env.NEWSAPI_TOKEN}`;
}
