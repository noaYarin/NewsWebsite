const StatisticsManager = {
  getStatistics() {
    let state = localStorage.getItem("siteState");
    state = state ? JSON.parse(state) : { usersCount: 0, articlesFetchesCount: 0, savedArticlesCount: 0, savedAt: Date.now() };

    if (this.updateTime(state)) {
      state = { usersCount: 0, articlesFetchesCount: 0, savedArticlesCount: 0, savedAt: Date.now() };
    }
    this.saveStatistics(state);
    return state;
  },

  saveStatistics(state) {
    localStorage.setItem("siteState", JSON.stringify(state));
  },

  incrementArticlesFetchesCount() {
    let state = this.getStatistics();
    state.articlesFetchesCount++;
    this.saveStatistics(state);
  },

  incrementUsersCount() {
    let state = this.getStatistics();
    state.usersCount++;
    this.saveStatistics(state);
  },

  incrementSavedArticlesCount() {
    let state = this.getStatistics();
    state.savedArticlesCount++;
    this.saveStatistics(state);
  },

  decrementSavedArticlesCount() {
    let state = this.getStatistics();
    if (state.savedArticlesCount > 0) {
      state.savedArticlesCount--;
      this.saveStatistics(state);
    }
  },

  updateTime(state) {
    let currTime = Date.now();
    let updatedTime = currTime - state.savedAt;
    return updatedTime >= 24 * 60 * 60 * 1000;
  }
};

window.StatisticsManager = StatisticsManager;
