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

    // Mark as read action
    $(document).on("click", ".mark-read-btn", (e) => {
      e.stopPropagation();
      const notificationId = $(e.currentTarget).closest(".notification-item").data("notification-id");
      this.markAsRead(notificationId);
    });

    // Friend request actions
    $(document).on("click", ".accept-friend-btn", (e) => {
      e.stopPropagation();
      const $notification = $(e.currentTarget).closest(".notification-item");
      const senderId = $notification.data("sender-id");
      this.handleFriendRequest(senderId, true, $notification);
    });

    $(document).on("click", ".decline-friend-btn", (e) => {
      e.stopPropagation();
      const $notification = $(e.currentTarget).closest(".notification-item");
      const senderId = $notification.data("sender-id");
      this.handleFriendRequest(senderId, false, $notification);
    });

    // Article navigation
    $(document).on("click", ".notification-article-link, .notification-item[data-article-id]", (e) => {
      const $target = $(e.currentTarget);
      const articleId = $target.data("article-id") || $target.closest(".notification-item").data("article-id");

      if (articleId && !$(e.target).hasClass("btn") && !$(e.target).closest(".btn").length) {
        window.location.href = `article.html?id=${articleId}`;
      }
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
    const notificationType = notification.notificationType;

    // Base notification structure
    let notificationContent = `
      <div class="notification-item ${isUnread ? "unread" : ""}" 
           data-notification-id="${notification.id}"
           data-sender-id="${notification.senderId || ""}"
           ${notification.articleId ? `data-article-id="${notification.articleId}"` : ""}>
        <div class="notification-content">
          <div class="notification-avatar">
            <img src="${avatar}" alt="User avatar" class="notification-avatar-img" />
          </div>
          <div class="notification-body">
            <div class="notification-header">
              <span class="notification-sender">${notification.senderName || "System"}</span>
              <span class="notification-type-badge">${this.getTypeBadge(notificationType)}</span>
              <span class="notification-time">${timeAgo}</span>
            </div>
            <div class="notification-message">${notification.message || "No message."}</div>
            ${this.createNotificationSpecificContent(notification)}
          </div>
          <div class="notification-actions">
            ${this.createNotificationActions(notification, isUnread)}
          </div>
        </div>
      </div>
    `;

    return notificationContent;
  },

  createNotificationSpecificContent(notification) {
    const notificationType = notification.notificationType;

    switch (notificationType) {
      case "ArticleShare":
      case "CommentLike":
        if (notification.articleTitle && notification.articleId) {
          return `
            <div class="notification-article">
              <a href="article.html?id=${notification.articleId}" class="notification-article-link">
                <img src="../sources/icons/text-align-left-svgrepo-com.svg" alt="Article" class="notification-icon" />
                <strong class="notification-article-title">${notification.articleTitle}</strong>
              </a>
            </div>
          `;
        }
        break;

      case "FriendRequest":
        return `
          <div class="notification-friend-request">
            <img src="../sources/icons/user-svgrepo-com.svg" alt="Friend Request" class="notification-icon" />
            <span>Wants to be your friend</span>
          </div>
        `;

      case "FriendRequestAccepted":
        return `
          <div class="notification-friend-accepted">
            <img src="../sources/icons/checkmark-svgrepo-com.svg" alt="Accepted" class="notification-icon success-icon" />
            <span>You are now friends!</span>
          </div>
        `;
    }

    return "";
  },

  createNotificationActions(notification, isUnread) {
    const notificationType = notification.notificationType;
    let actions = "";

    // Mark as read button for unread notifications
    if (isUnread) {
      actions += `
        <button class="mark-read-btn" title="Mark as read">
          <img src="../sources/icons/checkmark-svgrepo-com.svg" alt="Mark as read" />
        </button>
      `;
    }

    // Type-specific actions
    switch (notificationType) {
      case "FriendRequest":
        // Only show accept/decline if the request is still pending (unread indicates pending)
        if (isUnread) {
          actions += `
            <div class="friend-request-actions">
              <button class="accept-friend-btn btn btn-success btn-sm" title="Accept friend request">
                <img src="../sources/icons/checkmark-svgrepo-com.svg" alt="Accept" class="btn-icon" /> Accept
              </button>
              <button class="decline-friend-btn btn btn-danger btn-sm" title="Decline friend request">
                <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Decline" class="btn-icon" /> Decline
              </button>
            </div>
          `;
        }
        break;

      case "ArticleShare":
      case "CommentLike":
        if (notification.articleId) {
          actions += `
            <button class="view-article-btn btn btn-primary btn-sm" 
                    onclick="window.location.href='article.html?id=${notification.articleId}'" 
                    title="View article">
              <img src="../sources/icons/eye-svgrepo-com.svg" alt="View" class="btn-icon" /> View
            </button>
          `;
        }
        break;
    }

    return actions;
  },

  handleFriendRequest(senderId, isAccepted, $notification) {
    const requestData = {
      requesterId: senderId,
      recipientId: this.currentUser.id,
      isAccepted: isAccepted
    };

    respondToFriendRequest(
      requestData,
      (response) => {
        // Remove the friend request actions
        $notification.find(".friend-request-actions").remove();

        // Mark as read and remove unread styling
        $notification.removeClass("unread");
        $notification.find(".mark-read-btn").remove();

        // Update the notification content to show the response
        const $message = $notification.find(".notification-message");
        if (isAccepted) {
          $message.text("Friend request accepted");
          $notification.find(".notification-friend-request").html(`
            <img src="../sources/icons/checkmark-svgrepo-com.svg" alt="Accepted" class="notification-icon success-icon" />
            <span>Friend request accepted</span>
          `);
          UIManager.showPopup("Friend request accepted!", true);
        } else {
          $message.text("Friend request declined");
          $notification.find(".notification-friend-request").html(`
            <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Declined" class="notification-icon decline-icon" />
            <span>Friend request declined</span>
          `);
          UIManager.showPopup("Friend request declined", "muted");
        }

        // Mark the notification as read on the server
        this.markAsRead($notification.data("notification-id"));
        this.loadUnreadCount();
      },
      (error) => {
        console.error("Friend request response error:", error);
        UIManager.showPopup(`Failed to ${isAccepted ? "accept" : "decline"} friend request`, false);
      }
    );
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
