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

  if (typeof ShareManager !== "undefined") {
    ShareManager.init(currentUser, currentArticle);
  }

  if (currentUser) {
    $(".article-actions").show();
  } else {
    $(".article-actions").hide();
  }
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

  $("#ai-summarize-btn").click(summarizeArticle);
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

function summarizeArticle() {
  const loadingHtml = `
    <div id="summary-section" class="summary-section">
      <div class="summary-loading">
        <div class="thinking-container">
          <img src="../sources/images/sun-thinking.png" alt="AI Thinking" class="thinking-icon" />
        </div>
      </div>
    </div>
  `;

  $(".article-actions").before(loadingHtml);

  getSummarizedArticle(
    $("#url-source").attr("href"),
    (result) => {
      const summaryHtml = `
        <div id="summary-section">
          <h3>Sunnary:</h3>
          <div class="summary-content">
            <p>${result.summary}</p>
          </div>
        </div>
      `;

      $("#summary-section").replaceWith(summaryHtml);

      setTimeout(() => {
        $("#summary-section").addClass("summary-section-styled");
      }, 100);
    },
    () => {
      const errorHtml = `
        <div id="summary-section" class="summary-section">
          <div class="summary-error">
            <p>Failed to generate summary. Please try again.</p>
            <button onclick="$('#summary-section').remove();" class="close-summary-btn">✕</button>
          </div>
        </div>
      `;

      $("#summary-section").replaceWith(errorHtml);
    }
  );
}
