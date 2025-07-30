class ArticleReporter {
  static currentUser = null;
  static currentArticle = null;

  static init(user, article) {
    this.currentUser = user;
    this.currentArticle = article;
    this.setupEventHandlers();
  }

  static setupEventHandlers() {
    $(document).on("click", "#report-article-btn", (e) => this.handleReport(e));
  }

  static handleReport(e) {
    if (!this.currentUser) {
      UIManager.showPopup("Please log in to report articles.", false);
      return;
    }
    if (!this.currentArticle) return;

    UIManager.showDialog("Are you sure you want to report this article?", true).then((result) => {
      if (result && result.reported) {
        const reportData = {
          reporterUserId: this.currentUser.id,
          articleId: this.currentArticle.id,
          reason: result.reasonCategory,
          details: result.reason
        };

        reportArticle(
          reportData,
          () => UIManager.showPopup("Article reported. Thank you for your feedback.", true),
          () => UIManager.showPopup("Failed to report article. Please try again.", false)
        );
      }
    });
  }
}

window.ArticleReporter = ArticleReporter;
