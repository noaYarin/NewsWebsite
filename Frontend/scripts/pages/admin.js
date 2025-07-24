const AdminDashboard = {
  charts: {},
  currentDateRange: {
    startDate: null,
    endDate: null
  },
  statistics: {
    general: null,
    daily: null,
    dailyLogins: null,
    dailyArticlePulls: null,
    dailyArticleInserts: null
  },

  init() {
    console.log("AdminDashboard initializing...");

    try {
      this.setupEventListeners();
      this.loadAllStatistics();
      this.initializeDateInputs();

      setTimeout(() => {
        this.hidePageLoader();
      }, 1000);
    } catch (error) {
      console.error("Error initializing AdminDashboard:", error);
      this.showError("Failed to initialize dashboard: " + error.message);
    }
  },

  hidePageLoader() {
    const $loader = $("#page-loader");
    const $mainContent = $("#main-content");

    if ($loader.length && $mainContent.length) {
      $loader.addClass("fade-out");
      $mainContent.show();

      setTimeout(() => {
        $loader.remove();
      }, 600);
    }
  },

  setupEventListeners() {
    $("#applyDateFilter").on("click", () => this.applyDateFilter());
    $("#clearDateFilter").on("click", () => this.clearDateFilter());

    // Enter key support for date inputs
    $("#startDate, #endDate").on("keypress", (e) => {
      if (e.which === 13) this.applyDateFilter();
    });
  },

  initializeDateInputs() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    $("#endDate").val(this.formatDateForInput(endDate));
    $("#startDate").val(this.formatDateForInput(startDate));
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

  showLoading() {
    $("#loadingIndicator").show();
    $("#errorMessage").hide();
    $(".stat-card").addClass("loading");
  },

  hideLoading() {
    $("#loadingIndicator").hide();
    $(".stat-card").removeClass("loading");
  },

  showError(message) {
    $("#errorText").text(message);
    $("#errorMessage").show();
    this.hideLoading();
  },

  loadAllStatistics() {
    this.showLoading();

    Promise.all([this.loadGeneralStatistics(), this.loadDailyStatistics(), this.loadDailyLogins(), this.loadDailyArticlePulls(), this.loadDailyArticleInserts()])
      .then(() => {
        this.hideLoading();
        this.renderAllCharts();
        this.updateSummaryMetrics();
        this.populateDataTable();
        this.animateCards();
      })
      .catch((error) => {
        console.error("Error loading statistics:", error);
        this.showError("Failed to load statistics. Please check your connection and try again.");
      });
  },

  loadGeneralStatistics() {
    return new Promise((resolve, reject) => {
      if (typeof getGeneralStatistics === "undefined") {
        console.warn("getGeneralStatistics function not available");
        const fallbackData = { totalUsers: 0, totalArticles: 0, totalComments: 0, totalBookmarks: 0 };
        this.statistics.general = fallbackData;
        this.updateGeneralStatisticsCards(fallbackData);
        resolve(fallbackData);
        return;
      }

      getGeneralStatistics(
        (data) => {
          this.statistics.general = data;
          this.updateGeneralStatisticsCards(data);
          resolve(data);
        },
        (error) => {
          console.error("Error loading general statistics:", error);
          const fallbackData = {
            totalUsers: 0,
            totalArticles: 0,
            totalComments: 0,
            totalBookmarks: 0
          };
          this.statistics.general = fallbackData;
          this.updateGeneralStatisticsCards(fallbackData);
          resolve(fallbackData);
        }
      );
    });
  },

  loadDailyStatistics() {
    return new Promise((resolve, reject) => {
      if (typeof getDailyStatistics === "undefined") {
        console.warn("getDailyStatistics function not available");
        this.statistics.daily = [];
        resolve([]);
        return;
      }

      getDailyStatistics(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.daily = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily statistics:", error);
          this.statistics.daily = [];
          resolve([]);
        }
      );
    });
  },

  loadDailyLogins() {
    return new Promise((resolve, reject) => {
      if (typeof getDailyLogins === "undefined") {
        console.warn("getDailyLogins function not available");
        this.statistics.dailyLogins = [];
        resolve([]);
        return;
      }

      getDailyLogins(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyLogins = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily logins:", error);
          this.statistics.dailyLogins = [];
          resolve([]);
        }
      );
    });
  },

  loadDailyArticlePulls() {
    return new Promise((resolve, reject) => {
      if (typeof getDailyArticlePulls === "undefined") {
        console.warn("getDailyArticlePulls function not available");
        this.statistics.dailyArticlePulls = [];
        resolve([]);
        return;
      }

      getDailyArticlePulls(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyArticlePulls = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily article pulls:", error);
          this.statistics.dailyArticlePulls = [];
          resolve([]);
        }
      );
    });
  },

  loadDailyArticleInserts() {
    return new Promise((resolve, reject) => {
      if (typeof getDailyArticleInserts === "undefined") {
        console.warn("getDailyArticleInserts function not available");
        this.statistics.dailyArticleInserts = [];
        resolve([]);
        return;
      }

      getDailyArticleInserts(
        this.currentDateRange.startDate,
        this.currentDateRange.endDate,
        (data) => {
          this.statistics.dailyArticleInserts = data || [];
          resolve(data || []);
        },
        (error) => {
          console.error("Error loading daily article inserts:", error);
          this.statistics.dailyArticleInserts = [];
          resolve([]);
        }
      );
    });
  },

  updateGeneralStatisticsCards(data) {
    // Handle different field name variations from backend
    const totalUsers = data.totalUsers || data.TotalUsers || 0;
    const totalArticles = data.totalArticles || data.TotalArticles || 0;
    const totalComments = data.totalComments || data.TotalComments || 0;
    const totalBookmarks = data.totalBookmarks || data.TotalBookmarks || 0;

    // Animate number counting
    this.animateNumber("#totalUsers", totalUsers);
    this.animateNumber("#totalArticles", totalArticles);
    this.animateNumber("#totalComments", totalComments);
    this.animateNumber("#totalBookmarks", totalBookmarks);
  },

  animateNumber(selector, finalValue) {
    const element = $(selector);
    const startValue = 0;
    const duration = 2000;
    const startTime = Date.now();

    const updateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOut);

      element.text(currentValue.toLocaleString());

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.text(finalValue.toLocaleString());
      }
    };

    updateNumber();
  },

  renderAllCharts() {
    this.renderDailyStatsChart();
    this.renderDailyLoginsChart();
    this.renderDailyArticlePullsChart();
    this.renderDailyArticleInsertsChart();
  },

  renderDailyStatsChart() {
    const ctx = document.getElementById("dailyStatsChart");
    if (!ctx) {
      console.warn("Daily stats chart canvas not found");
      return;
    }

    // Destroy existing chart if it exists
    if (this.charts.dailyStats) {
      this.charts.dailyStats.destroy();
    }

    const labels = this.extractLabelsFromData(this.statistics.daily);
    const loginsData = this.extractDataFromStatistics(this.statistics.dailyLogins, "count");
    const pullsData = this.extractDataFromStatistics(this.statistics.dailyArticlePulls, "count");
    const insertsData = this.extractDataFromStatistics(this.statistics.dailyArticleInserts, "count");

    this.charts.dailyStats = new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Logins",
            data: loginsData,
            borderColor: "#ffcc00",
            backgroundColor: "rgba(255, 204, 0, 0.1)",
            tension: 0.4,
            fill: false,
            pointBackgroundColor: "#ffcc00",
            pointBorderColor: "#000000",
            pointBorderWidth: 2
          },
          {
            label: "Article Pulls",
            data: pullsData,
            borderColor: "#28a745",
            backgroundColor: "rgba(40, 167, 69, 0.1)",
            tension: 0.4,
            fill: false,
            pointBackgroundColor: "#28a745",
            pointBorderColor: "#000000",
            pointBorderWidth: 2
          },
          {
            label: "Article Inserts",
            data: insertsData,
            borderColor: "#ffc107",
            backgroundColor: "rgba(255, 193, 7, 0.1)",
            tension: 0.4,
            fill: false,
            pointBackgroundColor: "#ffc107",
            pointBorderColor: "#000000",
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: "index"
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                family: "GeographWeb, sans-serif",
                weight: "600"
              },
              color: "#000000"
            }
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            titleColor: "#ffcc00",
            bodyColor: "#ffffff",
            borderColor: "#ffcc00",
            borderWidth: 2,
            titleFont: {
              family: "GeographWeb, sans-serif",
              weight: "600"
            },
            bodyFont: {
              family: "GeographWeb, sans-serif"
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Date",
              font: {
                family: "GeographWeb, sans-serif",
                weight: "600"
              },
              color: "#000000"
            },
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Count",
              font: {
                family: "GeographWeb, sans-serif",
                weight: "600"
              },
              color: "#000000"
            },
            beginAtZero: true,
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          }
        }
      }
    });
  },

  renderDailyLoginsChart() {
    const ctx = document.getElementById("dailyLoginsChart");
    if (!ctx) {
      console.warn("Daily logins chart canvas not found");
      return;
    }

    if (this.charts.dailyLogins) {
      this.charts.dailyLogins.destroy();
    }

    const labels = this.extractLabelsFromData(this.statistics.dailyLogins);
    const data = this.extractDataFromStatistics(this.statistics.dailyLogins, "count");

    this.charts.dailyLogins = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Logins",
            data: data,
            backgroundColor: "rgba(255, 204, 0, 0.8)",
            borderColor: "#ffcc00",
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Logins",
              font: {
                family: "GeographWeb, sans-serif",
                weight: "600"
              },
              color: "#000000"
            },
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          },
          x: {
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          }
        }
      }
    });
  },

  renderDailyArticlePullsChart() {
    const ctx = document.getElementById("dailyArticlePullsChart");
    if (!ctx) {
      console.warn("Daily article pulls chart canvas not found");
      return;
    }

    if (this.charts.dailyArticlePulls) {
      this.charts.dailyArticlePulls.destroy();
    }

    const labels = this.extractLabelsFromData(this.statistics.dailyArticlePulls);
    const data = this.extractDataFromStatistics(this.statistics.dailyArticlePulls, "count");

    this.charts.dailyArticlePulls = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Article Pulls",
            data: data,
            backgroundColor: "rgba(40, 167, 69, 0.8)",
            borderColor: "#28a745",
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Pulls",
              font: {
                family: "GeographWeb, sans-serif",
                weight: "600"
              },
              color: "#000000"
            },
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          },
          x: {
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          }
        }
      }
    });
  },

  renderDailyArticleInsertsChart() {
    const ctx = document.getElementById("dailyArticleInsertsChart");
    if (!ctx) {
      console.warn("Daily article inserts chart canvas not found");
      return;
    }

    if (this.charts.dailyArticleInserts) {
      this.charts.dailyArticleInserts.destroy();
    }

    const labels = this.extractLabelsFromData(this.statistics.dailyArticleInserts);
    const data = this.extractDataFromStatistics(this.statistics.dailyArticleInserts, "count");

    this.charts.dailyArticleInserts = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Article Inserts",
            data: data,
            backgroundColor: "rgba(255, 193, 7, 0.8)",
            borderColor: "#ffc107",
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Inserts",
              font: {
                family: "GeographWeb, sans-serif",
                weight: "600"
              },
              color: "#000000"
            },
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          },
          x: {
            ticks: {
              font: {
                family: "GeographWeb, sans-serif"
              },
              color: "#666666"
            },
            grid: {
              color: "#eeeeee"
            }
          }
        }
      }
    });
  },

  extractLabelsFromData(data) {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => {
      if (!item) return "Unknown Date";
      // Handle both 'date' and 'StatDate' field names
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
      // Handle different field name variations
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

  updateSummaryMetrics() {
    const loginsData = this.extractDataFromStatistics(this.statistics.dailyLogins, "count");
    const pullsData = this.extractDataFromStatistics(this.statistics.dailyArticlePulls, "count");
    const insertsData = this.extractDataFromStatistics(this.statistics.dailyArticleInserts, "count");

    // Calculate averages
    const avgLogins = loginsData.length > 0 ? Math.round(loginsData.reduce((a, b) => a + b, 0) / loginsData.length) : 0;
    const avgArticles = pullsData.length > 0 ? Math.round(pullsData.reduce((a, b) => a + b, 0) / pullsData.length) : 0;

    // Calculate totals
    const totalLogins = loginsData.reduce((a, b) => a + b, 0);
    const totalArticles = pullsData.reduce((a, b) => a + b, 0) + insertsData.reduce((a, b) => a + b, 0);

    // Update UI
    $("#avgDailyLogins").text(avgLogins.toLocaleString());
    $("#avgDailyArticles").text(avgArticles.toLocaleString());
    $("#totalPeriodLogins").text(totalLogins.toLocaleString());
    $("#totalPeriodArticles").text(totalArticles.toLocaleString());
  },

  populateDataTable() {
    const tableBody = $("#dailyStatsTableBody");
    tableBody.empty();

    if (!this.statistics.dailyLogins || this.statistics.dailyLogins.length === 0) {
      tableBody.append('<tr><td colspan="5" class="text-center text-muted">No data available</td></tr>');
      return;
    }

    // Create a map for easier lookup
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

    // Get all unique dates and sort them
    const allDates = new Set([...Array.from(loginsMap.keys()), ...Array.from(pullsMap.keys()), ...Array.from(insertsMap.keys())]);

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach((date) => {
      const logins = loginsMap.get(date) || 0;
      const pulls = pullsMap.get(date) || 0;
      const inserts = insertsMap.get(date) || 0;
      const total = logins + pulls + inserts;

      const row = `
        <tr class="fade-in">
          <td><strong>${this.formatDateForDisplay(date)}</strong></td>
          <td><span class="badge bg-primary">${logins.toLocaleString()}</span></td>
          <td><span class="badge bg-success">${pulls.toLocaleString()}</span></td>
          <td><span class="badge bg-warning">${inserts.toLocaleString()}</span></td>
          <td><span class="badge bg-info">${total.toLocaleString()}</span></td>
        </tr>
      `;
      tableBody.append(row);
    });
  },

  applyDateFilter() {
    const startDate = $("#startDate").val();
    const endDate = $("#endDate").val();

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.showError("Start date cannot be after end date.");
      return;
    }

    this.currentDateRange.startDate = startDate || null;
    this.currentDateRange.endDate = endDate || null;

    this.loadAllStatistics();
  },

  clearDateFilter() {
    $("#startDate").val("");
    $("#endDate").val("");
    this.currentDateRange.startDate = null;
    this.currentDateRange.endDate = null;
    this.loadAllStatistics();
  },

  animateCards() {
    // Add staggered animation to cards
    $(".stat-card, .card").each((index, element) => {
      setTimeout(() => {
        $(element).addClass("slide-up");
      }, index * 100);
    });
  }
};

$(document).ready(() => {
  if (typeof getGeneralStatistics === "undefined") {
    console.warn("API functions not fully loaded. Dashboard will work with fallback data.");
  }

  console.log("Initializing Admin Dashboard...");
  AdminDashboard.init();
});
