const NotificationsManager = {
  isInitialized: false,
  currentUser: null,
  unreadCount: 0,
  notifications: [],
  isDropdownOpen: false,
  refreshInterval: null,

  init() {
    if (this.isInitialized) return;

    const initWithUser = () => {
      this.currentUser = Utils.getCurrentUser();
      if (!this.currentUser) {
        setTimeout(initWithUser, 100);
        return;
      }

      this.setupEventHandlers();
      this.loadInitialData();
      this.startPeriodicRefresh();
      this.isInitialized = true;
    };

    initWithUser();
  },

  setupEventHandlers() {
    $(document).on("click", ".nav-notifications-btn", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown();
    });

    $(document).on("click", (e) => {
      if (this.isDropdownOpen && !$(e.target).closest(".nav-notifications-container").length) {
        this.closeDropdown();
      }
    });

    $(document).on("click", ".nav-notification-item", (e) => {
      const $item = $(e.currentTarget);
      const notificationId = $item.data("notification-id");
      const notificationType = $item.data("notification-type");
      const articleId = $item.data("article-id");

      if ($item.hasClass("unread")) {
        this.markAsRead(notificationId);
      }

      this.handleNotificationClick(notificationType, articleId);
      this.closeDropdown();
    });

    $(document).on("keydown", (e) => {
      if (e.key === "Escape" && this.isDropdownOpen) {
        this.closeDropdown();
      }
    });
  },

  loadInitialData() {
    this.loadUnreadCount();
    this.loadRecentNotifications();
  },

  loadUnreadCount() {
    getUnreadNotificationCount(
      this.currentUser.id,
      (response) => {
        this.unreadCount = response.count || 0;
        this.updateBadge();
      },
      (error) => {
        console.error("Failed to load unread count:", error);
      }
    );
  },

  loadRecentNotifications() {
    const $dropdown = $(".nav-notifications-dropdown");
    if (!$dropdown.length) return;

    this.showLoadingState();

    getRecentNotifications(
      this.currentUser.id,
      (notifications) => {
        this.notifications = notifications || [];
        this.renderNotifications();
      },
      (error) => {
        console.error("Failed to load recent notifications:", error);
        this.showErrorState();
      }
    );
  },

  showLoadingState() {
    const $list = $(".nav-notifications-list");
    $list.html(`
      <div class="nav-notifications-loading">
        <div class="thinking-container small">
          <img src="../sources/images/sun/sun.png" alt="Loading" class="thinking-icon" />
        </div>
      </div>
    `);
  },

  showErrorState() {
    const $list = $(".nav-notifications-list");
    $list.html(`
      <div class="nav-notifications-empty">
        <img src="../sources/icons/notifications-svgrepo-com.svg" alt="No notifications" />
        <p>Failed to load notifications</p>
      </div>
    `);
  },

  renderNotifications() {
    const $list = $(".nav-notifications-list");

    if (!this.notifications.length) {
      $list.html(`
        <div class="nav-notifications-empty">
          <img src="../sources/icons/notifications-svgrepo-com.svg" alt="No notifications" />
          <p>No notifications yet</p>
        </div>
      `);
      return;
    }

    const notificationsHtml = this.notifications
      .slice(0, 5)
      .map((notification) => {
        return this.generateNotificationItem(notification);
      })
      .join("");

    $list.html(notificationsHtml);
  },

  generateNotificationItem(notification) {
    const timeAgo = Utils.formatTimeAgo(notification.createdAt);
    const isUnread = !notification.isRead;
    const avatarSrc = notification.senderAvatar || "../sources/images/placeholder.png";
    const message = this.formatNotificationMessage(notification);

    return `
      <div class="nav-notification-item ${isUnread ? "unread" : ""}" 
           data-notification-id="${notification.id}"
           data-notification-type="${notification.notificationType}"
           data-article-id="${notification.articleId || ""}"
           data-friend-id="${notification.friendId || ""}">
        <img src="${avatarSrc}" alt="${notification.senderName || "User"}" class="nav-notification-icon" />
        <div class="nav-notification-content">
          <p class="nav-notification-text">${message}</p>
          <span class="nav-notification-time">${timeAgo}</span>
        </div>
      </div>
    `;
  },

  getNotificationIcon(type) {
    const icons = {
      ArticleShare: "../sources/icons/share-svgrepo-com.svg",
      FriendRequest: "../sources/icons/profile-plus-round-1324-svgrepo-com.svg",
      CommentLike: "../sources/icons/heart-svgrepo-com.svg",
      Comment: "../sources/icons/chat-svgrepo-com.svg"
    };
    return icons[type] || "../sources/icons/notifications-svgrepo-com.svg";
  },

  formatNotificationMessage(notification) {
    const senderName = notification.senderName || "Someone";
    const message = notification.message || "";

    return `${senderName} ${message}`;
  },

  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  },

  openDropdown() {
    $(".nav-notifications-container").addClass("active");
    this.isDropdownOpen = true;

    this.loadRecentNotifications();
  },

  closeDropdown() {
    $(".nav-notifications-container").removeClass("active");
    this.isDropdownOpen = false;
  },

  updateBadge() {
    const $badge = $(".nav-notifications-badge");
    if (this.unreadCount > 0) {
      $badge.text(this.unreadCount > 99 ? "99+" : this.unreadCount).show();
    } else {
      $badge.hide();
    }
  },

  markAsRead(notificationId) {
    markNotificationAsRead(
      notificationId,
      this.currentUser.id,
      (response) => {
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.updateBadge();

          $(`.nav-notification-item[data-notification-id="${notificationId}"]`).removeClass("unread");
        }
      },
      (error) => {
        console.error("Failed to mark notification as read:", error);
      }
    );
  },

  handleNotificationClick(type, articleId) {
    switch (type) {
      case "ArticleShare":
      case "CommentLike":
        if (articleId) {
          window.location.href = `article.html?id=${articleId}`;
        }
        break;
      case "FriendRequest":
      case "FriendRequestAccepted":
        window.location.href = "profile.html#friend-requests";
        break;
      default:
        window.location.href = "notifications.html";
        break;
    }
  },

  startPeriodicRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  },

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isInitialized = false;
  }
};

window.NotificationsManager = NotificationsManager;
