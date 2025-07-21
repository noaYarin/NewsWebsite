let currentUser = null;
let currentArticle = null;

$(document).ready(function () {
  currentUser = Utils.getCurrentUser();
  const articleId = Utils.getUrlParam("id");

  if (articleId) {
    getArticleById(
      articleId,
      function (articleData) {
        currentArticle = articleData;
        showArticle();
        initializeModules();
      },
      function () {
        showError();
      }
    );
  } else {
    showError();
  }
});

function initializeModules() {
  CommentManager.init(currentUser, currentArticle);
  CommentManager.setup();
  CommentManager.setupEventHandlers();

  BookmarkManager.init(currentUser, currentArticle);
  ArticleReporter.init(currentUser, currentArticle);

  if (currentUser) {
    $(".article-actions").show();
  } else {
    $(".article-actions").hide();
  }
}

$(document).on("click", "#ai-summarize-btn", summarizeArticle);

function summarizeArticle() {
  getSummarizedArticle(
    $("#url-source").attr("href"),
    (result) => {
      console.log("Summary:", result.summary);
    },
    (error) => {
      console.error("Error:", error);
    }
  );
}

function showArticle() {
  if (!currentArticle) {
    showError();
    return;
  }

  document.title = `${currentArticle.title || "Article"} | HORIZON`;
  $(".article-source").text(currentArticle.sourceName || "Unknown Source");
  $(".article-title").text(currentArticle.title || "No Title");
  $(".article-author").text(currentArticle.author ? `By ${currentArticle.author}` : "No Author");
  $(".article-date").text(Utils.formatDate(currentArticle.publishedAt));

  const tagsContainer = $(".article-tags");
  tagsContainer.empty();
  if (currentArticle.category) {
    const categoryHtml = `<div class="tag-item">${currentArticle.category}</div>`;
    tagsContainer.append(categoryHtml);
  }

  if (currentArticle.imageUrl) {
    $(".article-image").attr("src", currentArticle.imageUrl);
    $(".article-image").attr("onerror", "this.style.display='none';");
  } else {
    $(".article-image").hide();
  }

  const content = formatContent(currentArticle.description);
  $(".article-content").html(content);

  if (currentArticle.url) {
    $(".read-full-article-btn").attr("href", currentArticle.url);
  } else {
    $(".read-full-article-btn").hide();
  }

  $("#article-main-content").show();
  $("#article-error-message").hide();
}

function showError() {
  $("#article-main-content").hide();
  $("#article-error-message").show();
}

function formatContent(content) {
  if (!content) {
    return "<p>No content available. Please read the full story on the source website.</p>";
  }
  const cleaned = content.replace(/\s*\[\+\d+\s*chars\]\s*$/, "");
  return cleaned
    .split(/[\r\n]+/)
    .filter((p) => p.trim() !== "")
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");
}
