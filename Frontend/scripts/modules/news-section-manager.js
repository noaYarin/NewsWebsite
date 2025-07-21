const NewsSectionManager = {
  allArticles: [],
  usedArticleIds: new Set(),
  userInterests: [],

  sectionRequirements: [
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
  ],

  getUserInterests() {
    if (this.userInterests.length === 0) {
      try {
        const currentUser = Utils.getCurrentUser() || {};
        this.userInterests = currentUser.interests && currentUser.interests.length >= 3 ? currentUser.interests : ["business", "technology", "sports"];
      } catch {
        this.userInterests = ["business", "technology", "sports"];
      }
    }
    return this.userInterests;
  },

  initializeSectionRequirements() {
    const interests = this.getUserInterests();

    this.sectionRequirements[1].title = `TOP STORIES IN ${interests[0].toUpperCase()}`;
    this.sectionRequirements[1].sources = [`category:${interests[0]}`];

    this.sectionRequirements[2].sources = [`category:${interests[0]}`, "category:general"];
    this.sectionRequirements[4].sources = [`category:${interests[1]}`, "category:general"];

    this.sectionRequirements[6].title = `TRENDING IN ${interests[2].toUpperCase()}`;
    this.sectionRequirements[6].sources = [`category:${interests[2]}`, "category:general"];
  },

  calculateCategoryCounts() {
    const counts = {};
    this.sectionRequirements.forEach((section) => {
      section.sources.forEach((source) => {
        const [type, value] = source.split(":");
        if (type === "category") {
          counts[value] = (counts[value] || 0) + section.count;
        }
      });
    });
    return counts;
  },

  async collectAllArticles() {
    const apiSources = new Set();
    this.sectionRequirements.forEach((section) => {
      section.sources.forEach((source) => {
        if (source.startsWith("api:")) {
          apiSources.add(source.split(":")[1]);
        }
      });
    });

    const categoryCounts = this.calculateCategoryCounts();

    const apiPromises = Array.from(apiSources).map((query) => NewsAPIManager.fetchFromAPI(null, query));
    const cachePromises = Object.entries(categoryCounts).map(([category, count]) => NewsAPIManager.fetchFromCache(category, count));

    const fetchPromises = [...apiPromises, ...cachePromises];
    const results = await Promise.allSettled(fetchPromises);

    this.allArticles = [];
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        this.allArticles.push(...result.value);
      }
    });

    // Remove duplicate articles based on URL
    const uniqueArticles = new Map();
    this.allArticles.forEach((article) => {
      if (article.url && !uniqueArticles.has(article.url)) {
        uniqueArticles.set(article.url, article);
      }
    });
    this.allArticles = Array.from(uniqueArticles.values());
  },

  fillAllSections() {
    this.usedArticleIds.clear();
    this.sectionRequirements.forEach((section) => {
      this.fillSection(section);
    });
  },

  fillSection(section) {
    const availableArticles = this.getArticlesForSection(section);

    if (availableArticles.length < section.count) {
      const additionalNeeded = section.count - availableArticles.length;
      const fillerArticles = this.allArticles.filter((article) => !this.usedArticleIds.has(article.id)).slice(0, additionalNeeded);
      availableArticles.push(...fillerArticles);
    }

    availableArticles.slice(0, section.count).forEach((article) => {
      this.usedArticleIds.add(article.id);
    });

    this.fillContainer(section.container, availableArticles.slice(0, section.count), section.title);
  },

  getArticlesForSection(section) {
    const articles = [];
    const uniqueUrls = new Set();

    for (const source of section.sources) {
      const [type, value] = source.split(":");
      let sourceArticles = [];

      if (type === "api" && value) {
        sourceArticles = this.allArticles.filter(
          (article) =>
            !this.usedArticleIds.has(article.id) && (article.title.toLowerCase().includes(value.toLowerCase()) || article.description.toLowerCase().includes(value.toLowerCase()))
        );
      } else if (type === "category") {
        sourceArticles = this.allArticles.filter(
          (article) => !this.usedArticleIds.has(article.id) && (article.category.toLowerCase() === value.toLowerCase() || value.toLowerCase() === "general")
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
  },

  fillContainer(containerSelector, articles, title) {
    const container = $(containerSelector);
    if (!container.length) return;

    if (title) {
      this.updateSectionTitle(container, title);
    }

    const articleSlots = container.find("[data-article-index]");
    articleSlots.each((index, element) => {
      const $element = $(element);
      if (index < articles.length) {
        ArticleRenderer.updateArticleElement($element, articles[index]);
        $element.css("visibility", "visible");
      } else {
        const fallbackArticle = this.createFallbackArticle(index);
        ArticleRenderer.updateArticleElement($element, fallbackArticle);
        $element.css("visibility", "visible");
      }
    });
  },

  createFallbackArticle(index) {
    return {
      id: `fallback-${index}-${Date.now()}`,
      title: "Breaking News Update",
      url: "#",
      description: "Stay tuned for the latest developments in this ongoing story.",
      imageUrl: CONSTANTS.DEFAULT_IMAGE,
      author: "Horizon News Team",
      sourceName: "Horizon News",
      publishedAt: new Date().toISOString(),
      category: "general"
    };
  },

  updateSectionTitle(container, title) {
    if (title && title.includes("TOP STORIES IN")) {
      $("#month-title").text(title);
    } else if (title && title.includes("TRENDING IN")) {
      $("#fourth-container .titles h1").text(title);
    } else if (title) {
      const titleElement = container.closest("section, .our-picks").find(".titles h1, .our-picks-titles h1, h1, h2").first();
      if (titleElement.length) {
        titleElement.text(title);
      }
    }
  },

  async loadFromCacheOnly() {
    const categoryCounts = this.calculateCategoryCounts();
    const cachePromises = Object.entries(categoryCounts).map(([category, count]) => NewsAPIManager.fetchFromCache(category, count));

    const results = await Promise.allSettled(cachePromises);
    this.allArticles = [];
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        this.allArticles.push(...result.value);
      }
    });

    if (this.allArticles.length === 0) {
      this.createFallbackContent();
    } else {
      this.fillAllSections();
    }
  },

  createFallbackContent() {
    const totalNeeded = this.sectionRequirements.reduce((sum, section) => sum + section.count, 0);
    this.allArticles = Array.from({ length: totalNeeded }, (_, index) => ({
      id: `fallback-${index}`,
      title: `Breaking News Story ${index + 1}`,
      url: "#",
      description: "This is a developing story. Check back for updates as more information becomes available.",
      imageUrl: CONSTANTS.DEFAULT_IMAGE,
      author: "Horizon News Team",
      sourceName: "Horizon News",
      publishedAt: new Date().toISOString(),
      category: "general"
    }));
    this.fillAllSections();
  }
};
