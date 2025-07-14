const DEFAULT_IMAGE = "../sources/images/placeholder.png";
const userInterests = JSON.parse(localStorage.getItem("currentUser") || "{}").interests || ["business", "science", "entertainment"];

const interestSections = {
  "#secondary-container": userInterests[0],
  ".our-picks-cards": userInterests[1],
  "#third-container": userInterests[2],
  "#fourth-container": "general"
};

$(document).ready(function () {
  $(document).on("click", ".website-link", function (e) {
    const articleElement = $(this).closest("[data-article-index]");
    if (articleElement.length && articleElement.data("article-object")) {
      const articleData = articleElement.data("article-object");
      sessionStorage.setItem("currentArticle", JSON.stringify(articleData));
    }
  });

  updateMonthTitle();
  loadAllNewsSections();
});

function loadAllNewsSections() {
  fetchAndDisplayNews({ query: "world", containerSelector: "#container" });

  for (const [selector, category] of Object.entries(interestSections)) {
    fetchAndDisplayNews({ category, containerSelector: selector });
  }
}

function fetchAndDisplayNews({ category, query, containerSelector }) {
  const container = $(containerSelector);
  if (!container.length) return;

  const renderArticles = (articles) => {
    const articleElements = container.find("[data-article-index]");
    articleElements.each(function (index) {
      if (index < articles.length) {
        updateArticleElement($(this), articles[index]);
      }
    });
  };

  const fetchFromApiAndSync = (cat) => {
    getTopHeadlines(
      cat,
      1,
      (response) => {
        const articlesFromApi = mapArticles(response.data, cat);
        syncArticles(articlesFromApi, (syncedArticles) => {
          renderArticles(syncedArticles);
        });
      },
      (err) => {
        let errorMessage = "Error fetching news for " + containerSelector + ":" + err;
        showPopup(errorMessage, false);
      }
    );
  };

  if (query) {
    searchNews(
      query,
      1,
      (response) => {
        const articlesFromApi = mapArticles(response.data);
        syncArticles(articlesFromApi, (syncedArticles) => {
          renderArticles(syncedArticles);
        });
      },
      (err) => {
        let errorMessage = "Error fetching news for " + containerSelector + ":" + err;
        showPopup(errorMessage, false);
      }
    );
  } else if (category) {
    getRecentArticles(
      category,
      (cachedArticles) => {
        if (cachedArticles && cachedArticles.length > 0) {
          renderArticles(cachedArticles);
        } else {
          fetchFromApiAndSync(category);
        }
      },
      (err) => {
        // Fallback to API if no cached articles
        fetchFromApiAndSync(category);
      }
    );
  }
}

function mapArticles(articles, category) {
  return articles
    .filter((a) => a.url && a.title && a.urlToImage)
    .map((a) => ({
      Title: a.title,
      Url: a.url,
      Description: a.description,
      ImageUrl: a.urlToImage,
      Author: a.author,
      SourceName: a.source.name,
      PublishedAt: a.publishedAt,
      Category: a.category || category
    }));
}

function updateArticleElement(element, article) {
  element.data("article-object", article);

  const imgTag = element.find("[data-image-target]");
  imgTag.attr("src", article.imageUrl);
  imgTag.attr("onerror", "this.style.display='none'; this.onerror=null;");

  element.find("[data-source-target]").text(article.sourceName || "N/A");
  element.find("[data-title-target]").text(article.title || "No title available.");
}

function updateMonthTitle() {
  const now = new Date();
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  $("#month-title").text(`${currentMonth} ${currentYear} NEWS`);
}
