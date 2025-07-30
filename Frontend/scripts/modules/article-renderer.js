class ArticleRenderer {
  static renderListItem(article) {
    return `
      <a href="../html/article.html?id=${article.id}" class="article-list-item">
        <div class="article-item-image">
          <img src="${article.imageUrl || CONSTANTS.PLACEHOLDER_IMAGE_URL}" alt="${article.title}" />
        </div>
        <div class="article-item-content">
          <span class="category-tag">${article.sourceName || article.category || "News"}</span>
          <h3 class="article-item-title">${article.title}</h3>
          <span class="article-item-author">${article.author || "Unknown Author"}</span>
        </div>
      </a>`;
  }

  static updateArticleElement(element, article) {
    element.data("article-object", article);

    const linkElement = element.is("a") ? element : element.find("a");
    if (linkElement.length) {
      linkElement.attr("href", `../html/article.html?id=${article.id}`);
    }

    const img = element.find("[data-image-target]");
    if (img.length) {
      img.attr("src", article.imageUrl || CONSTANTS.DEFAULT_IMAGE);
      img.attr("onerror", `this.src='${CONSTANTS.DEFAULT_IMAGE}';`);
    }

    element.find("[data-source-target]").text(article.sourceName);
    element.find("[data-title-target]").text(article.title);
    element.find("[data-author-target]").text(article.author);
    element.find("[data-description-target]").text(article.description);
  }

  static displayArticleList(container, articles) {
    container.empty();
    articles.forEach((article) => {
      container.append(this.renderListItem(article));
    });
  }
}

window.ArticleRenderer = ArticleRenderer;
