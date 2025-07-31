class NotificationsPageManager {
  static currentUser = null;
  static currentPage = 1;
  static pageSize = 10;
  static activeTab = "all";
  static isLoading = false;
  static hasMorePages = true;

  static SELECTORS = {
    notificationTabs: "#notificationTabs",
    notificationTabLinks: "#notificationTabs .nav-link",
    tabPanes: ".tab-pane",
    notificationsLoading: "#notificationsLoading",
    markAllReadBtn: "#markAllReadBtn",
    refreshBtn: "#refreshBtn",
    unreadCount: "#unreadCount",
    errorMessage: "#errorMessage",
    errorState: "#errorState",
    allNotificationsList: "#all .notifications-list",
    unreadNotificationsList: "#unread .notifications-list"
  };

  static SCROLL_CONFIG = {
    THRESHOLD: 200
  };

  static TYPE_BADGES = {
    FriendRequest: "Friend Request",
    FriendRequestAccepted: "Request Accepted",
    ArticleShare: "Article Shared",
    CommentLike: "Comment Liked"
  };

  static TEMPLATES = {
    emptyState: `
      <div class="empty-state text-center py-5">
        <h3 class="text-muted">No notifications</h3>
        <p class="text-muted">You're all caught up!</p>
      </div>
    `,
    articleShare: (notification) => `
      <div class="notification-article">
        <div class="notification-article-link">
          <img src="../sources/icons/text-align-left-svgrepo-com.svg" alt="Article" class="notification-icon" />
          <strong class="notification-article-title">${notification.articleTitle}</strong>
        </div>
      </div>
    `,
    commentLike: (notification) => `
      <div class="notification-article">
        <div class="notification-article-link">
          <img src="../sources/icons/full-heart-svgrepo-com.svg" alt="Article" class="notification-icon" />
          <strong class="notification-article-title">${notification.articleTitle}</strong>
        </div>
      </div>
    `,
    friendRequest: `
      <div class="notification-friend-request">
        <img src="../sources/icons/user-svgrepo-com.svg" alt="Friend Request" class="notification-icon" />
        <span>Click to view friend requests</span>
      </div>
    `,
    friendRequestAccepted: `
      <div class="notification-friend-accepted">
        <img src="../sources/icons/checkmark-svgrepo-com.svg" alt="Accepted" class="notification-icon success-icon" />
        <span>You are now friends!</span>
      </div>
    `
  };

  static init() {
    this.currentUser = Utils.getCurrentUser();

    if (!this.currentUser) {
      window.location.href = "auth.html";
      return;
    }

    this.setupEventListeners();
    this.loadNotifications();
    this.loadUnreadCount();
    this.scheduleTabIndicatorUpdate();
  }

  static scheduleTabIndicatorUpdate() {
    setTimeout(() => {
      this.updateTabIndicator();
    }, 0);
  }

  static setupEventListeners() {
    this.setupTabHandlers();
    this.setupScrollHandler();
    this.setupNotificationHandlers();
    this.setupActionHandlers();
    this.setupResizeHandler();
  }

  static setupTabHandlers() {
    $(this.SELECTORS.notificationTabLinks).on("click", (e) => this.handleTabClick(e));
  }

  static setupScrollHandler() {
    $(window).on("scroll", () => this.handleScroll());
  }

  static setupNotificationHandlers() {
    $(document)
      .on("mouseenter", ".notification-item.unread", (e) => this.handleNotificationHover(e))
      .on("click", ".notification-item.clickable", (e) => this.handleNotificationClick(e))
      .on("click", ".notification-article-link", (e) => this.handleArticleLinkClick(e));
  }

  static setupActionHandlers() {
    $(this.SELECTORS.markAllReadBtn).on("click", () => this.markAllAsRead());
    $(this.SELECTORS.refreshBtn).on("click", () => this.refreshNotifications());
  }

  static setupResizeHandler() {
    $(window).on("resize", () => this.updateTabIndicator());
  }

  static handleTabClick(e) {
    e.preventDefault();
    const $link = $(e.currentTarget);
    const targetTab = $link.attr("data-bs-target");

    this.updateActiveTab($link, targetTab);
    this.updateTabIndicator();
    this.switchToTab(targetTab);
  }

  static updateActiveTab($link, targetTab) {
    $(this.SELECTORS.notificationTabLinks).removeClass("active");
    $link.addClass("active");

    $(this.SELECTORS.tabPanes).removeClass("show active");
    $(targetTab).addClass("show active");
  }

  static switchToTab(targetTab) {
    this.activeTab = targetTab.replace("#", "");
    this.currentPage = 1;
    this.hasMorePages = true;
    this.loadNotifications();
  }

  static handleScroll() {
    if (this.isLoading || !this.hasMorePages) return;

    const scrollBottom = $(window).scrollTop() + $(window).height();
    const documentHeight = $(document).height();

    if (scrollBottom > documentHeight - this.SCROLL_CONFIG.THRESHOLD) {
      this.currentPage++;
      this.loadNotifications(true);
    }
  }

  static handleNotificationHover(e) {
    const $notification = $(e.currentTarget);
    const notificationId = $notification.data("notification-id");
    this.markAsRead(notificationId);
  }

  static handleNotificationClick(e) {
    const $notification = $(e.currentTarget);
    const notificationType = $notification.data("notification-type");
    const articleId = $notification.data("article-id");

    this.navigateBasedOnType(notificationType, articleId);
  }

  static navigateBasedOnType(notificationType, articleId) {
    if (notificationType === "FriendRequest") {
      window.location.href = `profile.html#friend-requests`;
    } else if (notificationType === "ArticleShare" && articleId) {
      window.location.href = `article.html?id=${articleId}`;
    } else if (notificationType === "CommentLike" && articleId) {
      window.location.href = `article.html?id=${articleId}#comments-list`;
    }
  }

  static handleArticleLinkClick(e) {
    e.stopPropagation();
    const $notification = $(e.currentTarget).closest(".notification-item");
    const articleId = $notification.data("article-id");

    if (articleId) {
      window.location.href = `article.html?id=${articleId}`;
    }
  }

  static refreshNotifications() {
    this.currentPage = 1;
    this.hasMorePages = true;
    this.loadNotifications();
    this.loadUnreadCount();
  }

  static updateTabIndicator() {
    const $activeTab = $(this.SELECTORS.notificationTabLinks + ".active");
    if (!$activeTab.length) return;

    const $navTabs = $(this.SELECTORS.notificationTabs);
    const $activeLi = $activeTab.closest(".nav-item");

    if ($activeLi.length && $activeLi.position()) {
      const width = $activeLi.outerWidth();
      const left = $activeLi.position().left;

      $navTabs.css({
        "--indicator-width": width + "px",
        "--indicator-position": left + "px"
      });
    }
  }

  static loadNotifications(append = false) {
    if (this.isLoading) return;

    this.isLoading = true;

    if (!append) {
      $(this.SELECTORS.notificationsLoading).show();
    }

    getNotifications(
      this.currentUser.id,
      this.currentPage,
      this.pageSize,
      (data) => this.handleNotificationsLoadSuccess(data, append),
      () => this.handleNotificationsLoadError()
    );
  }

  static handleNotificationsLoadSuccess(data, append) {
    const notifications = data.notifications || data || [];
    const containerSelector = this.getContainerSelector();
    const displayNotifications = this.filterNotificationsByTab(notifications);

    this.displayNotifications(containerSelector, displayNotifications, append);
    this.updatePaginationState(notifications);
    this.hideLoadingIndicator();
  }

  static handleNotificationsLoadError() {
    this.showError("Failed to load notifications.");
    this.hideLoadingIndicator();
  }

  static getContainerSelector() {
    return this.activeTab === "unread" ? this.SELECTORS.unreadNotificationsList : this.SELECTORS.allNotificationsList;
  }

  static filterNotificationsByTab(notifications) {
    return this.activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications;
  }

  static updatePaginationState(notifications) {
    this.hasMorePages = notifications.length === this.pageSize;
    this.isLoading = false;
  }

  static hideLoadingIndicator() {
    $(this.SELECTORS.notificationsLoading).hide();
  }

  static displayNotifications(containerSelector, notifications, append) {
    const $container = $(containerSelector);

    if (!append) {
      $container.empty();
    }

    if (notifications.length === 0 && !append) {
      $container.html(this.TEMPLATES.emptyState);
      return;
    }

    this.renderNotifications($container, notifications);
  }

  static renderNotifications($container, notifications) {
    notifications.forEach((notification) => {
      const html = this.createNotificationHtml(notification);
      $container.append(html);
    });
  }

  static createNotificationHtml(notification) {
    const isUnread = !notification.isRead;
    const timeAgo = Utils.formatTimeAgo(notification.createdAt);
    const avatar = notification.senderAvatar || "../sources/images/no-image.png";
    const notificationType = notification.notificationType;

    return `
      <div class="notification-item ${isUnread ? "unread" : ""} clickable" 
           data-notification-id="${notification.id}"
           data-notification-type="${notificationType}"
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
        </div>
      </div>
    `;
  }

  static createNotificationSpecificContent(notification) {
    const notificationType = notification.notificationType;

    switch (notificationType) {
      case "ArticleShare":
        return this.hasArticleContent(notification) ? this.TEMPLATES.articleShare(notification) : "";

      case "CommentLike":
        return this.hasArticleContent(notification) ? this.TEMPLATES.commentLike(notification) : "";

      case "FriendRequest":
        return this.TEMPLATES.friendRequest;

      case "FriendRequestAccepted":
        return this.TEMPLATES.friendRequestAccepted;

      default:
        return "";
    }
  }

  static hasArticleContent(notification) {
    return notification.articleTitle && notification.articleId;
  }

  static markAsRead(notificationId) {
    markNotificationAsRead(
      notificationId,
      this.currentUser.id,
      () => this.handleMarkAsReadSuccess(notificationId),
      () => this.handleMarkAsReadError()
    );
  }

  static handleMarkAsReadSuccess(notificationId) {
    $(`.notification-item[data-notification-id="${notificationId}"]`).removeClass("unread");
    this.loadUnreadCount();
  }

  static handleMarkAsReadError() {
    UIManager.showPopup("Failed to mark notification as read", false);
  }

  static markAllAsRead() {
    const unreadCount = $(".notification-item.unread").length;

    if (unreadCount === 0) {
      UIManager.showPopup("No unread notifications", "muted");
      return;
    }

    markAllNotificationsAsRead(
      this.currentUser.id,
      () => this.handleMarkAllAsReadSuccess(),
      () => this.handleMarkAllAsReadError()
    );
  }

  static handleMarkAllAsReadSuccess() {
    $(".notification-item.unread").removeClass("unread");
    $(this.SELECTORS.unreadCount).hide();
    UIManager.showPopup("All notifications marked as read", true);
  }

  static handleMarkAllAsReadError() {
    UIManager.showPopup("Failed to mark all as read", false);
  }

  static loadUnreadCount() {
    getUnreadNotificationCount(
      this.currentUser.id,
      (response) => this.handleUnreadCountSuccess(response),
      () => this.handleUnreadCountError()
    );
  }

  static handleUnreadCountSuccess(response) {
    const count = response.count;
    const $unreadBadge = $(this.SELECTORS.unreadCount);

    if (count > 0) {
      $unreadBadge.text(count).show();
    } else {
      $unreadBadge.hide();
    }
  }

  static handleUnreadCountError() {
    $(this.SELECTORS.unreadCount).hide();
  }

  static getTypeBadge(type) {
    return this.TYPE_BADGES[type] || "Notification";
  }

  static showError(message) {
    $(this.SELECTORS.errorMessage).text(message);
    $(this.SELECTORS.errorState).show();
  }
}

$(document).ready(() => {
  NotificationsPageManager.init();
});

window.NotificationsPageManager = NotificationsPageManager;
