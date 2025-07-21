const NewsAPIManager = {
  async fetchFromAPI(category, query) {
    return new Promise((resolve) => {
      const apiCall = query ? searchNews : getTopHeadlines;
      const searchValue = query || category;

      apiCall(
        searchValue,
        1,
        (response) => {
          if (response && response.data) {
            const articles = this.mapArticles(response.data, category);
            syncArticles(
              articles,
              (syncedArticles) => resolve(syncedArticles),
              () => resolve(articles) // Fallback to unsynced if sync fails
            );
          } else {
            resolve([]);
          }
        },
        () => resolve([])
      );
    });
  },

  async fetchFromCache(category, count) {
    return new Promise((resolve) => {
      getRecentArticles(
        category,
        count,
        (articles) => resolve(this.mapArticles(articles || [], category)),
        () => resolve([])
      );
    });
  },

  mapArticles(apiArticles, category) {
    return apiArticles
      .filter((a) => a && a.url && a.title && a.title !== "[Removed]" && (a.urlToImage || a.imageUrl) && a.description)
      .map((a) => ({
        id: a.id || a.Id || `${Date.now()}-${Math.random()}`,
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
};
