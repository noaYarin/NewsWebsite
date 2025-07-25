const AdminUserManager = {
  init() {
    this.setupEventHandlers();
  },

  setupEventHandlers() {
    $("#userSearchForm").on("submit", (e) => {
      e.preventDefault();
      this.handleUserSearch();
    });
    $(document).on("click", ".toggle-ban-btn", (e) => this.handleToggleBan(e));
  },

  handleUserSearch() {
    const searchTerm = $("#userSearchInput").val().trim();
    if (!searchTerm) return;

    const resultsContainer = $("#userSearchResults");
    resultsContainer.html('<p class="text-center">Searching...</p>');

    searchUsers(
      searchTerm,
      (users) => {
        this.displayUsers(users);
      },
      () => {
        resultsContainer.html('<p class="text-center text-danger">Failed to search for users.</p>');
      }
    );
  },

  displayUsers(users) {
    const resultsContainer = $("#userSearchResults");
    resultsContainer.empty();

    if (!users || users.length === 0) {
      resultsContainer.html('<p class="text-center">No users found.</p>');
      return;
    }

    users.forEach((user) => {
      const banStatus = user.isLocked ? "Unban" : "Ban";
      const banClass = user.isLocked ? "btn-success" : "btn-danger";
      const userHtml = `
        <div class="user-list-item d-flex justify-content-between align-items-center">
          <div class="user-list-info d-flex align-items-center">
            <img src="${user.imageUrl || CONSTANTS.NO_IMAGE_URL}" alt="${user.fullName}" class="user-list-avatar-sm" />
            <span class="user-list-name fw-bold">${user.fullName}</span>
            <small class="text-muted">(${user.email})</small>
            ${user.isLocked ? '<span class="badge bg-danger ms-2">Banned</span>' : ""}
          </div>
          <button class="btn btn-sm toggle-ban-btn ${banClass}" data-user-id="${user.id}" data-user-name="${user.fullName}">
            ${banStatus}
          </button>
        </div>
      `;
      resultsContainer.append(userHtml);
    });
  },

  handleToggleBan(e) {
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    const isBanning = button.text().trim() === "Ban";

    UIManager.showDialog(`Are you sure you want to ${isBanning ? "ban" : "unban"} ${userName}?`).then((confirmed) => {
      if (!confirmed) return;

      toggleUserStatus(
        userId,
        "IsLocked",
        () => {
          UIManager.showPopup(`User has been ${isBanned ? "banned" : "unbanned"}.`, true);
          this.handleUserSearch();
        },
        () => {
          UIManager.showPopup("Failed to update user status.", false);
        }
      );
    });
  }
};

window.AdminUserManager = AdminUserManager;
