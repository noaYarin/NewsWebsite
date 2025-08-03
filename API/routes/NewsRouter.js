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

function cleanArticleTitle(title) {
  if (!title) return "No Title";
  if (title.includes(" - ")) {
    return title.split(" - ")[0].trim();
  }
  return title;
}

async function trainNlp() {
  // Business
  manager.addDocument("en", "market earnings profit stocks company", "Business");
  manager.addDocument("en", "economy finance investment banking trading", "Business");
  manager.addDocument("en", "startup entrepreneur business model revenue", "Business");
  manager.addDocument("en", "cryptocurrency bitcoin blockchain financial", "Business");
  manager.addDocument("en", "oil prices inflation recession economic", "Business");

  // Entertainment
  manager.addDocument("en", "movie film actor actress celebrity", "Entertainment");
  manager.addDocument("en", "music concert album artist singer", "Entertainment");
  manager.addDocument("en", "television show series streaming netflix", "Entertainment");
  manager.addDocument("en", "fashion designer model runway style", "Entertainment");
  manager.addDocument("en", "book author novel bestseller publishing", "Entertainment");

  // General
  manager.addDocument("en", "government world news today people", "General");
  manager.addDocument("en", "politics election president congress parliament", "General");
  manager.addDocument("en", "crime police investigation court trial", "General");
  manager.addDocument("en", "social community public opinion society", "General");
  manager.addDocument("en", "education school university student teacher", "General");

  // Health
  manager.addDocument("en", "doctor hospital medicine vaccine diet", "Health");
  manager.addDocument("en", "mental health depression anxiety therapy", "Health");
  manager.addDocument("en", "fitness exercise workout nutrition wellness", "Health");
  manager.addDocument("en", "disease outbreak pandemic virus symptoms", "Health");
  manager.addDocument("en", "surgery treatment patient medical research", "Health");

  // Science
  manager.addDocument("en", "space galaxy planet research experiment", "Science");
  manager.addDocument("en", "climate change environment global warming", "Science");
  manager.addDocument("en", "genetics DNA biology evolution discovery", "Science");
  manager.addDocument("en", "physics quantum theory relativity particle", "Science");
  manager.addDocument("en", "artificial intelligence machine learning AI", "Science");

  // Sports
  manager.addDocument("en", "game score team champion player", "Sports");
  manager.addDocument("en", "football soccer basketball baseball hockey", "Sports");
  manager.addDocument("en", "olympics competition athlete medal record", "Sports");
  manager.addDocument("en", "coach training season tournament league", "Sports");
  manager.addDocument("en", "injury transfer contract professional sport", "Sports");

  // Technology
  manager.addDocument("en", "computer phone software code data", "Technology");
  manager.addDocument("en", "internet website app mobile application", "Technology");
  manager.addDocument("en", "cybersecurity hack privacy security breach", "Technology");
  manager.addDocument("en", "electric vehicle autonomous self-driving car", "Technology");
  manager.addDocument("en", "virtual reality VR augmented reality AR", "Technology");

  // Travel
  manager.addDocument("en", "flight vacation trip tourism destination", "Travel");
  manager.addDocument("en", "hotel accommodation booking reservation travel", "Travel");
  manager.addDocument("en", "airline airport passenger transport journey", "Travel");
  manager.addDocument("en", "cruise ship voyage adventure expedition", "Travel");
  manager.addDocument("en", "visa passport border immigration travel ban", "Travel");

  // Culture
  manager.addDocument("en", "art museum history tradition food", "Culture");
  manager.addDocument("en", "festival celebration cultural event ceremony", "Culture");
  manager.addDocument("en", "religion faith spiritual church temple", "Culture");
  manager.addDocument("en", "language heritage ancestry indigenous culture", "Culture");
  manager.addDocument("en", "cuisine restaurant chef cooking culinary", "Culture");

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

        return {
          ...article,
          title: cleanArticleTitle(article.title),
          category: finalCategory
        };
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
      title: cleanArticleTitle(article.title),
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
