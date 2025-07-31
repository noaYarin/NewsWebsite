class NewsSectionManager {
  static allArticles = [];
  static usedArticleIds = new Set();
  static userInterests = [];

  static sectionRequirements = [
    {
      id: "latest",
      container: "#container",
      title: "LATEST NEWS",
      count: 9,
      sources: ["api:breaking news world", "api:latest news", "category:general"]
    },
    {
      id: "travel",
      container: ".discover-articles-section",
      title: null,
      count: 5,
      sources: ["api:travel destination", "api:adventure tourism", "category:travel"]
    },
    {
      id: "main_interest",
      container: "#secondary-container",
      title: null,
      count: 9,
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
      id: "trending",
      container: "#fourth-container",
      title: null,
      count: 6,
      sources: []
    }
  ];

  static getUserInterests() {
    if (this.userInterests.length === 0) {
      try {
        const currentUser = Utils.getCurrentUser() || {};
        this.userInterests = currentUser.interests && currentUser.interests.length >= 3 ? currentUser.interests : ["business", "technology", "sports"];
      } catch {
        this.userInterests = ["business", "technology", "sports"];
      }
    }
    return this.userInterests;
  }

  static initializeSectionRequirements() {
    const interests = this.getUserInterests();

    const mainInterestSection = this.sectionRequirements.find((section) => section.id === "main_interest");
    if (mainInterestSection) {
      mainInterestSection.title = `TOP STORIES IN ${interests[0].toUpperCase()}`;
      mainInterestSection.sources = [`category:${interests[0]}`];
    }

    const beyondHeadlinesSection = this.sectionRequirements.find((section) => section.id === "beyond_headlines");
    if (beyondHeadlinesSection) {
      beyondHeadlinesSection.sources = [`category:${interests[1]}`, "category:general"];
    }

    const trendingSection = this.sectionRequirements.find((section) => section.id === "trending");
    if (trendingSection) {
      trendingSection.title = `TRENDING IN ${interests[2].toUpperCase()}`;
      trendingSection.sources = [`category:${interests[2]}`, "category:general"];
    }
  }

  /**
   * Calculates the total number of articles required for each category across all sections.
   * @returns {Object.<string, number>} An object mapping category names to the number of articles needed.
   */
  static calculateCategoryCounts() {
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
  }

  static async collectAllArticles() {
    await this.fetchAndSyncFromAPI();
    await this.loadLatestFromDatabase();
  }

  /**
   * Gathers all unique API queries from the section requirements.
   * (!) This implementation collects queries but doesn't execute a fetch.
   */
  static async fetchAndSyncFromAPI() {
    const apiQueries = new Set();
    this.sectionRequirements.forEach((section) => {
      section.sources.forEach((source) => {
        if (source.startsWith("api:")) {
          apiQueries.add(source.split(":")[1]);
        }
      });
    });
  }

  /**
   * Loads articles from the local cache based on calculated category needs,
   * then remove duplicates and sorts them by date.
   */
  static async loadLatestFromDatabase() {
    const categoryCounts = this.calculateCategoryCounts();
    const cachePromises = Object.entries(categoryCounts).map(([category, count]) => {
      return NewsAPIManager.fetchFromCache(category, count);
    });

    const results = await Promise.allSettled(cachePromises);

    this.allArticles = [];
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        this.allArticles.push(...result.value);
      }
    });

    const uniqueArticles = new Map();
    this.allArticles.forEach((article) => {
      if (article.url && !uniqueArticles.has(article.url)) {
        uniqueArticles.set(article.url, article);
      }
    });
    this.allArticles = Array.from(uniqueArticles.values());

    this.allArticles.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0);
      const dateB = new Date(b.publishedAt || 0);
      return dateB - dateA;
    });
  }

  /**
   * Resets tracking of used articles and populates all defined sections with content.
   */
  static fillAllSections() {
    this.usedArticleIds.clear();
    this.sectionRequirements.forEach((section) => {
      this.fillSection(section);
    });
  }

  /**
   * Fills a single section with articles and marks them as used to prevent duplication.
   * @param {object} section - The configuration object for the section to fill.
   */
  static fillSection(section) {
    const availableArticles = this.getArticlesForSection(section);

    availableArticles.slice(0, section.count).forEach((article) => {
      this.usedArticleIds.add(article.id);
    });

    this.fillContainer(section.container, availableArticles.slice(0, section.count), section.title);
  }

  /**
   * Retrieves a list of articles matching a section's source requirements.
   * It prioritizes specified sources and falls back to general articles if needed.
   * @param {object} section - The section's configuration object.
   * @returns {object[]} An array of article objects for the section.
   */
  static getArticlesForSection(section) {
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

    if (articles.length < section.count) {
      const generalArticles = this.allArticles.filter((article) => !this.usedArticleIds.has(article.id) && !uniqueUrls.has(article.url));
      const needed = section.count - articles.length;
      articles.push(...generalArticles.slice(0, needed));
    }

    return articles;
  }

  /**
   * Renders a list of articles into a specified container.
   * @param {string} containerSelector - The CSS selector for the container element.
   * @param {object[]} articles - The articles to render.
   * @param {string | null} title - The title to display for the section.
   */
  static fillContainer(containerSelector, articles, title) {
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
  }

  /**
   * Creates a placeholder article object for use when real content is unavailable.
   * @param {number} index - The index for creating a unique fallback ID.
   * @returns {object} A fallback article object.
   */
  static createFallbackArticle(index) {
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
  }

  /**
   * Updates the title of a section in the DOM, with special handling for certain sections.
   * @param {jQuery} container - The jQuery object for the section's container.
   * @param {string} title - The new title text.
   */
  static updateSectionTitle(container, title) {
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
  }

  /**
   * Initializes the page using only locally cached articles.
   * If the cache is empty, it populates the UI with fallback content.
   */
  static async loadFromCacheOnly() {
    await this.loadLatestFromDatabase();

    if (this.allArticles.length === 0) {
      this.createFallbackContent();
    } else {
      this.fillAllSections();
    }
  }

  /**
   * Generates a full page of placeholder content when no articles can be loaded.
   * This ensures the UI is never empty.
   */
  static createFallbackContent() {
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
}
