class AdminUserManager {
  static init() {
    this.setupEventHandlers();
  }

  static setupEventHandlers() {
    $("#userSearchForm").on("submit", (e) => {
      e.preventDefault();
      this.handleUserSearch();
    });
    $(document).on("click", ".toggle-ban-btn", (e) => this.handleToggleBan(e));
    $(document).on("click", ".toggle-admin-btn", (e) => this.handleToggleAdmin(e));
  }

  static handleUserSearch() {
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
  }

  static displayUsers(users) {
    const resultsContainer = $("#userSearchResults");
    resultsContainer.empty();

    if (!users || users.length === 0) {
      resultsContainer.html('<p class="text-center">No users found.</p>');
      return;
    }

    const currentUser = Utils.getCurrentUser();
    const currentUserId = currentUser ? currentUser.id : null;

    const filteredUsers = users.filter((user) => user.id !== currentUserId);

    if (filteredUsers.length === 0) {
      resultsContainer.html('<p class="text-center">No other users found.</p>');
      return;
    }

    filteredUsers.forEach((user) => {
      const banStatus = user.isLocked ? "Unban" : "Ban";
      const banClass = user.isLocked ? "btn-success" : "btn-danger";

      const adminStatus = user.isAdmin ? "Remove Admin" : "Make Admin";
      const adminClass = user.isAdmin ? "btn-warning" : "btn-primary";

      const userHtml = `
        <div class="user-list-item d-flex justify-content-between align-items-center">
          <div class="user-list-info d-flex align-items-center">
            <img src="${user.imageUrl || CONSTANTS.NO_IMAGE_URL}" alt="${user.fullName}" class="user-list-avatar-sm" />
            <span class="user-list-name fw-bold">${user.fullName}</span>
            <small class="text-muted">(${user.email})</small>
            ${user.isLocked ? '<span class="badge bg-danger ms-2">Banned</span>' : ""}
            ${user.isAdmin ? '<span class="badge bg-primary ms-2">Admin</span>' : ""}
          </div>
          <div class="user-actions d-flex gap-2">
            <button class="btn btn-sm toggle-admin-btn ${adminClass}" data-user-id="${user.id}" data-user-name="${user.fullName}">
              ${adminStatus}
            </button>
            <button class="btn btn-sm toggle-ban-btn ${banClass}" data-user-id="${user.id}" data-user-name="${user.fullName}">
              ${banStatus}
            </button>
          </div>
        </div>
      `;
      resultsContainer.append(userHtml);
    });
  }

  static handleToggleBan(e) {
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
          UIManager.showPopup(`User has been ${isBanning ? "banned" : "unbanned"}.`, true);
          this.handleUserSearch();
        },
        () => {
          UIManager.showPopup("Failed to update user status.", false);
        }
      );
    });
  }

  static handleToggleAdmin(e) {
    const button = $(e.currentTarget);
    const userId = button.data("user-id");
    const userName = button.data("user-name");
    const isPromoting = button.text().trim() === "Make Admin";

    UIManager.showDialog(`Are you sure you want to ${isPromoting ? "make" : "remove"} ${userName} ${isPromoting ? "an admin" : "from admin"}?`).then((confirmed) => {
      if (!confirmed) return;

      toggleUserStatus(
        userId,
        "IsAdmin",
        () => {
          UIManager.showPopup(`User has been ${isPromoting ? "promoted to admin" : "removed from admin"}.`, true);
          this.handleUserSearch();
        },
        () => {
          UIManager.showPopup("Failed to update admin status.", false);
        }
      );
    });
  }
}

window.AdminUserManager = AdminUserManager;
