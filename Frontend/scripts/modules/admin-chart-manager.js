class AdminChartManager {
  static charts = {};

  static COLORS = {
    PRIMARY: "#ffcc00",
    PRIMARY_ALPHA: "rgba(255, 204, 0, 0.1)",
    PRIMARY_SOLID: "rgba(255, 204, 0, 0.8)",

    SUCCESS: "#ff7300",
    SUCCESS_ALPHA: "rgba(40, 167, 69, 0.1)",
    SUCCESS_SOLID: "rgba(255, 115, 0, 0.8)",

    WARNING: "#ffc107",
    WARNING_ALPHA: "rgba(255, 193, 7, 0.1)",
    WARNING_SOLID: "rgba(255, 193, 7, 0.8)",

    // UI Colors
    BACKGROUND_DARK: "rgba(0, 0, 0, 0.9)",
    TEXT_PRIMARY: "#000000",
    TEXT_SECONDARY: "#666666",
    GRID_COLOR: "#eeeeee",
    WHITE: "#ffffff"
  };

  static init() {
    if (typeof Chart !== "undefined") {
      Chart.defaults.font.family = "GeographWeb, sans-serif";
    }
  }

  static destroyAllCharts() {
    Object.values(this.charts).forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  static renderAllCharts(statistics) {
    this.renderDailyStatsChart(statistics);
    this.renderDailyLoginsChart(statistics);
    this.renderDailyArticlePullsChart(statistics);
    this.renderDailyArticleInsertsChart(statistics);
  }

  /**
   * Render combined daily statistics line chart
   * Mathematical visualization: Multi-variate time series analysis
   * @param {Object} statistics - Statistics data object
   */
  static renderDailyStatsChart(statistics) {
    const ctx = $("#dailyStatsChart")[0];
    if (!ctx) return;

    if (this.charts.dailyStats) {
      this.charts.dailyStats.destroy();
    }

    const chartData = this.prepareMultiLineChartData(statistics);

    this.charts.dailyStats = new Chart(ctx.getContext("2d"), {
      type: "line",
      data: chartData,
      options: this.getLineChartOptions("Date", "Count")
    });
  }

  /**
   * Prepare data for multi-line chart
   * @param {Object} statistics - Statistics data object
   * @returns {Object} Chart.js data configuration
   */
  static prepareMultiLineChartData(statistics) {
    const labels = AdminDataManager.extractLabelsFromData(statistics.daily);
    const loginsData = AdminDataManager.extractDataFromStatistics(statistics.dailyLogins, "count");
    const pullsData = AdminDataManager.extractDataFromStatistics(statistics.dailyArticlePulls, "count");
    const insertsData = AdminDataManager.extractDataFromStatistics(statistics.dailyArticleInserts, "count");

    return {
      labels: labels,
      datasets: [
        this.createLineDataset("Daily Logins", loginsData, this.COLORS.PRIMARY),
        this.createLineDataset("Article Pulls", pullsData, this.COLORS.SUCCESS),
        this.createLineDataset("Article Inserts", insertsData, this.COLORS.WARNING)
      ]
    };
  }

  /**
   * Create line chart dataset configuration
   * @param {string} label - Dataset label
   * @param {Array} data - Data points
   * @param {string} color - Primary color
   * @returns {Object} Dataset configuration
   */
  static createLineDataset(label, data, color) {
    return {
      label: label,
      data: data,
      borderColor: color,
      backgroundColor: color.replace("1)", "0.1)"), // Convert to alpha
      tension: 0.4,
      fill: false,
      pointBackgroundColor: color,
      pointBorderColor: this.COLORS.TEXT_PRIMARY,
      pointBorderWidth: 2
    };
  }

  /**
   * Render daily logins bar chart
   * @param {Object} statistics - Statistics data object
   */
  static renderDailyLoginsChart(statistics) {
    const ctx = $("#dailyLoginsChart")[0];
    if (!ctx) return;

    if (this.charts.dailyLogins) {
      this.charts.dailyLogins.destroy();
    }

    const chartData = this.prepareSingleBarChartData(statistics.dailyLogins, "Daily Logins", this.COLORS.PRIMARY_SOLID, this.COLORS.PRIMARY);

    this.charts.dailyLogins = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: chartData,
      options: this.getBarChartOptions("Number of Logins")
    });
  }

  /**
   * Render daily article pulls bar chart
   * @param {Object} statistics - Statistics data object
   */
  static renderDailyArticlePullsChart(statistics) {
    const ctx = $("#dailyArticlePullsChart")[0];
    if (!ctx) return;

    if (this.charts.dailyArticlePulls) {
      this.charts.dailyArticlePulls.destroy();
    }

    const chartData = this.prepareSingleBarChartData(statistics.dailyArticlePulls, "Daily Article Pulls", this.COLORS.SUCCESS_SOLID, this.COLORS.SUCCESS);

    this.charts.dailyArticlePulls = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: chartData,
      options: this.getBarChartOptions("Number of Pulls")
    });
  }

  /**
   * Render daily article inserts bar chart
   * @param {Object} statistics - Statistics data object
   */
  static renderDailyArticleInsertsChart(statistics) {
    const ctx = $("#dailyArticleInsertsChart")[0];
    if (!ctx) return;

    if (this.charts.dailyArticleInserts) {
      this.charts.dailyArticleInserts.destroy();
    }

    const chartData = this.prepareSingleBarChartData(statistics.dailyArticleInserts, "Daily Article Inserts", this.COLORS.WARNING_SOLID, this.COLORS.WARNING);

    this.charts.dailyArticleInserts = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: chartData,
      options: this.getBarChartOptions("Number of Inserts")
    });
  }

  /**
   * Prepare data for single bar chart
   * @param {Array} statisticsData - Raw statistics data
   * @param {string} label - Dataset label
   * @param {string} backgroundColor - Bar background color
   * @param {string} borderColor - Bar border color
   * @returns {Object} Chart.js data configuration
   */
  static prepareSingleBarChartData(statisticsData, label, backgroundColor, borderColor) {
    const labels = AdminDataManager.extractLabelsFromData(statisticsData);
    const data = AdminDataManager.extractDataFromStatistics(statisticsData, "count");

    return {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 2,
          borderRadius: 0
        }
      ]
    };
  }

  /**
   * Get line chart configuration options
   * @param {string} xAxisLabel - X-axis label
   * @param {string} yAxisLabel - Y-axis label
   * @returns {Object} Chart.js options configuration
   */
  static getLineChartOptions(xAxisLabel, yAxisLabel) {
    return {
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
            color: this.COLORS.TEXT_PRIMARY
          }
        },
        tooltip: this.getTooltipConfig()
      },
      scales: {
        x: this.getXAxisConfig(xAxisLabel),
        y: this.getYAxisConfig(yAxisLabel)
      }
    };
  }

  /**
   * Get bar chart configuration options
   * @param {string} yAxisLabel - Y-axis label
   * @returns {Object} Chart.js options configuration
   */
  static getBarChartOptions(yAxisLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: this.getYAxisConfig(yAxisLabel),
        x: this.getXAxisConfig()
      }
    };
  }

  /**
   * Get tooltip configuration for charts
   * @returns {Object} Tooltip configuration
   */
  static getTooltipConfig() {
    return {
      backgroundColor: this.COLORS.BACKGROUND_DARK,
      titleColor: this.COLORS.PRIMARY,
      bodyColor: this.COLORS.WHITE,
      borderColor: this.COLORS.PRIMARY,
      borderWidth: 2,
      titleFont: {
        family: "GeographWeb, sans-serif",
        weight: "600"
      },
      bodyFont: {
        family: "GeographWeb, sans-serif"
      }
    };
  }

  /**
   * Get X-axis configuration
   * @param {string} label - Axis label (optional)
   * @returns {Object} X-axis configuration
   */
  static getXAxisConfig(label = null) {
    const config = {
      ticks: {
        font: {
          family: "GeographWeb, sans-serif"
        },
        color: this.COLORS.TEXT_SECONDARY
      },
      grid: {
        color: this.COLORS.GRID_COLOR
      }
    };

    if (label) {
      config.display = true;
      config.title = {
        display: true,
        text: label,
        font: {
          family: "GeographWeb, sans-serif",
          weight: "600"
        },
        color: this.COLORS.TEXT_PRIMARY
      };
    }

    return config;
  }

  /**
   * Get Y-axis configuration
   * @param {string} label - Axis label
   * @returns {Object} Y-axis configuration
   */
  static getYAxisConfig(label) {
    return {
      display: true,
      beginAtZero: true,
      title: {
        display: true,
        text: label,
        font: {
          family: "GeographWeb, sans-serif",
          weight: "600"
        },
        color: this.COLORS.TEXT_PRIMARY
      },
      ticks: {
        font: {
          family: "GeographWeb, sans-serif"
        },
        color: this.COLORS.TEXT_SECONDARY
      },
      grid: {
        color: this.COLORS.GRID_COLOR
      }
    };
  }
}

window.AdminChartManager = AdminChartManager;
