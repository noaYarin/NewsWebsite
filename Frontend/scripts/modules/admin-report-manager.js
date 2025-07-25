const AdminReportManager = {
  init() {
    this.loadPendingReports();
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document).on("click", ".resolve-report-btn", (e) => {
      e.stopPropagation();
      this.handleResolveReport(e);
    });

    $(document).on("click", ".report-row-clickable", (e) => {
      const $row = $(e.currentTarget);
      const isCommentReport = $row.data("is-comment-report");

      if (articleId) {
        console.log(`Navigating to article ${articleId}, isCommentReport: ${isCommentReport}`);
        let url = `../html/article.html?id=${articleId}`;
        if (isCommentReport) {
          url += "#comments-list";
        }
        window.open(url, "_blank");
      }
    });
  },

  loadPendingReports() {
    const tableBody = $("#reportsTableBody");
    tableBody.html('<tr><td colspan="7" class="text-center">Loading reports...</td></tr>');

    getPendingReports(
      (reports) => {
        this.displayReports(reports);
      },
      () => {
        tableBody.html('<tr><td colspan="7" class="text-center text-danger">Failed to load reports.</td></tr>');
      }
    );
  },

  displayReports(reports) {
    const tableBody = $("#reportsTableBody");
    tableBody.empty();

    if (!reports || reports.length === 0) {
      tableBody.html('<tr><td colspan="7" class="text-center">No pending reports.</td></tr>');
      return;
    }

    reports.forEach((report) => {
      const isCommentReport = !!report.reportedCommentId;
      const reportedItemLink = report.reportedArticleId ? `Article #${report.reportedArticleId}` : `Comment #${report.reportedCommentId}`;

      const row = `
        <tr class="report-row-clickable"
            data-article-id="${report.reportedArticleId || ""}"
            data-is-comment-report="${isCommentReport}"
            title="Click to view article">
          <td>${report.id}</td>
          <td>${report.reportType}</td>
          <td>${reportedItemLink}</td>
          <td>${report.reason}</td>
          <td><span class="badge bg-warning text-dark">${report.status}</span></td>
          <td>${new Date(report.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-success resolve-report-btn" data-report-id="${report.id}">Resolve</button>
          </td>
        </tr>
      `;
      tableBody.append(row);
    });
  },

  handleResolveReport(e) {
    const reportId = $(e.currentTarget).data("report-id");
    const adminNotes = prompt("Enter resolution notes (optional):");

    UIManager.showDialog("Mark this report as resolved?").then((confirmed) => {
      if (!confirmed) return;

      updateReportStatus(
        reportId,
        "Resolved",
        adminNotes,
        () => {
          UIManager.showPopup("Report resolved successfully.", true);
          this.loadPendingReports();
        },
        () => {
          UIManager.showPopup("Failed to resolve report.", false);
        }
      );
    });
  }
};

window.AdminReportManager = AdminReportManager;
