const AdminReportManager = {
  init() {
    this.loadPendingReports();
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $(document).on("click", ".update-report-status-btn", (e) => {
      e.stopPropagation();
      this.handleUpdateReportStatus(e);
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
      const itemLink = itemText;
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

      let viewItemButton = "";
      if (report.reportedArticleId) {
        const viewItemUrl = `../html/article.html?id=${report.reportedArticleId}${isCommentReport ? "#comments-list" : ""}`;
        viewItemButton = `<a href="${viewItemUrl}" target="_blank" class="btn btn-sm btn-outline-secondary ms-2">View Item</a>`;
      }

      const detailsRow = `
        <tr class="report-details-row collapse" id="details-${report.id}">
          <td colspan="6">
            <div class="report-details-content">
              <strong>Full Report:</strong>
              <p class="report-details-text">${report.details || "No details provided."}</p>
              
              <div class="mb-3">
                <label for="notes-${report.id}" class="form-label"><strong>Resolution Notes:</strong></label>
                <textarea id="notes-${report.id}" class="form-control" rows="2" placeholder="Optional notes for this status update..."></textarea>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div class="flex-grow-1">
                  <select id="status-select-${report.id}" class="form-select">
                    <option value="1">Reviewed</option>
                    <option value="2">Action Taken</option>
                    <option value="3">Dismissed</option>
                  </select>
                </div>
                <button class="btn btn-sm btn-primary update-report-status-btn" data-report-id="${report.id}">Update Status</button>
                ${viewItemButton}
              </div>
            </div>
          </td>
        </tr>
      `;

      tableBody.append(summaryRow);
      tableBody.append(detailsRow);
    });
  },

  handleUpdateReportStatus(e) {
    const reportId = $(e.currentTarget).data("report-id");
    const adminNotes = $(`#notes-${reportId}`).val();
    const statusSelect = $(`#status-select-${reportId}`);
    const newStatusValue = statusSelect.val();
    const newStatusText = statusSelect.find("option:selected").text();

    UIManager.showDialog(`Are you sure you want to mark this report as '${newStatusText}'?`).then((confirmed) => {
      if (!confirmed) return;

      updateReportStatus(
        reportId,
        newStatusValue,
        adminNotes,
        () => {
          UIManager.showPopup("Report status updated successfully.", true);
          this.loadPendingReports();
        },
        () => {
          UIManager.showPopup("Failed to update report status.", false);
        }
      );
    });
  }
};

window.AdminReportManager = AdminReportManager;
