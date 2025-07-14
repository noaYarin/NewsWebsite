const DEFAULT_IMAGE = "../sources/images/placeholder.png";

// Simple global variables to track what we've already shown
let displayedArticleUrls = [];
let userInterests = [];

// Get user interests from localStorage
function getUserInterests() {
  if (userInterests.length === 0) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    userInterests = currentUser.interests && currentUser.interests.length >= 3 ? currentUser.interests : ["business", "technology", "sports"];
  }
  return userInterests;
}

// Check if we already showed this article
function isAlreadyDisplayed(articleUrl) {
  return displayedArticleUrls.includes(articleUrl);
}

// Mark article as displayed
function markAsDisplayed(articleUrl) {
  displayedArticleUrls.push(articleUrl);
}

// Simple article filtering - remove duplicates and bad articles
function filterArticles(articles, maxCount) {
  let filtered = [];

  for (let article of articles) {
    // Skip if no url, title, or already shown
    if (!article.url || !article.title || isAlreadyDisplayed(article.url)) {
      continue;
    }

    // Skip if title is too short or too long
    if (article.title.length < 10 || article.title.length > 200) {
      continue;
    }

    filtered.push(article);
    markAsDisplayed(article.url);

    // Stop when we have enough
    if (filtered.length >= maxCount) {
      break;
    }
  }

  return filtered;
}

