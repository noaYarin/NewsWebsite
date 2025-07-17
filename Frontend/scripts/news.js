const DEFAULT_IMAGE = "../sources/images/placeholder.png";

let allArticles = [];
let usedArticleIds = new Set();
let userInterests = [];

const sectionRequirements = [
  {
    id: "latest",
    container: "#container",
    title: "LATEST NEWS",
    count: 9,
    sources: ["api:breaking news world", "api:latest news", "category:general"]
  },
  {
    id: "main_interest",
    container: "#secondary-container .col-lg-8",
    title: null,
    count: 3,
    sources: []
  },
  {
    id: "sidebar_month",
    container: "#secondary-container .today-picks-sidebar",
    title: null,
    count: 6,
    sources: []
  },
  {
    id: "horizon_series",
    container: ".our-picks-cards",
    title: "THE HORIZON SERIES",
    count: 3,
    sources: ["api:investigative journalism", "api:exclusive report", "category:general"]
  },
  {
    id: "beyond_headlines",
    container: "#third-container",
    title: "BEYOND THE HEADLINES",
    count: 4,
    sources: []
  },
  {
    id: "travel",
    container: ".discover-articles-section",
    title: null,
    count: 5,
    sources: ["api:travel destination", "api:adventure tourism", "category:general"]
  },
  {
    id: "trending",
    container: "#fourth-container",
    title: null,
    count: 6,
    sources: []
  }
];

function getUserInterests() {
  if (userInterests.length === 0) {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
      userInterests = currentUser.interests && currentUser.interests.length >= 3 ? currentUser.interests : ["business", "technology", "sports"];
    } catch {
      userInterests = ["business", "technology", "sports"];
    }
  }
  return userInterests;
}

function initializeSectionRequirements() {
  const interests = getUserInterests();

  sectionRequirements[1].title = `TOP STORIES IN ${interests[0].toUpperCase()}`;
  sectionRequirements[1].sources = [`category:${interests[0]}`];

  sectionRequirements[2].sources = [`category:${interests[0]}`, "category:general"];

  sectionRequirements[4].sources = [`category:${interests[1]}`, "category:general"];

  sectionRequirements[6].title = `TRENDING IN ${interests[2].toUpperCase()}`;
  sectionRequirements[6].sources = [`category:${interests[2]}`, "category:general"];
}

function setupCategoryLinks() {
  const interests = getUserInterests();

  $("#see-more-latest").attr("href", `../html/category.html?name=general`);
  $("#see-articles-travel").attr("href", `../html/category.html?name=travel`);
  $("#view-all-trending").attr("href", `../html/category.html?name=general`);

  if (interests[0]) {
    $("#see-more-interest1").attr("href", `../html/category.html?name=${interests[0]}`);
  }
}

async function loadAllNews() {
  try {
    initializeSectionRequirements();
    await collectAllArticles();
    fillAllSections();
  } catch (error) {
    console.error("Failed to load news, falling back to cache.", error);
    await loadFromCacheOnly();
  }
}

function calculateCategoryCounts() {
  const counts = {};
  sectionRequirements.forEach((section) => {
    section.sources.forEach((source) => {
      const [type, value] = source.split(":");
      if (type === "category") {
        counts[value] = (counts[value] || 0) + section.count;
      }
    });
  });
  return counts;
}

async function collectAllArticles() {
  const apiSources = new Set();
  sectionRequirements.forEach((section) => {
    section.sources.forEach((source) => {
      if (source.startsWith("api:")) {
        apiSources.add(source.split(":")[1]);
      }
    });
  });

  const categoryCounts = calculateCategoryCounts();

  const apiPromises = Array.from(apiSources).map((query) => fetchFromAPI(null, query));
  const cachePromises = Object.entries(categoryCounts).map(([category, count]) => fetchFromCache(category, count));

  const fetchPromises = [...apiPromises, ...cachePromises];
  const results = await Promise.allSettled(fetchPromises);

  allArticles = [];
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      allArticles.push(...result.value);
    }
  });

  // Remove duplicate articles based on URL
  const uniqueArticles = new Map();
  allArticles.forEach((article) => {
    if (article.url && !uniqueArticles.has(article.url)) {
      uniqueArticles.set(article.url, article);
    }
  });
  allArticles = Array.from(uniqueArticles.values());
}

async function fetchFromAPI(category, query) {
  return new Promise((resolve) => {
    const apiCall = query ? searchNews : getTopHeadlines;
    const searchValue = query || category;

    apiCall(
      searchValue,
      1,
      (response) => {
        if (response && response.data) {
          const articles = mapArticles(response.data, category);
          syncArticles(
            articles,
            (syncedArticles) => resolve(syncedArticles),
            () => resolve(articles) // Fallback to unsynced if sync fails
          );
        } else {
          resolve([]);
        }
      },
      () => resolve([])
    );
  });
}

async function fetchFromCache(category, count) {
  return new Promise((resolve) => {
    getRecentArticles(
      category,
      count,
      (articles) => resolve(mapArticles(articles || [], category)),
      () => resolve([])
    );
  });
}

