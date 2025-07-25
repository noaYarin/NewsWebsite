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

    $(document).on("click", ".report-item-link", (e) => {
      e.stopPropagation();
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
      tableBody.html('<tr><td colspan="6" class="text-center">No pending reports.</td></tr>');
      return;
    }

    reports.forEach((report) => {
      const isCommentReport = report.reportedCommentId;
      const itemText = isCommentReport ? `Comment #${report.reportedCommentId}` : `Article #${report.reportedArticleId}`;

      const itemLink = report.reportedArticleId
        ? `<a href="../html/article.html?id=${report.reportedArticleId}${isCommentReport ? "#comments-list" : ""}" target="_blank" class="report-item-link">${itemText}</a>`
        : itemText;

      const reportDate = report.createdAt ? new Date(report.createdAt).toLocaleDateString("en-GB") : "N/A";

      const summaryRow = `
        <tr class="report-summary-row" data-bs-toggle="collapse" data-bs-target="#details-${report.id}" title="Click to view details">
          <td>${report.id}</td>
          <td>${itemLink}</td>
          <td>${report.reason}</td>
          <td><span class="badge bg-warning text-dark">${report.status}</span></td>
          <td>${reportDate}</td>
          <td>
            <i class="fas fa-chevron-down expand-icon"></i>
          </td>
        </tr>
      `;

      const detailsRow = `
        <tr class="report-details-row collapse" id="details-${report.id}">
            <td colspan="6">
            <div class="report-details-content">
                <strong>Full Report:</strong>
                <p class="report-details-text">${report.details || "No details provided."}</p>
                <button class="btn btn-sm btn-success resolve-report-btn" data-report-id="${report.id}">Resolve Report</button>
            </div>
            </td>
        </tr>
        `;

      tableBody.append(summaryRow);
      tableBody.append(detailsRow);
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
