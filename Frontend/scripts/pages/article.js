class ArticlePageManager {
  static currentUser = null;
  static currentArticle = null;

  static SELECTORS = {
    articleMainContent: "#article-main-content",
    articleErrorMessage: "#article-error-message",
    articleSource: ".article-source",
    articleTitle: ".article-title",
    articleAuthor: ".article-author",
    articleDate: ".article-date",
    articleTags: ".article-tags",
    articleImage: ".article-image",
    articleContent: ".article-content",
    readFullArticleBtn: ".read-full-article-btn",
    articleActions: ".article-actions",
    aiSummarizeBtn: "#ai-summarize-btn",
    summarySection: "#summary-section",
    urlSource: "#url-source"
  };

  static SCROLL_CONFIG = {
    OFFSET: 100,
    DURATION: 500,
    DELAY: 100
  };

  static init() {
    this.currentUser = Utils.getCurrentUser();
    this.loadArticle();
    this.handlePageHash();
  }

  static loadArticle() {
    const articleId = Utils.getUrlParam("id");

    if (!articleId) {
      this.showError();
      return;
    }

    getArticleById(
      articleId,
      (articleData) => this.handleArticleLoadSuccess(articleData),
      () => this.showError()
    );
  }

  static handleArticleLoadSuccess(articleData) {
    this.currentArticle = articleData;
    this.showArticle();
    this.initializeModules();
  }

  static initializeModules() {
    this.initializeCommentManager();
    this.initializeBookmarkManager();
    this.initializeArticleReporter();
    this.initializeShareManager();
    this.setupArticleActions();
    this.setupEventHandlers();
  }

  static initializeCommentManager() {
    CommentManager.init(this.currentUser, this.currentArticle);
    CommentManager.setup();
    CommentManager.setupEventHandlers();
  }

  static initializeBookmarkManager() {
    BookmarkManager.init(this.currentUser, this.currentArticle);
  }

  static initializeArticleReporter() {
    ArticleReporter.init(this.currentUser, this.currentArticle);
  }

  static initializeShareManager() {
    if (typeof ShareManager !== "undefined") {
      ShareManager.init(this.currentUser, this.currentArticle);
    }
  }

  static setupArticleActions() {
    if (this.currentUser) {
      $(this.SELECTORS.articleActions).show();
    } else {
      $(this.SELECTORS.articleActions).hide();
    }
  }

  static setupEventHandlers() {
    $(this.SELECTORS.aiSummarizeBtn)
      .off("click")
      .on("click", () => this.summarizeArticle());
  }

  static showArticle() {
    if (!this.currentArticle) {
      this.showError();
      return;
    }

    this.setPageTitle();
    this.populateArticleMetadata();
    this.populateArticleContent();
    this.configureReadMoreButton();
    this.showMainContent();
  }

  static setPageTitle() {
    const title = this.currentArticle.title || "Article";
    document.title = `${title} | HORIZON`;
  }

  static populateArticleMetadata() {
    $(this.SELECTORS.articleSource).text(this.currentArticle.sourceName || "Unknown Source");
    $(this.SELECTORS.articleTitle).text(this.currentArticle.title || "No Title");

    const authorText = this.currentArticle.author ? `By ${this.currentArticle.author}` : "No Author";
    $(this.SELECTORS.articleAuthor).text(authorText);

    $(this.SELECTORS.articleDate).text(Utils.formatDate(this.currentArticle.publishedAt));

    this.populateArticleTags();
    this.configureArticleImage();
  }

  static populateArticleTags() {
    const tagsContainer = $(this.SELECTORS.articleTags);
    tagsContainer.empty();

    if (this.currentArticle.category) {
      const categoryHtml = `<div class="tag-item">${this.currentArticle.category}</div>`;
      tagsContainer.append(categoryHtml);
    }
  }

  static configureArticleImage() {
    const imageElement = $(this.SELECTORS.articleImage);

    if (this.currentArticle.imageUrl) {
      imageElement.attr("src", this.currentArticle.imageUrl);
      imageElement.attr("onerror", "this.style.display='none';");
    } else {
      imageElement.hide();
    }
  }

  static populateArticleContent() {
    const content = this.formatContent(this.currentArticle.description);
    $(this.SELECTORS.articleContent).html(content);
  }

  static formatContent(content) {
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

  static configureReadMoreButton() {
    const readMoreButton = $(this.SELECTORS.readFullArticleBtn);

    if (this.currentArticle.url) {
      readMoreButton.attr("href", this.currentArticle.url);
    } else {
      readMoreButton.hide();
    }
  }

  static showMainContent() {
    $(this.SELECTORS.articleMainContent).show();
    $(this.SELECTORS.articleErrorMessage).hide();
  }

  static showError() {
    $(this.SELECTORS.articleMainContent).hide();
    $(this.SELECTORS.articleErrorMessage).show();
  }

  static handlePageHash() {
    const hash = window.location.hash;
    if (!hash) return;

    const targetElement = $(hash);
    if (targetElement.length) {
      setTimeout(() => {
        this.scrollToElement(targetElement);
      }, this.SCROLL_CONFIG.DELAY);
    }
  }

  static scrollToElement(element) {
    $("html, body").animate(
      {
        scrollTop: element.offset().top - this.SCROLL_CONFIG.OFFSET
      },
      this.SCROLL_CONFIG.DURATION
    );
  }

  static summarizeArticle() {
    this.disableSummarizeButton();
    this.showSummaryLoading();

    const sourceUrl = $(this.SELECTORS.urlSource).attr("href");

    getSummarizedArticle(
      sourceUrl,
      (result) => this.handleSummarySuccess(result),
      () => this.handleSummaryError()
    );
  }

  static disableSummarizeButton() {
    $(this.SELECTORS.aiSummarizeBtn).prop("disabled", true).addClass("disabled");
  }

  static enableSummarizeButton() {
    $(this.SELECTORS.aiSummarizeBtn).prop("disabled", false).removeClass("disabled");
  }

  static showSummaryLoading() {
    const loadingHtml = `
      <div id="summary-section" class="summary-section">
        <div class="sun-loading">
          <div class="thinking-container">
            <img src="../sources/images/sun-thinking.png" alt="AI Thinking" class="thinking-icon" />
          </div>
        </div>
      </div>
    `;

    $(this.SELECTORS.articleActions).before(loadingHtml);
  }

  static handleSummarySuccess(result) {
    const summaryHtml = this.createSummaryHTML(result.summary);
    $(this.SELECTORS.summarySection).replaceWith(summaryHtml);

    setTimeout(() => {
      $(this.SELECTORS.summarySection).addClass("summary-section-styled");
    }, 100);
  }

  static createSummaryHTML(summaryText) {
    return `
      <div id="summary-section">
        <div class="summary-header">
          <img src="../sources/images/sun-thinking.png" alt="AI Summary" class="summary-sun-icon" />
          <h3>Sunnary:</h3>
        </div>
        <div class="summary-content">
          <p>${summaryText}</p>
        </div>
      </div>
    `;
  }

  static handleSummaryError() {
    const errorHtml = this.createSummaryErrorHTML();
    $(this.SELECTORS.summarySection).replaceWith(errorHtml);
    this.enableSummarizeButton();
  }

  static createSummaryErrorHTML() {
    return `
      <div id="summary-section" class="summary-section">
        <div class="summary-error">
          <p>Failed to generate summary. Please try again.</p>
          <button onclick="$('#summary-section').remove();" class="close-summary-btn">✕</button>
        </div>
      </div>
    `;
  }

  static removeSummarySection() {
    $(this.SELECTORS.summarySection).remove();
  }
}

$(document).ready(() => {
  ArticlePageManager.init();
});

window.ArticlePageManager = ArticlePageManager;