function mapArticles(apiArticles, category) {
  return apiArticles
    .filter((a) => a && a.url && a.title && a.title !== "[Removed]" && (a.urlToImage || a.imageUrl) && a.description)
    .map((a) => ({
      id: a.id || a.Id || `${Date.now()}-${Math.random()}`,
      title: a.title || a.Title,
      url: a.url || a.Url,
      description: a.description || a.Description || "",
      imageUrl: a.urlToImage || a.imageUrl || a.ImageUrl,
      author: a.author || a.Author || "",
      sourceName: (a.source && a.source.name) || a.sourceName || a.SourceName || "Unknown Source",
      publishedAt: a.publishedAt || a.PublishedAt,
      category: a.category || a.Category || category || "general"
    }));
}

function fillAllSections() {
  usedArticleIds.clear();
  sectionRequirements.forEach((section) => {
    fillSection(section);
  });
}

function fillSection(section) {
  const availableArticles = getArticlesForSection(section);

  if (availableArticles.length < section.count) {
    const additionalNeeded = section.count - availableArticles.length;
    const fillerArticles = allArticles.filter((article) => !usedArticleIds.has(article.id)).slice(0, additionalNeeded);
    availableArticles.push(...fillerArticles);
  }

  availableArticles.slice(0, section.count).forEach((article) => {
    usedArticleIds.add(article.id);
  });

  fillContainer(section.container, availableArticles.slice(0, section.count), section.title);
}

function getArticlesForSection(section) {
  const articles = [];
  const uniqueUrls = new Set();

  for (const source of section.sources) {
    const [type, value] = source.split(":");
    let sourceArticles = [];

    if (type === "api" && value) {
      sourceArticles = allArticles.filter(
        (article) =>
          !usedArticleIds.has(article.id) && (article.title.toLowerCase().includes(value.toLowerCase()) || article.description.toLowerCase().includes(value.toLowerCase()))
      );
    } else if (type === "category") {
      sourceArticles = allArticles.filter(
        (article) => !usedArticleIds.has(article.id) && (article.category.toLowerCase() === value.toLowerCase() || value.toLowerCase() === "general")
      );
    }

    sourceArticles.forEach((article) => {
      if (!uniqueUrls.has(article.url)) {
        articles.push(article);
        uniqueUrls.add(article.url);
      }
    });

    if (articles.length >= section.count) break;
  }
  return articles;
}

function fillContainer(containerSelector, articles, title) {
  const container = $(containerSelector);
  if (!container.length) return;

  if (title) {
    updateSectionTitle(container, title);
  }

  const articleSlots = container.find("[data-article-index]");
  articleSlots.each((index, element) => {
    const $element = $(element);
    if (index < articles.length) {
      updateArticleElement($element, articles[index]);
      $element.css("visibility", "visible");
    } else {
      const fallbackArticle = createFallbackArticle(index);
      updateArticleElement($element, fallbackArticle);
      $element.css("visibility", "visible");
    }
  });
}

function createFallbackArticle(index) {
  return {
    id: `fallback-${index}-${Date.now()}`,
    title: "Breaking News Update",
    url: "#",
    description: "Stay tuned for the latest developments in this ongoing story.",
    imageUrl: DEFAULT_IMAGE,
    author: "Horizon News Team",
    sourceName: "Horizon News",
    publishedAt: new Date().toISOString(),
    category: "general"
  };
}

function updateSectionTitle(container, title) {
  const titleElement = container.closest("section, .our-picks").find(".titles h1, .our-picks-titles h1, h1, h2").first();
  if (titleElement.length && title) {
    titleElement.text(title);
  }
}

function updateArticleElement(element, article) {
  element.data("article-object", article);
  const linkElement = element.is("a") ? element : element.find("a");
  if (linkElement.length) {
    linkElement.attr("href", `../html/article.html?id=${article.id}`);
  }
  const img = element.find("[data-image-target]");
  if (img.length) {
    img.attr("src", article.imageUrl || DEFAULT_IMAGE);
    img.attr("onerror", `this.src='${DEFAULT_IMAGE}';`);
  }
  element.find("[data-source-target]").text(article.sourceName);
  element.find("[data-title-target]").text(article.title);
  element.find("[data-author-target]").text(article.author);
  element.find("[data-description-target]").text(article.description);
}

async function loadFromCacheOnly() {
  const categoryCounts = calculateCategoryCounts();
  const cachePromises = Object.entries(categoryCounts).map(([category, count]) => fetchFromCache(category, count));

  const results = await Promise.allSettled(cachePromises);
  allArticles = [];
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      allArticles.push(...result.value);
    }
  });

  if (allArticles.length === 0) {
    createFallbackContent();
  } else {
    fillAllSections();
  }
}

function createFallbackContent() {
  const totalNeeded = sectionRequirements.reduce((sum, section) => sum + section.count, 0);
  allArticles = Array.from({ length: totalNeeded }, (_, index) => ({
    id: `fallback-${index}`,
    title: `Breaking News Story ${index + 1}`,
    url: "#",
    description: "This is a developing story. Check back for updates as more information becomes available.",
    imageUrl: DEFAULT_IMAGE,
    author: "Horizon News Team",
    sourceName: "Horizon News",
    publishedAt: new Date().toISOString(),
    category: "general"
  }));
  fillAllSections();
}

$(document).ready(function () {
  loadAllNews();
  setupCategoryLinks();

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const currentMonth = monthNames[new Date().getMonth()];
  $("#month-title").text(currentMonth);
});
