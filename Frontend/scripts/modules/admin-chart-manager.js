const AdminChartManager = {
  charts: {},

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
    const ctx = document.getElementById("dailyStatsChart");
    if (!ctx) {
      console.warn("Daily stats chart canvas not found");
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
      options: this.getLineChartOptions("Date", "Count")
    });
  },

  renderDailyLoginsChart(statistics) {
    const ctx = document.getElementById("dailyLoginsChart");
    if (!ctx) {
      console.warn("Daily logins chart canvas not found");
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
            backgroundColor: "rgba(255, 204, 0, 0.8)",
            borderColor: "#ffcc00",
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: this.getBarChartOptions("Number of Logins")
    });
  },

  renderDailyArticlePullsChart(statistics) {
    const ctx = document.getElementById("dailyArticlePullsChart");
    if (!ctx) {
      console.warn("Daily article pulls chart canvas not found");
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
            backgroundColor: "rgba(40, 167, 69, 0.8)",
            borderColor: "#28a745",
            borderWidth: 2,
            borderRadius: 0
          }
        ]
      },
      options: this.getBarChartOptions("Number of Pulls")
    });
  },

  renderDailyArticleInsertsChart(statistics) {
    const ctx = document.getElementById("dailyArticleInsertsChart");
    if (!ctx) {
      console.warn("Daily article inserts chart canvas not found");
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
            backgroundColor: "rgba(255, 193, 7, 0.8)",
            borderColor: "#ffc107",
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
            text: xAxisLabel,
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
            text: yAxisLabel,
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
    };
  }
};

window.AdminChartManager = AdminChartManager;
