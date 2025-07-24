const AdminDashboard = {
  init() {
    try {
      AdminDataManager.init();
      AdminChartManager.init();

      this.setupEventListeners();
      this.initializeDateInputs();
      this.loadAllStatistics();

      setTimeout(() => {
        this.hidePageLoader();
      }, 1000);
    } catch (error) {
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

    $("#startDate, #endDate").on("keypress", (e) => {
      if (e.which === 13) this.applyDateFilter();
    });
  },

  initializeDateInputs() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    $("#endDate").val(AdminDataManager.formatDateForInput(endDate));
    $("#startDate").val(AdminDataManager.formatDateForInput(startDate));
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

    AdminDataManager.loadAllStatistics()
      .then(() => {
        this.hideLoading();
        this.updateUI();
        this.animateCards();
      })
      .catch((error) => {
        this.showError("Failed to load statistics. Please check your connection and try again.");
      });
  },

  updateUI() {
    const statistics = AdminDataManager.getProcessedStatistics();

    this.updateGeneralStatisticsCards(statistics.general);
    AdminChartManager.renderAllCharts(statistics);
    this.updateSummaryMetrics();
    this.populateDataTable();
  },

  updateGeneralStatisticsCards(data) {
    if (!data) return;

    const totalUsers = data.totalUsers || data.TotalUsers || 0;
    const totalArticles = data.totalArticles || data.TotalArticles || 0;
    const totalComments = data.totalComments || data.TotalComments || 0;

    this.animateNumber("#totalUsers", totalUsers);
    this.animateNumber("#totalArticles", totalArticles);
    this.animateNumber("#totalComments", totalComments);
  },

  animateNumber(selector, finalValue) {
    const element = $(selector);
    const startValue = 0;
    const duration = 2000;
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
  },

  updateSummaryMetrics() {
    const metrics = AdminDataManager.calculateSummaryMetrics();

    $("#avgDailyLogins").text(metrics.avgLogins.toLocaleString());
    $("#avgDailyArticles").text(metrics.avgArticles.toLocaleString());
    $("#totalPeriodLogins").text(metrics.totalLogins.toLocaleString());
    $("#totalPeriodArticles").text(metrics.totalArticles.toLocaleString());
  },

  populateDataTable() {
    const tableBody = $("#dailyStatsTableBody");
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
  },

  applyDateFilter() {
    const startDate = $("#startDate").val();
    const endDate = $("#endDate").val();

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      this.showError("Start date cannot be after end date.");
      return;
    }

    AdminDataManager.setDateRange(startDate, endDate);
    this.loadAllStatistics();
  },

  clearDateFilter() {
    $("#startDate").val("");
    $("#endDate").val("");
    AdminDataManager.setDateRange(null, null);
    this.loadAllStatistics();
  },

  animateCards() {
    $(".stat-card, .card").each((index, element) => {
      setTimeout(() => {
        $(element).addClass("slide-up");
      }, index * 100);
    });
  }
};

$(document).ready(() => {
  if (typeof getGeneralStatistics === "undefined") {
    UIManager.showPopup("API functions not fully loaded.", false);
  }

  AdminDashboard.init();
});
