const AdminChartManager = {
  charts: {},

  COLORS: {
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
  },

  init() {
    if (typeof Chart !== "undefined") {
      Chart.defaults.font.family = "GeographWeb, sans-serif";
    }
  },

  destroyAllCharts() {
    Object.values(this.charts).forEach((chart) => {
      if (chart && typeof chart.destroy === "function") {
        chart.destroy();
      }
    });
    this.charts = {};
  },

  renderAllCharts(statistics) {
    this.renderDailyStatsChart(statistics);
    this.renderDailyLoginsChart(statistics);
    this.renderDailyArticlePullsChart(statistics);
    this.renderDailyArticleInsertsChart(statistics);
  },

  renderDailyStatsChart(statistics) {
    const ctx = $("#dailyStatsChart")[0];
    if (!ctx) {
      return;
    }

    if (this.charts.dailyStats) {
      this.charts.dailyStats.destroy();
    }

    const labels = AdminDataManager.extractLabelsFromData(statistics.daily);
    const loginsData = AdminDataManager.extractDataFromStatistics(statistics.dailyLogins, "count");
    const pullsData = AdminDataManager.extractDataFromStatistics(statistics.dailyArticlePulls, "count");
    const insertsData = AdminDataManager.extractDataFromStatistics(statistics.dailyArticleInserts, "count");

    this.charts.dailyStats = new Chart(ctx.getContext("2d"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Logins",
            data: loginsData,
            borderColor: this.COLORS.PRIMARY,
            backgroundColor: this.COLORS.PRIMARY_ALPHA,
            tension: 0.4,
            fill: false,
            pointBackgroundColor: this.COLORS.PRIMARY,
            pointBorderColor: this.COLORS.TEXT_PRIMARY,
            pointBorderWidth: 2
          },
          {
            label: "Article Pulls",
            data: pullsData,
            borderColor: this.COLORS.SUCCESS,
            backgroundColor: this.COLORS.SUCCESS_ALPHA,
            tension: 0.4,
            fill: false,
            pointBackgroundColor: this.COLORS.SUCCESS,
            pointBorderColor: this.COLORS.TEXT_PRIMARY,
            pointBorderWidth: 2
          },
          {
            label: "Article Inserts",
            data: insertsData,
            borderColor: this.COLORS.WARNING,
            backgroundColor: this.COLORS.WARNING_ALPHA,
            tension: 0.4,
            fill: false,
            pointBackgroundColor: this.COLORS.WARNING,
            pointBorderColor: this.COLORS.TEXT_PRIMARY,
            pointBorderWidth: 2
          }
        ]
      },
      options: this.getLineChartOptions("Date", "Count")
    });
  },

  renderDailyLoginsChart(statistics) {
    const ctx = $("#dailyLoginsChart")[0];
    if (!ctx) {
      return;
    }

    if (this.charts.dailyLogins) {
      this.charts.dailyLogins.destroy();
    }

    const labels = AdminDataManager.extractLabelsFromData(statistics.dailyLogins);
    const data = AdminDataManager.extractDataFromStatistics(statistics.dailyLogins, "count");

    this.charts.dailyLogins = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Logins",
            data: data,
            backgroundColor: this.COLORS.PRIMARY_SOLID,
            borderColor: this.COLORS.PRIMARY,
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: this.getBarChartOptions("Number of Logins")
    });
  },

  renderDailyArticlePullsChart(statistics) {
    const ctx = $("#dailyArticlePullsChart")[0];
    if (!ctx) {
      return;
    }

    if (this.charts.dailyArticlePulls) {
      this.charts.dailyArticlePulls.destroy();
    }

    const labels = AdminDataManager.extractLabelsFromData(statistics.dailyArticlePulls);
    const data = AdminDataManager.extractDataFromStatistics(statistics.dailyArticlePulls, "count");

    this.charts.dailyArticlePulls = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Article Pulls",
            data: data,
            backgroundColor: this.COLORS.SUCCESS_SOLID,
            borderColor: this.COLORS.SUCCESS,
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: this.getBarChartOptions("Number of Pulls")
    });
  },

  renderDailyArticleInsertsChart(statistics) {
    const ctx = $("#dailyArticleInsertsChart")[0];
    if (!ctx) {
      return;
    }

    if (this.charts.dailyArticleInserts) {
      this.charts.dailyArticleInserts.destroy();
    }

    const labels = AdminDataManager.extractLabelsFromData(statistics.dailyArticleInserts);
    const data = AdminDataManager.extractDataFromStatistics(statistics.dailyArticleInserts, "count");

    this.charts.dailyArticleInserts = new Chart(ctx.getContext("2d"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Article Inserts",
            data: data,
            backgroundColor: this.COLORS.WARNING_SOLID,
            borderColor: this.COLORS.WARNING,
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: this.getBarChartOptions("Number of Inserts")
    });
  },

  getLineChartOptions(xAxisLabel, yAxisLabel) {
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
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          titleColor: this.COLORS.PRIMARY,
          bodyColor: "#ffffff",
          borderColor: this.COLORS.PRIMARY,
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
            text: xAxisLabel,
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
        },
        y: {
          display: true,
          title: {
            display: true,
            text: yAxisLabel,
            font: {
              family: "GeographWeb, sans-serif",
              weight: "600"
            },
            color: this.COLORS.TEXT_PRIMARY
          },
          beginAtZero: true,
          ticks: {
            font: {
              family: "GeographWeb, sans-serif"
            },
            color: this.COLORS.TEXT_SECONDARY
          },
          grid: {
            color: this.COLORS.GRID_COLOR
          }
        }
      }
    };
  },

  getBarChartOptions(yAxisLabel) {
    return {
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
            text: yAxisLabel,
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
        },
        x: {
          ticks: {
            font: {
              family: "GeographWeb, sans-serif"
            },
            color: this.COLORS.TEXT_SECONDARY
          },
          grid: {
            color: this.COLORS.GRID_COLOR
          }
        }
      }
    };
  }
};

window.AdminChartManager = AdminChartManager;
