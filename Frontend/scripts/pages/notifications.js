const NotificationsPage = {
  currentUser: null,
  currentPage: 1,
  pageSize: 40,
  activeTab: "all",
  isLoading: false,
  hasMorePages: true,

  init() {
    this.currentUser = Utils.getCurrentUser();
    if (!this.currentUser) {
      window.location.href = "auth.html";
      return;
    }

    this.setupEventListeners();
    this.loadNotifications();
    this.loadUnreadCount();

    setTimeout(() => {
      this.updateTabIndicator();
    }, 0);
  },

  setupEventListeners() {
    $("#notificationTabs .nav-link").on("click", (e) => {
      e.preventDefault();
      const $link = $(e.currentTarget);
      const targetTab = $link.attr("data-bs-target");

      $("#notificationTabs .nav-link").removeClass("active");
      $link.addClass("active");

      $(".tab-pane").removeClass("show active");
      $(targetTab).addClass("show active");

      this.updateTabIndicator();

      this.activeTab = targetTab.replace("#", "");
      this.currentPage = 1;
      this.hasMorePages = true;
      this.loadNotifications();
    });

    $(window).on("scroll", () => {
      if (this.isLoading || !this.hasMorePages) return;

      const scrollBottom = $(window).scrollTop() + $(window).height();
      const documentHeight = $(document).height();

      if (scrollBottom > documentHeight - 200) {
        this.currentPage++;
        this.loadNotifications(true);
      }
    });

    $(document).on("click", ".mark-read-btn", (e) => {
      e.stopPropagation();
      const notificationId = $(e.currentTarget).closest(".notification-item").data("notification-id");
      this.markAsRead(notificationId);
    });

    $("#markAllReadBtn").on("click", () => this.markAllAsRead());

    $("#refreshBtn").on("click", () => {
      this.currentPage = 1;
      this.hasMorePages = true;
      this.loadNotifications();
      this.loadUnreadCount();
    });

    $(window).on("resize", () => {
      this.updateTabIndicator();
    });
  },

  updateTabIndicator() {
    const $activeTab = $("#notificationTabs .nav-link.active");
    if (!$activeTab.length) return;

    const $navTabs = $("#notificationTabs");
    const $activeLi = $activeTab.closest(".nav-item");

    if ($activeLi.length && $activeLi.position()) {
      const width = $activeLi.outerWidth();
      const left = $activeLi.position().left;

      $navTabs.css({
        "--indicator-width": width + "px",
        "--indicator-position": left + "px"
      });
    }
  },

  loadNotifications(append = false) {
    if (this.isLoading) return;
    this.isLoading = true;

    if (!append) {
      $("#notificationsLoading").show();
    }

    getNotifications(
      this.currentUser.id,
      this.currentPage,
      this.pageSize,
      (data) => {
        const notifications = data.notifications || data || [];
        const containerSelector = this.activeTab === "unread" ? "#unread .notifications-list" : "#all .notifications-list";
        const displayNotifications = this.activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

        this.displayNotifications(containerSelector, displayNotifications, append);

        this.hasMorePages = notifications.length === this.pageSize;

        this.isLoading = false;
        $("#notificationsLoading").hide();
      },
      (error) => {
        this.showError("Failed to load notifications.");
        this.isLoading = false;
        $("#notificationsLoading").hide();
      }
    );
  },

  displayNotifications(containerSelector, notifications, append) {
    const $container = $(containerSelector);

    if (!append) {
      $container.empty();
    }

    if (notifications.length === 0 && !append) {
      $container.html(`
        <div class="empty-state text-center py-5">
          <h3 class="text-muted">No notifications</h3>
          <p class="text-muted">You're all caught up!</p>
        </div>
      `);
      return;
    }

    notifications.forEach((notification) => {
      const html = this.createNotificationHtml(notification);
      $container.append(html);
    });
  },

  createNotificationHtml(notification) {
    const isUnread = !notification.isRead;
    const timeAgo = this.formatTimeAgo(notification.createdAt);
    const avatar = notification.senderAvatar || "../sources/images/no-image.png";

    return `
      <div class="notification-item ${isUnread ? "unread" : ""}" data-notification-id="${notification.id}">
        <div class="notification-content">
          <div class="notification-avatar">
            <img src="${avatar}" alt="User avatar" class="notification-avatar-img" />
          </div>
          <div class="notification-body">
            <div class="notification-header">
              <span class="notification-sender">${notification.senderName || "System"}</span>
              <span class="notification-type-badge">${this.getTypeBadge(notification.notificationType)}</span>
              <span class="notification-time">${timeAgo}</span>
            </div>
            <div class="notification-message">${notification.message || "No message"}</div>
            ${
              notification.articleTitle
                ? `
              <div class="notification-article">
                <a href="article.html?id=${notification.articleId || "#"}" class="notification-article-link">
                  <strong class="notification-article-title">${notification.articleTitle}</strong>
                </a>
              </div>
            `
                : ""
            }
          </div>
          <div class="notification-actions">
            ${
              isUnread
                ? `
              <button class="mark-read-btn" title="Mark as read">
                <img src="../sources/icons/checkmark-svgrepo-com.svg" alt="Mark as read" />
              </button>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;
  },

  markAsRead(notificationId) {
    markNotificationAsRead(
      notificationId,
      this.currentUser.id,
      () => {
        $(`.notification-item[data-notification-id="${notificationId}"]`).removeClass("unread").find(".mark-read-btn").remove();
        this.loadUnreadCount();
      },
      () => {
        UIManager.showPopup("Failed to mark notification as read", false);
      }
    );
  },

  markAllAsRead() {
    const unreadCount = $(".notification-item.unread").length;
    if (unreadCount === 0) {
      UIManager.showPopup("No unread notifications", "muted");
      return;
    }

    markAllNotificationsAsRead(
      this.currentUser.id,
      () => {
        $(".notification-item.unread").removeClass("unread");
        $(".mark-read-btn").remove();
        $("#unreadCount").hide();
        UIManager.showPopup("All notifications marked as read", true);
      },
      () => {
        UIManager.showPopup("Failed to mark all as read", false);
      }
    );
  },

  loadUnreadCount() {
    getUnreadNotificationCount(
      this.currentUser.id,
      (count) => {
        if (count > 0) {
          $("#unreadCount").text(count).show();
        } else {
          $("#unreadCount").hide();
        }
      },
      () => {
        $("#unreadCount").hide();
      }
    );
  },

  formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
    if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago";

    return date.toLocaleDateString();
  },

  getTypeBadge(type) {
    const badges = {
      FriendRequest: "Friend Request",
      FriendRequestAccepted: "Request Accepted",
      ArticleShare: "Article Shared",
      CommentLike: "Comment Liked"
    };
    return badges[type] || "Notification";
  },

  showError(message) {
    $("#errorMessage").text(message);
    $("#errorState").show();
  }
};

$(document).ready(() => NotificationsPage.init());