// Convert API response to our format
function mapArticles(apiArticles, category) {
  return apiArticles
    .filter((a) => a && a.url && a.title)
    .map((a) => ({
      // Handle both API format and synced database format
      id: a.id || a.Id, // Database articles have 'Id', API articles don't
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

// Update a single article element in the HTML
function updateArticleElement(element, article) {
  // Save article data for when user clicks
  element.data("article-object", article);

  // Update image
  const img = element.find("[data-image-target]");
  if (img.length) {
    img.attr("src", article.imageUrl || DEFAULT_IMAGE);
    img.attr("onerror", "this.src='" + DEFAULT_IMAGE + "';");
  }

  // Update text
  element.find("[data-source-target]").text(article.sourceName);
  element.find("[data-title-target]").text(article.title);
  element.find("[data-author-target]").text(article.author);
  element.find("[data-description-target]").text(article.description);

  // Make visible
  element.css("visibility", "visible");
}

// Update section title
function updateSectionTitle(container, title) {
  const titleElement = container.closest("section, .our-picks").find(".titles h1, .our-picks-titles h1, h1, h2").first();
  if (titleElement.length && title) {
    titleElement.text(title);
  }
}

// Fill a container with articles
function fillContainer(containerSelector, articles, title) {
  const container = $(containerSelector);
  if (!container.length) {
    console.log("Container not found:", containerSelector);
    return;
  }

  // Update title if provided
  if (title) {
    updateSectionTitle(container, title);
  }

  // Find all article slots in this container
  const articleSlots = container.find("[data-article-index]");
  console.log(`Filling ${containerSelector}: found ${articleSlots.length} slots, have ${articles.length} articles`);

  // Fill each slot
  articleSlots.each(function (index) {
    if (index < articles.length) {
      updateArticleElement($(this), articles[index]);
    } else {
      $(this).css("visibility", "hidden");
    }
  });
}

// Load a section with articles
function loadSection(config, callback) {
  const { type, value, container, title, maxArticles } = config;

  console.log(`Loading section: ${container} (${type}: ${value})`);

  function handleArticles(articles) {
    const filtered = filterArticles(articles, maxArticles);
    fillContainer(container, filtered, title);
    if (callback) callback();
  }

  function handleError(error) {
    console.error(`Error loading ${container}:`, error);
    if (callback) callback();
  }

  if (type === "category") {
    // Try cached articles first
    getRecentArticles(
      value,
      function (cachedArticles) {
        if (cachedArticles && cachedArticles.length > 0) {
          console.log(`Using ${cachedArticles.length} cached articles for ${value}`);
          // Map cached articles to ensure consistent format
          const mappedCached = mapArticles(cachedArticles, value);
          handleArticles(mappedCached);
        } else {
          console.log(`No cache, fetching from API for ${value}`);
          fetchFromAPI(value, null, handleArticles, handleError);
        }
      },
      function () {
        console.log(`Cache failed, fetching from API for ${value}`);
        fetchFromAPI(value, null, handleArticles, handleError);
      }
    );
  } else {
    // Query-based search
    fetchFromAPI(null, value, handleArticles, handleError);
  }
}

// news.js

function fetchFromAPI(category, query, successCallback, errorCallback) {
  const apiCall = query ? searchNews : getTopHeadlines;
  const searchValue = query || category;

  apiCall(
    searchValue,
    1, // page 1
    function (response) {
      if (response && response.data) {
        const articles = mapArticles(response.data, category);

        // ALWAYS sync articles with the database.
        // This ensures any article displayed (from categories or queries)
        // gets a database ID, which is essential for the comment section.
        console.log(`Syncing ${articles.length} articles to the database.`);
        syncArticles(
          articles,
          function (syncedArticles) {
            console.log(`Sync complete. Got back ${syncedArticles.length} articles with IDs.`);
            successCallback(syncedArticles);
          },
          function (error) {
            console.error("Article sync failed:", error);
            // Fallback: If sync fails, show articles anyway but comments won't work.
            successCallback(articles);
          }
        );
      } else {
        errorCallback(new Error("No data in response"));
      }
    },
    errorCallback
  );
}

// Main function to load all news sections
function loadAllNews() {
  console.log("Starting to load all news sections...");

  // Reset displayed articles
  displayedArticleUrls = [];

  // Get user interests
  const interests = getUserInterests();
  console.log("User interests:", interests);

  // Define all sections to load
  const sections = [
    {
      type: "query",
      value: "breaking news world",
      container: "#container",
      title: "LATEST NEWS",
      maxArticles: 9
    },
    {
      type: "category",
      value: interests[0], // User's first interest
      container: "#secondary-container .col-lg-8",
      title: `TOP STORIES IN ${interests[0].toUpperCase()}`,
      maxArticles: 3
    },
    {
      type: "category",
      value: interests[0], // Same interest for sidebar
      container: "#secondary-container .today-picks-sidebar",
      title: null, // No title change for sidebar
      maxArticles: 6
    },
    {
      type: "query",
      value: "investigative journalism exclusive report",
      container: ".our-picks-cards",
      title: "THE HORIZON SERIES",
      maxArticles: 3
    },
    {
      type: "category",
      value: interests[1], // User's second interest
      container: "#third-container",
      title: "BEYOND THE HEADLINES",
      maxArticles: 4
    },
    {
      type: "query",
      value: "travel destination adventure",
      container: ".discover-articles-section",
      title: null,
      maxArticles: 5
    },
    {
      type: "category",
      value: interests[2], // User's third interest
      container: "#fourth-container",
      title: `TRENDING IN ${interests[2].toUpperCase()}`,
      maxArticles: 6
    }
  ];

  // Load sections one by one with small delays
  let currentIndex = 0;

  function loadNext() {
    if (currentIndex >= sections.length) {
      console.log("All sections loaded!");
      return;
    }

    const section = sections[currentIndex];
    currentIndex++;

    loadSection(section, function () {
      // Wait a bit then load next section
      setTimeout(loadNext, 300);
    });
  }

  // Start loading
  loadNext();
}

// Set up page when DOM is ready
$(document).ready(function () {
  console.log("Page ready, setting up news system...");

  // Handle article clicks
  $(document).on("click", ".website-link", function (e) {
    const articleElement = $(this).closest("[data-article-index]");
    if (articleElement.length && articleElement.data("article-object")) {
      const articleData = articleElement.data("article-object");
      sessionStorage.setItem("currentArticle", JSON.stringify(articleData));
    }
  });

  // Load all the news
  loadAllNews();
});
