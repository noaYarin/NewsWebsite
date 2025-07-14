const DEFAULT_IMAGE = "../sources/images/placeholder.png";

let displayedArticleUrls = [];
let userInterests = [];

function getUserInterests() {
  if (userInterests.length === 0) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    userInterests = currentUser.interests && currentUser.interests.length >= 3 ? currentUser.interests : ["business", "technology", "sports"];
  }
  return userInterests;
}

function isAlreadyDisplayed(articleUrl) {
  return displayedArticleUrls.includes(articleUrl);
}

function markAsDisplayed(articleUrl) {
  displayedArticleUrls.push(articleUrl);
}

function filterArticles(articles, maxCount) {
  let filtered = [];

  for (let article of articles) {
    if (!article.url || !article.title || isAlreadyDisplayed(article.url)) {
      continue;
    }

    filtered.push(article);
    markAsDisplayed(article.url);

    if (filtered.length >= maxCount) {
      break;
    }
  }

  return filtered;
}

function mapArticles(apiArticles, category) {
  return apiArticles
    .filter((a) => a && a.url && a.title)
    .map((a) => ({
      id: a.id || a.Id,
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

function updateArticleElement(element, article) {
  element.data("article-object", article);

  let linkElement = element.is("a") ? element : element.find("a");
  if (linkElement.length) {
    linkElement.attr("href", `../html/article.html?id=${article.id}`);
  }

  const img = element.find("[data-image-target]");
  if (img.length) {
    img.attr("src", article.imageUrl || DEFAULT_IMAGE);
    img.attr("onerror", "this.src='" + DEFAULT_IMAGE + "';");
  }

  element.find("[data-source-target]").text(article.sourceName);
  element.find("[data-title-target]").text(article.title);
  element.find("[data-author-target]").text(article.author);
  element.find("[data-description-target]").text(article.description);

  element.css("visibility", "visible");
}

function updateSectionTitle(container, title) {
  const titleElement = container.closest("section, .our-picks").find(".titles h1, .our-picks-titles h1, h1, h2").first();
  if (titleElement.length && title) {
    titleElement.text(title);
  }
}

function fillContainer(containerSelector, articles, title) {
  const container = $(containerSelector);
  if (!container.length) {
    return;
  }

  if (title) {
    updateSectionTitle(container, title);
  }

  const articleSlots = container.find("[data-article-index]");

  articleSlots.each(function (index) {
    if (index < articles.length) {
      updateArticleElement($(this), articles[index]);
    } else {
      $(this).css("visibility", "hidden");
    }
  });
}

function loadSection(config, callback) {
  const { type, value, container, title, maxArticles } = config;

  const handleArticles = (articles) => {
    const filtered = filterArticles(articles, maxArticles);
    fillContainer(container, filtered, title);
    if (callback) callback();
  };

  const handleApiError = (error) => {
    const fallbackCategory = type === "category" ? value : "general";

    getRecentArticles(
      fallbackCategory,
      (cachedArticles) => {
        if (cachedArticles && cachedArticles.length > 0) {
          const mapped = mapArticles(cachedArticles, fallbackCategory);
          handleArticles(mapped);
        } else {
          if (callback) callback();
        }
      },
      (cacheError) => {
        if (callback) callback();
      }
    );
  };

  if (type === "category") {
    // Try database first for categories to avoid unnecessary API calls
    // (***) This used to be 1 hour back but because the API is pure shit I upped it in the SP to 24 hours.
    // Just leave it like this I honestly don't think there is a better solution for this.
    getRecentArticles(
      value,
      (cachedArticles) => {
        if (cachedArticles && cachedArticles.length > 0) {
          handleArticles(mapArticles(cachedArticles, value));
        } else {
          fetchFromAPI(value, null, handleArticles, handleApiError);
        }
      },
      () => {
        fetchFromAPI(value, null, handleArticles, handleApiError);
      }
    );
  } else {
    fetchFromAPI(null, value, handleArticles, handleApiError);
  }
}

function fetchFromAPI(category, query, successCallback, errorCallback) {
  const apiCall = query ? searchNews : getTopHeadlines;
  const searchValue = query || category;

  apiCall(
    searchValue,
    1,
    function (response) {
      if (response && response.data) {
        const articles = mapArticles(response.data, category);
        syncArticles(
          articles,
          function (syncedArticles) {
            successCallback(syncedArticles);
          },
          function (error) {
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

function loadAllNews() {
  displayedArticleUrls = [];

  const interests = getUserInterests();

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
      value: interests[0],
      container: "#secondary-container .col-lg-8",
      title: `TOP STORIES IN ${interests[0].toUpperCase()}`,
      maxArticles: 3
    },
    {
      type: "category",
      value: interests[0],
      container: "#secondary-container .today-picks-sidebar",
      title: null,
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
      value: interests[1],
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
      value: interests[2],
      container: "#fourth-container",
      title: `TRENDING IN ${interests[2].toUpperCase()}`,
      maxArticles: 6
    }
  ];

  let currentIndex = 0;

  function loadNext() {
    if (currentIndex >= sections.length) {
      return;
    }

    const section = sections[currentIndex];
    currentIndex++;

    loadSection(section, function () {
      setTimeout(loadNext, 300);
    });
  }

  loadNext();
}

$(document).ready(function () {
  loadAllNews();
});
