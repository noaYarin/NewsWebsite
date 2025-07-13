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

async function loadAllNewsSections() {
  await fetchAndDisplayNews({ query: "world", containerSelector: "#container", title: "LATEST NEWS" });

  for (const [selector, category] of Object.entries(interestSections)) {
    await fetchAndDisplayNews({ category, containerSelector: selector, title: `${category.toUpperCase()} NEWS` });
  }
}

async function fetchAndDisplayNews({ category, query, containerSelector }) {
  const container = $(containerSelector);
  if (!container.length) return;

  try {
    let response;
    if (query) {
      response = await searchNews(query);
    } else if (category) {
      response = await getTopHeadlines(category);
    }

    const articlesFromApi = response.data
      .filter((a) => a.url && a.title && a.urlToImage)
      .map((a) => ({
        Title: a.title,
        Url: a.url,
        Description: a.description,
        ImageUrl: a.urlToImage,
        Author: a.author,
        SourceName: a.source.name,
        PublishedAt: a.publishedAt,
        Category: a.category
      }));

    const syncedArticles = await syncArticles(articlesFromApi);

    const articleElements = container.find("[data-article-index]");
    articleElements.each(function (index) {
      if (index < syncedArticles.length) {
        updateArticleElement($(this), syncedArticles[index]);
      }
    });
  } catch (err) {
    console.error(`Error fetching or syncing news for ${containerSelector}:`, err);
  }
}

function updateArticleElement(element, article) {
  element.data("article-object", article);

  element.find("[data-image-target]").attr("src", article.imageUrl || DEFAULT_IMAGE);
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
