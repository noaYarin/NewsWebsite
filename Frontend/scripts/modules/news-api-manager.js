class NewsAPIManager {
  static async fetchFromAPI(category, query) {
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
              (syncedArticles) => {
                resolve(syncedArticles);
              },
              () => {
                resolve(articles);
              }
            );
          } else {
            resolve([]);
          }
        },
        (error) => {
          resolve([]);
        }
      );
    });
  }

  static async fetchFromCache(category, count) {
    return new Promise((resolve) => {
      getRecentArticles(
        category,
        count,
        (articles) => {
          resolve(this.mapArticles(articles || [], category));
        },
        () => {
          resolve([]);
        }
      );
    });
  }

  static mapArticles(apiArticles, category) {
    const mapped = apiArticles
      .filter((a) => a && a.url && a.title && a.title !== "[Removed]" && (a.urlToImage || a.imageUrl) && a.description)
      .map((a) => ({
        id: a.id || `${Date.now()}-${Math.random()}`,
        title: a.title,
        url: a.url,
        description: a.description || "",
        imageUrl: a.imageUrl,
        author: a.author || "",
        sourceName: a.sourceName || "Unknown Source",
        publishedAt: a.publishedAt,
        category: a.category || category || "general" // fallback to category from parameter
      }));
    return mapped;
  }
}
