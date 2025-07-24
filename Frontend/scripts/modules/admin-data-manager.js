const AdminDataManager = {
  statistics: {
    general: null,
    daily: null,
    dailyLogins: null,
    dailyArticlePulls: null,
    dailyArticleInserts: null
  },

  currentDateRange: {
    startDate: null,
    endDate: null
  },

  init() {
    this.setDefaultDateRange();
  },

  setDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.currentDateRange.startDate = this.formatDateForInput(startDate);
    this.currentDateRange.endDate = this.formatDateForInput(endDate);
  },

  setDateRange(startDate, endDate) {
    this.currentDateRange.startDate = startDate || null;
    this.currentDateRange.endDate = endDate || null;
  },

  formatDateForInput(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    try {
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return "";
    }
  },

  formatDateForDisplay(dateString) {
    if (!dateString) return "Unknown Date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      console.error("Error formatting date for display:", error, dateString);
      return "Invalid Date";
    }
  },

  loadAllStatistics() {
    return Promise.all([this.loadGeneralStatistics(), this.loadDailyStatistics(), this.loadDailyLogins(), this.loadDailyArticlePulls(), this.loadDailyArticleInserts()]);
  },

  loadGeneralStatistics() {
    return new Promise((resolve, reject) => {
      getGeneralStatistics(
        (data) => {
          this.statistics.general = data;
          resolve(data);
        },
        (error) => {
          console.error("Error loading general statistics:", error);
          reject(error);
        }
      );
    });
  },

  loadDailyStatistics() {
    return new Promise((resolve, reject) => {
      getDailyStatistics(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.daily = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily statistics:", error);
          reject(error);
        }
      );
    });
  },

  loadDailyLogins() {
    return new Promise((resolve, reject) => {
      getDailyLogins(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyLogins = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily logins:", error);
          reject(error);
        }
      );
    });
  },

  loadDailyArticlePulls() {
    return new Promise((resolve, reject) => {
      getDailyArticlePulls(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyArticlePulls = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily article pulls:", error);
          reject(error);
        }
      );
    });
  },

  loadDailyArticleInserts() {
    return new Promise((resolve, reject) => {
      getDailyArticleInserts(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyArticleInserts = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily article inserts:", error);
          reject(error);
        }
      );
    });
  },

  extractLabelsFromData(data) {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => {
      if (!item) return "Unknown Date";
      const dateValue = item.date || item.StatDate || item.statDate;
      if (!dateValue) return "Unknown Date";
      return this.formatDateForDisplay(dateValue);
    });
  },

  extractDataFromStatistics(data, field) {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => {
      if (!item) return 0;

      let value;
      if (field === "count") {
        value =
          item.count ||
          item.Count ||
          item.userLoginCount ||
          item.UserLoginCount ||
          item.articlesPulledCount ||
          item.ArticlesPulledCount ||
          item.articlesInsertedCount ||
          item.ArticlesInsertedCount ||
          item.commentsPostedCount ||
          item.CommentsPostedCount ||
          0;
      } else {
        value = item[field] || item[field.charAt(0).toUpperCase() + field.slice(1)] || 0;
      }

      const parsedValue = parseInt(value);
      return isNaN(parsedValue) ? 0 : parsedValue;
    });
  },

  getProcessedStatistics() {
    return this.statistics;
  },

  calculateSummaryMetrics() {
    const loginsData = this.extractDataFromStatistics(this.statistics.dailyLogins, "count");
    const pullsData = this.extractDataFromStatistics(this.statistics.dailyArticlePulls, "count");
    const insertsData = this.extractDataFromStatistics(this.statistics.dailyArticleInserts, "count");

    const avgLogins = loginsData.length > 0 ? Math.round(loginsData.reduce((a, b) => a + b, 0) / loginsData.length) : 0;
    const avgArticles = pullsData.length > 0 ? Math.round(pullsData.reduce((a, b) => a + b, 0) / pullsData.length) : 0;

    const totalLogins = loginsData.reduce((a, b) => a + b, 0);
    const totalArticles = pullsData.reduce((a, b) => a + b, 0) + insertsData.reduce((a, b) => a + b, 0);

    return {
      avgLogins,
      avgArticles,
      totalLogins,
      totalArticles
    };
  },

  getTableData() {
    if (!this.statistics.dailyLogins || this.statistics.dailyLogins.length === 0) {
      return [];
    }

    const loginsMap = new Map();
    const pullsMap = new Map();
    const insertsMap = new Map();

    this.statistics.dailyLogins?.forEach((item) => {
      if (item) {
        const date = item.date || item.StatDate || item.statDate;
        const count = item.count || item.Count || item.userLoginCount || item.UserLoginCount || 0;
        if (date) {
          loginsMap.set(date, parseInt(count) || 0);
        }
      }
    });

    this.statistics.dailyArticlePulls?.forEach((item) => {
      if (item) {
        const date = item.date || item.StatDate || item.statDate;
        const count = item.count || item.Count || item.articlesPulledCount || item.ArticlesPulledCount || 0;
        if (date) {
          pullsMap.set(date, parseInt(count) || 0);
        }
      }
    });

    this.statistics.dailyArticleInserts?.forEach((item) => {
      if (item) {
        const date = item.date || item.StatDate || item.statDate;
        const count = item.count || item.Count || item.articlesInsertedCount || item.ArticlesInsertedCount || 0;
        if (date) {
          insertsMap.set(date, parseInt(count) || 0);
        }
      }
    });

    const allDates = new Set([...Array.from(loginsMap.keys()), ...Array.from(pullsMap.keys()), ...Array.from(insertsMap.keys())]);

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));

    return sortedDates.map((date) => ({
      date: this.formatDateForDisplay(date),
      logins: loginsMap.get(date) || 0,
      pulls: pullsMap.get(date) || 0,
      inserts: insertsMap.get(date) || 0,
      total: (loginsMap.get(date) || 0) + (pullsMap.get(date) || 0) + (insertsMap.get(date) || 0)
    }));
  }
};

window.AdminDataManager = AdminDataManager;
