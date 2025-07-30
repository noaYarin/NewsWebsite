class AdminDataManager {
  static statistics = {
    general: null,
    daily: null,
    dailyLogins: null,
    dailyArticlePulls: null,
    dailyArticleInserts: null
  };

  static currentDateRange = {
    startDate: null,
    endDate: null
  };

  static init() {
    this.setDefaultDateRange();
  }

  static setDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.currentDateRange.startDate = this.formatDateForInput(startDate);
    this.currentDateRange.endDate = this.formatDateForInput(endDate);
  }

  static setDateRange(startDate, endDate) {
    this.currentDateRange.startDate = startDate || null;
    this.currentDateRange.endDate = endDate || null;
  }

  static formatDateForInput(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    try {
      return date.toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  }

  static formatDateForDisplay(dateString) {
    if (!dateString) return "Unknown Date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (error) {
      return "Invalid Date";
    }
  }

  // ========== Data Loading Methods ==========

  static loadAllStatistics() {
    return Promise.all([this.loadGeneralStatistics(), this.loadDailyStatistics(), this.loadDailyLogins(), this.loadDailyArticlePulls(), this.loadDailyArticleInserts()]);
  }

  static loadGeneralStatistics() {
    return new Promise((resolve, reject) => {
      getGeneralStatistics(
        (data) => {
          this.statistics.general = data;
          resolve(data);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static loadDailyStatistics() {
    return new Promise((resolve, reject) => {
      getDailyStatistics(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.daily = data || [];
          resolve(data || []);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static loadDailyLogins() {
    return new Promise((resolve, reject) => {
      getDailyLogins(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyLogins = data || [];
          resolve(data || []);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static loadDailyArticlePulls() {
    return new Promise((resolve, reject) => {
      getDailyArticlePulls(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyArticlePulls = data || [];
          resolve(data || []);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static loadDailyArticleInserts() {
    return new Promise((resolve, reject) => {
      getDailyArticleInserts(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyArticleInserts = data || [];
          resolve(data || []);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  static extractLabelsFromData(data) {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => {
      if (!item || !item.statDate) return "Unknown Date";
      return this.formatDateForDisplay(item.statDate);
    });
  }

  /**
   * Extract numeric values from statistics data based on field type
   * Mathematical function: f: (data, field) → numeric array
   * Implements context-aware property mapping using reference equality
   *
   * For field='count': Uses dataset reference to determine appropriate count property
   * - dailyLogins → userLoginCount
   * - dailyArticlePulls → articlesPulledCount
   * - dailyArticleInserts → articlesInsertedCount
   *
   * @param {Array} data - Statistics data array
   * @param {string} field - Field name to extract ('count', 'logins', 'pulls', 'inserts', 'comments')
   * @returns {Array<number>} Array of integer values
   */
  static extractDataFromStatistics(data, field) {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => {
      if (!item) return 0;

      let value = 0;

      // If field is 'count', determine which count to use based on which data array this is
      if (field === "count") {
        if (data === this.statistics.dailyLogins) {
          value = item.userLoginCount;
        } else if (data === this.statistics.dailyArticlePulls) {
          value = item.articlesPulledCount;
        } else if (data === this.statistics.dailyArticleInserts) {
          value = item.articlesInsertedCount;
        } else {
          // For daily statistics or unknown data, use the first non-zero count
          value = item.userLoginCount || item.articlesPulledCount || item.articlesInsertedCount || item.commentsPostedCount || 0;
        }
      } else {
        // Map specific field names to actual property names
        switch (field) {
          case "logins":
            value = item.userLoginCount;
            break;
          case "pulls":
            value = item.articlesPulledCount;
            break;
          case "inserts":
            value = item.articlesInsertedCount;
            break;
          case "comments":
            value = item.commentsPostedCount;
            break;
          default:
            // Direct property access
            value = item[field];
        }
      }

      const parsedValue = parseInt(value);
      return isNaN(parsedValue) ? 0 : parsedValue;
    });
  }

  /**
   * Get processed statistics object
   * Simple accessor method following encapsulation principle
   * @returns {Object} Current statistics state
   */
  static getProcessedStatistics() {
    return this.statistics;
  }

  /**
   * Calculate summary metrics from time series data
   * Mathematical operations:
   * - Average: μ = (1/n) × Σ(xi) for i=1 to n
   * - Total: Σ(xi) for all data points
   *
   * Computes:
   * - avgLogins: Mean daily login count
   * - avgArticles: Mean daily article pull count
   * - totalLogins: Sum of all logins in period
   * - totalArticles: Sum of (pulls + inserts) in period
   *
   * @returns {Object} Summary statistics object
   */
  static calculateSummaryMetrics() {
    const loginsData = this.extractDataFromStatistics(this.statistics.dailyLogins, "logins");
    const pullsData = this.extractDataFromStatistics(this.statistics.dailyArticlePulls, "pulls");
    const insertsData = this.extractDataFromStatistics(this.statistics.dailyArticleInserts, "inserts");

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
  }

  /**
   * Generate table data from daily statistics
   * Mathematical transformation: Time series data → Tabular representation
   *
   * Process:
   * 1. Sort by date descending: O(n log n) complexity
   * 2. Map to display format with calculated totals
   * 3. Total = logins + pulls + inserts (activity aggregation)
   *
   * Uses daily statistics as single source of truth for efficiency
   * Avoids redundant data processing from multiple endpoints
   * Since all data has the same structure, we can use the daily statistics
   * which contains all the data in one place
   *
   * @returns {Array<Object>} Array of table row objects
   */
  static getTableData() {
    if (!this.statistics.daily || this.statistics.daily.length === 0) {
      return [];
    }

    const sortedData = [...this.statistics.daily].sort((a, b) => new Date(b.statDate) - new Date(a.statDate));
    return sortedData.map((item) => {
      return {
        date: this.formatDateForDisplay(item.statDate),
        logins: parseInt(item.userLoginCount) || 0,
        pulls: parseInt(item.articlesPulledCount) || 0,
        inserts: parseInt(item.articlesInsertedCount) || 0,
        total: (parseInt(item.userLoginCount) || 0) + (parseInt(item.articlesPulledCount) || 0) + (parseInt(item.articlesInsertedCount) || 0)
      };
    });
  }
}

window.AdminDataManager = AdminDataManager;
