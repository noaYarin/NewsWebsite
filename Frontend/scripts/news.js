const DEFAULT_IMAGE = "../sources/images/placeholder.jpg";

const userInterests = ["technology", "health", "sports"];
/* const userInterests = JSON.parse(localStorage.getItem("userInterests") || "[]"); */

/* might change later */
const interestSections = {
  "#secondary-container": userInterests[0] || "business",
  ".our-picks-cards": userInterests[1] || "science",
  "#third-container": userInterests[2] || "entertainment",
  "#fourth-container": "general"
};

$(document).ready(function () {
  updateMonthTitle();
  loadAllNewsSections();

  // Handle click on website link to save article data in sessionStorage
  $(document).on("click", ".website-link", function (e) {
    const articleElement = $(this).closest("[data-article-index]");
    if (articleElement.length) {
      const articleData = {
        title: articleElement.data("article-title"),
        description: articleElement.data("article-description"),
        url: articleElement.data("article-url"),
        image: articleElement.data("article-image"),
        source: articleElement.data("article-source"),
        author: articleElement.data("article-author"),
        published: articleElement.data("article-published")
      };
      sessionStorage.setItem("currentArticle", JSON.stringify(articleData));
    }
  });
});

function updateMonthTitle() {
  const now = new Date();
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  $("#month-title").text(`${currentMonth} ${currentYear} NEWS`);
}

function loadAllNewsSections() {
  const newsPromises = [];

  newsPromises.push(
    fetchAndDisplayNews({
      query: "world",
      containerSelector: "#container",
      title: "Latest News"
    })
  );

  newsPromises.push(
    fetchAndDisplayNews({
      query: "travel",
      containerSelector: ".discover-articles-section"
    })
  );

  for (const [selector, category] of Object.entries(interestSections)) {
    newsPromises.push(
      fetchAndDisplayNews({
        category: category,
        containerSelector: selector,
        title: `${category.toUpperCase()} NEWS`
      })
    );
  }
  Promise.all(newsPromises);
}

async function fetchAndDisplayNews({ category, query, containerSelector, title, page = 1 }) {
  const container = $(containerSelector);
  if (!container.length) return;

  if (title) {
    const titleElement = container.find(".titles h1").first();
    if (titleElement.length) {
      titleElement.text(title);
    }
  }

  const successCallback = (response) => {
    const articles = response.data.filter((article) => article.urlToImage && article.title && article.description);
    const articleElements = container.find("[data-article-index]");

    articleElements.each(function (index) {
      if (index < articles.length) {
        updateArticleElement($(this), articles[index]);
      }
    });
  };

  const errorCallback = (err) => {
    console.error(`Error fetching news for ${containerSelector}:`, err);
  };

  try {
    if (query) {
      await searchNews(query, page, successCallback, errorCallback);
    } else if (category) {
      await getTopHeadlines(category, page, successCallback, errorCallback);
    }
  } catch (error) {
    console.error(`Error in fetchAndDisplayNews for ${containerSelector}:`, error);
  }
}

function updateArticleElement(element, article) {
  element
    .attr("data-article-url", article.url || "#")
    .attr("data-article-title", article.title || "")
    .attr("data-article-description", article.description || "")
    .attr("data-article-image", article.urlToImage || DEFAULT_IMAGE)
    .attr("data-article-source", article.source?.name || "N/A")
    .attr("data-article-author", article.author || "Unknown Author")
    .attr("data-article-published", article.publishedAt || "");

  element.find("[data-image-target]").attr("src", article.urlToImage || DEFAULT_IMAGE);
  element.find("[data-source-target]").text(article.source?.name || "N/A");
  element.find("[data-title-target]").text(article.title || "No title available.");
  element.find("[data-description-target]").text(article.description || "");
  element.find("[data-author-target]").text(article.author || "Unknown Author");
}
