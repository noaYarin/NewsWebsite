const AdminReportManager = {
  init() {
    this.loadPendingReports();
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document).on("click", ".resolve-report-btn", (e) => this.handleResolveReport(e));
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
      const reportedItemLink = report.articleId
        ? `<a href="../html/article.html?id=${report.articleId}" target="_blank">Article #${report.articleId}</a>`
        : `Comment #${report.commentId}`;

      const row = `
        <tr>
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
