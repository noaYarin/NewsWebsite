const NotificationsPage = {
  currentUser: null,
  currentPage: 1,
  pageSize: 10,
  activeTab: "all",
  isLoading: false,

  init() {
    this.currentUser = Utils.getCurrentUser();
    if (!this.currentUser) {
      window.location.href = "auth.html";
      return;
    }

    this.setupEventListeners();
    this.loadNotifications();
    this.loadUnreadCount();
  },

  setupEventListeners() {
    // Tab switching
    $(document).on("click", "#notificationTabs .nav-link", (e) => {
      e.preventDefault();

      $("#notificationTabs .nav-link").removeClass("active");
      $(".tab-pane").removeClass("show active");

      $(e.target).addClass("active");

      const target = $(e.target).attr("data-bs-target");
      $(target).addClass("show active");

      this.activeTab = target.replace("#", "");
      this.currentPage = 1;
      this.loadNotifications();
    });

    // Action buttons
    $("#markAllReadBtn").on("click", () => this.markAllAsRead());
    $("#refreshBtn").on("click", () => this.refreshNotifications());
    $("#retryBtn").on("click", () => this.loadNotifications());

    // Mark as read buttons
    $(document).on("click", ".mark-read-btn", (e) => {
      e.stopPropagation();
      const notificationId = $(e.target).closest(".notification-item").attr("data-notification-id");
      if (notificationId) {
        this.markAsRead(notificationId);
      }
    });

    // Notification click handler
    $(document).on("click", ".notification-item", (e) => {
      if ($(e.target).closest(".mark-read-btn").length) return;

      const $item = $(e.currentTarget);
      const notificationId = $item.attr("data-notification-id");
      const $articleLink = $item.find(".notification-article-link");

      if ($articleLink.length && $articleLink.attr("href") !== "#") {
        this.markAsRead(notificationId);
      }
    });

    // Pagination click handler
    $(document).on("click", ".page-link", (e) => {
      e.preventDefault();
      const page = parseInt($(e.target).data("page"));
      const totalPages = $("#notificationsPagination").data("total-pages") || 1;

      if (page && page !== this.currentPage && page >= 1 && page <= totalPages) {
        this.currentPage = page;
        this.loadNotifications();
      }
    });
  },

  loadNotifications() {
    if (this.isLoading) return;

    this.setLoadingState(true);

    if (this.activeTab === "unread") {
      this.loadUnreadNotifications();
    } else {
      this.loadAllNotifications();
    }
  },

  loadAllNotifications() {
    getNotifications(
      this.currentUser.id,
      this.currentPage,
      this.pageSize,
      (data) => {
        const notifications = data.notifications || data || [];
        this.renderNotifications("#all .notifications-list", notifications);
        this.updatePagination(data.totalPages || 1);
        this.setLoadingState(false);
      },
      (error) => {
        console.error("Error loading notifications:", error);
        this.showError("Failed to load notifications. Please try again.");
        this.setLoadingState(false);
      }
    );
  },

  loadUnreadNotifications() {
    getRecentNotifications(
      this.currentUser.id,
      (data) => {
        const notifications = data.notifications || data || [];
        const unreadNotifications = notifications.filter((n) => !n.isRead);
        this.renderNotifications("#unread .notifications-list", unreadNotifications);
        this.updatePagination(1);
        this.setLoadingState(false);
      },
      (error) => {
        console.error("Error loading unread notifications:", error);
        this.showError("Failed to load notifications. Please try again.");
        this.setLoadingState(false);
      }
    );
  },

  loadUnreadCount() {
    getUnreadNotificationCount(
      this.currentUser.id,
      (count) => this.updateUnreadCount(count),
      (error) => {
        console.error("Error loading unread count:", error);
        this.updateUnreadCount(0);
      }
    );
  },

  renderNotifications(containerSelector, notifications) {
    const $container = $(containerSelector);
    $container.empty();

    if (!notifications || notifications.length === 0) {
      this.showEmptyState($container);
      return;
    }

    notifications.forEach((notification) => {
      const notificationHtml = this.createNotificationElement(notification);
      $container.append(notificationHtml);
    });
  },

  createNotificationElement(notification) {
    const $template = $("#notificationTemplate").contents().clone();
    let $item = $template.filter(".notification-item");

    if ($item.length === 0) {
      $item = $template.find(".notification-item");
    }

    $item.attr("data-notification-id", notification.id);

    if (!notification.isRead) {
      $item.addClass("unread");
    }

    // Populate notification data
    const avatarSrc = notification.senderAvatar || "../sources/images/no-image.png";
    $template.find(".notification-avatar-img").attr("src", avatarSrc);
    $template.find(".notification-sender").text(notification.senderName || "System");
    $template.find(".notification-type-badge").text(this.getTypeBadge(notification.notificationType));
    $template.find(".notification-time").text(this.formatTimeAgo(notification.createdAt));

    const message = notification.message || notification.content || notification.text || notification.description || "No message available";
    $template.find(".notification-message").text(message);

    // Handle article link
    if (notification.articleTitle) {
      $template.find(".notification-article").show();
      $template.find(".notification-article-link").attr("href", "article.html?id=" + (notification.articleId || "#"));
      $template.find(".notification-article-title").text(notification.articleTitle);
    }

    // Hide mark as read button for read notifications
    if (notification.isRead) {
      $template.find(".mark-read-btn").hide();
    }

    return $template;
  },

  getTypeBadge(type) {
    const types = {
      share: "Shared",
      comment: "Comment",
      like: "Like",
      friend_request: "Friend Request",
      system: "System"
    };
    return types[type] || "Notification";
  },

  formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 604800) return Math.floor(diff / 86400) + "d ago";

    return date.toLocaleDateString();
  },

  markAsRead(notificationId) {
    if (!notificationId) return;

    markNotificationAsRead(
      notificationId,
      this.currentUser.id,
      () => {
        const $item = $(`.notification-item[data-notification-id="${notificationId}"]`);
        $item.removeClass("unread");
        $item.find(".mark-read-btn").hide();
        this.loadUnreadCount();
      },
      (error) => {
        console.error("Error marking notification as read:", error);
        UIManager.showPopup("Failed to mark notification as read", false);
      }
    );
  },

  markAllAsRead() {
    if (this.isLoading) return;

    const unreadCount = $(".notification-item.unread").length;
    if (unreadCount === 0) {
      UIManager.showPopup("No unread notifications to mark", "muted");
      return;
    }

    markAllNotificationsAsRead(
      this.currentUser.id,
      () => {
        $(".notification-item.unread").removeClass("unread");
        $(".mark-read-btn").hide();
        this.updateUnreadCount(0);
        UIManager.showPopup("All notifications marked as read", true);
      },
      (error) => {
        console.error("Error marking all notifications as read:", error);
        UIManager.showPopup("Failed to mark all notifications as read", false);
      }
    );
  },

  refreshNotifications() {
    this.currentPage = 1;
    this.loadNotifications();
    this.loadUnreadCount();
    UIManager.showPopup("Notifications refreshed", true);
  },

  setLoadingState(loading) {
    this.isLoading = loading;
    if (loading) {
      $("#notificationsLoading")
        .html(
          `
        <div class="loader-container">
          <div class="spinner"></div>
        </div>
        <p class="mt-2">Loading notifications...</p>
      `
        )
        .show();
    } else {
      $("#notificationsLoading").hide();
    }
    $("#errorState").hide();
  },

  showError(message) {
    $("#errorMessage").text(message);
    $("#errorState").show();
  },

  showEmptyState($container) {
    $container.html(`
      <div class="empty-state text-center py-5">
        <h3 class="text-muted">No notifications</h3>
        <p class="text-muted">You're all caught up! Check back later for new notifications.</p>
      </div>
    `);
  },

  updateUnreadCount(count) {
    const $badge = $("#unreadCount");
    if (count > 0) {
      $badge.text(count).show();
    } else {
      $badge.hide();
    }
  },

  updatePagination(totalPages) {
    const $pagination = $("#notificationsPagination");
    $pagination.empty().data("total-pages", totalPages);

    if (totalPages <= 1) {
      $("#paginationContainer").hide();
      return;
    }

    $("#paginationContainer").show();

    let html = "";

    // Previous button
    html += `<li class="page-item ${this.currentPage <= 1 ? "disabled" : ""}">
               <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
             </li>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${i === this.currentPage ? "active" : ""}">
                 <a class="page-link" href="#" data-page="${i}">${i}</a>
               </li>`;
    }

    // Next button
    html += `<li class="page-item ${this.currentPage >= totalPages ? "disabled" : ""}">
               <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
             </li>`;

    $pagination.html(html);
  }
};

$(document).ready(() => NotificationsPage.init());
