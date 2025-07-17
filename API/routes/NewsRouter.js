import express from "express";
import axios from "axios";
import { NlpManager } from "node-nlp";

export const router = express.Router();

const baseApiUrl = "https://newsapi.org/v2";
const manager = new NlpManager({ languages: ["en"] });

function formatCategory(categoryName) {
  if (!categoryName) return "General";
  const lower = categoryName.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

async function trainNlp() {
  manager.addDocument("en", "market earnings profit stocks company", "Business");
  manager.addDocument("en", "movie film actor actress celebrity", "Entertainment");
  manager.addDocument("en", "government world news today people", "General");
  manager.addDocument("en", "doctor hospital medicine vaccine diet", "Health");
  manager.addDocument("en", "space galaxy planet research experiment", "Science");
  manager.addDocument("en", "game score team champion player", "Sports");
  manager.addDocument("en", "computer phone software code data", "Technology");
  manager.addDocument("en", "flight vacation trip tourism destination", "Travel");
  manager.addDocument("en", "art museum history tradition food", "Culture");

  await manager.train();
}

trainNlp();

// ---------- API ROUTES ----------
router.get("/", async (req, res) => {
  const { query, page = 1, pageSize = 10 } = req.query;
  if (!query) return res.status(400).json({ error: "Must add a `query` query" });

  try {
    const requestUrl = formatRequest(`/everything?q=${query}&page=${page}&pageSize=${pageSize}`);
    const { data } = await axios.get(requestUrl);

    const filteredArticles = data.articles.filter((article) => !article.source.name.includes("Al Jazeera"));

    const categorizedArticles = await Promise.all(
      filteredArticles.map(async (article) => {
        const textToClassify = article.description || article.title || "";
        if (!textToClassify) {
          return { ...article, category: "General" };
        }
        const result = await manager.process("en", textToClassify);

        const rawCategory = result.intent && result.intent !== "None" ? result.intent : "General";

        const finalCategory = formatCategory(rawCategory);

        return { ...article, category: finalCategory };
      })
    );

    res.json({ message: "Ok", data: categorizedArticles });
  } catch (err) {
    res.status(err?.status || 500).json({ error: err?.response?.data?.message || "Internal server error" });
  }
});

router.get("/top-headlines", async (req, res) => {
  const { category, page = 1, pageSize = 10 } = req.query;
  if (!category) return res.status(400).json({ error: "Must add a `category` query" });

  try {
    const requestUrl = formatRequest(`/top-headlines?category=${category}&page=${page}&pageSize=${pageSize}`);
    const { data } = await axios.get(requestUrl);

    let articles = data.articles.filter((article) => !article.source.name.includes("Al Jazeera"));

    const finalCategory = formatCategory(category);

    articles = articles.map((article) => ({
      ...article,
      category: finalCategory
    }));

    res.json({ message: "Ok", data: articles });
  } catch (err) {
    res.status(err?.status || 500).json({ error: err?.response?.data?.message || "Internal server error" });
  }
});

function formatRequest(query) {
  return `${baseApiUrl}${query}&apiKey=${process.env.NEWSAPI_TOKEN}`;
}
