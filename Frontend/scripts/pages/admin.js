class AdminDashboard {
  static CONFIG = {
    ANIMATION_DELAY: 100,
    NUMBER_ANIMATION_DURATION: 2000,
    PAGE_LOADER_DELAY: 1000,
    LOADER_FADE_DURATION: 600,
    DEFAULT_DATE_RANGE_DAYS: 30
  };

  static SELECTORS = {
    pageLoader: "#page-loader",
    mainContent: "#main-content",
    loadingIndicator: "#loadingIndicator",
    errorMessage: "#errorMessage",
    errorText: "#errorText",
    startDate: "#startDate",
    endDate: "#endDate",
    applyDateFilter: "#applyDateFilter",
    clearDateFilter: "#clearDateFilter",
    totalUsers: "#totalUsers",
    totalArticles: "#totalArticles",
    totalComments: "#totalComments",
    avgDailyLogins: "#avgDailyLogins",
    avgDailyArticles: "#avgDailyArticles",
    totalPeriodLogins: "#totalPeriodLogins",
    totalPeriodArticles: "#totalPeriodArticles",
    dailyStatsTableBody: "#dailyStatsTableBody",
    statCard: ".stat-card",
    card: ".card"
  };

  static init() {
    const currentUser = Utils.checkUserAccess(true);
    if (!currentUser) {
      return;
    }

    try {
      this.initializeManagers();
      this.setupEventListeners();
      this.initializeDateInputs();
      this.loadAllStatistics();

      setTimeout(() => {
        this.hidePageLoader();
      }, this.CONFIG.PAGE_LOADER_DELAY);
    } catch (error) {
      this.showError("Failed to initialize dashboard: " + error.message);
    }
  }

  static initializeManagers() {
    AdminDataManager.init();
    AdminChartManager.init();
    AdminReportManager.init();
    AdminUserManager.init();
  }

  static setupEventListeners() {
    $(this.SELECTORS.applyDateFilter).on("click", () => this.applyDateFilter());
    $(this.SELECTORS.clearDateFilter).on("click", () => this.clearDateFilter());

    $(`${this.SELECTORS.startDate}, ${this.SELECTORS.endDate}`).on("keypress", (e) => {
      if (e.which === 13) this.applyDateFilter();
    });
  }

  static initializeDateInputs() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - this.CONFIG.DEFAULT_DATE_RANGE_DAYS);

    $(this.SELECTORS.endDate).val(AdminDataManager.formatDateForInput(endDate));
    $(this.SELECTORS.startDate).val(AdminDataManager.formatDateForInput(startDate));
  }

  static hidePageLoader() {
    const $loader = $(this.SELECTORS.pageLoader);
    const $mainContent = $(this.SELECTORS.mainContent);

    if ($loader.length && $mainContent.length) {
      $loader.addClass("fade-out");
      $mainContent.show();

      setTimeout(() => {
        $loader.remove();
      }, this.CONFIG.LOADER_FADE_DURATION);
    }
  }

  static showLoading() {
    $(this.SELECTORS.loadingIndicator).show();
    $(this.SELECTORS.errorMessage).hide();
    $(this.SELECTORS.statCard).addClass("loading");
  }

  static hideLoading() {
    $(this.SELECTORS.loadingIndicator).hide();
    $(this.SELECTORS.statCard).removeClass("loading");
  }

  static showError(message) {
    $(this.SELECTORS.errorText).text(message);
    $(this.SELECTORS.errorMessage).show();
    this.hideLoading();
  }

  static loadAllStatistics() {
    this.showLoading();

    AdminDataManager.loadAllStatistics()
      .then(() => {
        this.hideLoading();
        this.updateUI();
        this.animateCards();
      })
      .catch((error) => {
        this.showError("Failed to load statistics. Please check your connection and try again.");
      });
  }

  static updateUI() {
    const statistics = AdminDataManager.getProcessedStatistics();

    this.updateGeneralStatisticsCards(statistics.general);
    AdminChartManager.renderAllCharts(statistics);
    this.updateSummaryMetrics();
    this.populateDataTable();
  }

  static updateGeneralStatisticsCards(data) {
    if (!data) return;

    const totalUsers = data.totalUsers || 0;
    const totalArticles = data.totalArticles || 0;
    const totalComments = data.totalComments || 0;

    this.animateNumber(this.SELECTORS.totalUsers, totalUsers);
    this.animateNumber(this.SELECTORS.totalArticles, totalArticles);
    this.animateNumber(this.SELECTORS.totalComments, totalComments);
  }

  static animateNumber(selector, finalValue) {
    const element = $(selector);
    const startValue = 0;
    const duration = this.CONFIG.NUMBER_ANIMATION_DURATION;
    const startTime = Date.now();

    const updateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

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
  }

  static updateSummaryMetrics() {
    const metrics = AdminDataManager.calculateSummaryMetrics();

    $(this.SELECTORS.avgDailyLogins).text(metrics.avgLogins.toLocaleString());
    $(this.SELECTORS.avgDailyArticles).text(metrics.avgArticles.toLocaleString());
    $(this.SELECTORS.totalPeriodLogins).text(metrics.totalLogins.toLocaleString());
    $(this.SELECTORS.totalPeriodArticles).text(metrics.totalArticles.toLocaleString());
  }

  static populateDataTable() {
    const tableBody = $(this.SELECTORS.dailyStatsTableBody);
    tableBody.empty();

    const tableData = AdminDataManager.getTableData();

    if (tableData.length === 0) {
      tableBody.append('<tr><td colspan="5" class="text-center text-muted">No data available</td></tr>');
      return;
    }

    tableData.forEach((row) => {
      const tableRow = `
        <tr class="fade-in">
          <td><strong>${row.date}</strong></td>
          <td><span>${row.logins.toLocaleString()}</span></td>
          <td><span>${row.pulls.toLocaleString()}</span></td>
          <td><span>${row.inserts.toLocaleString()}</span></td>
          <td><span>${row.total.toLocaleString()}</span></td>
        </tr>
      `;
      tableBody.append(tableRow);
    });
  }

  static applyDateFilter() {
    const startDate = $(this.SELECTORS.startDate).val();
    const endDate = $(this.SELECTORS.endDate).val();

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.showError("Start date cannot be after end date.");
      return;
    }

    AdminDataManager.setDateRange(startDate, endDate);
    this.loadAllStatistics();
  }

  static clearDateFilter() {
    $(this.SELECTORS.startDate).val("");
    $(this.SELECTORS.endDate).val("");
    AdminDataManager.setDateRange(null, null);
    this.loadAllStatistics();
  }

  static animateCards() {
    $(`${this.SELECTORS.statCard}, ${this.SELECTORS.card}`).each((index, element) => {
      setTimeout(() => {
        $(element).addClass("slide-up");
      }, index * this.CONFIG.ANIMATION_DELAY);
    });
  }
}

$(document).ready(() => {
  if (typeof getGeneralStatistics === "undefined") {
    UIManager.showPopup("API functions not fully loaded.", false);
  }

  AdminDashboard.init();
});

window.AdminDashboard = AdminDashboard;
