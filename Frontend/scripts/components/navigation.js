class Navigation {
  static get currentUser() {
    return Utils.getCurrentUser();
  }

  static unreadCount = 0;
  static notifications = [];
  static isDropdownOpen = false;
  static refreshInterval = null;

  static init() {
    this.setupEventHandlers();
    this.setupAuthNavLinks();
    this.setupProfileMenu();
    this.setupNotificationsEventHandlers();
    this.checkUserLockStatus();

    if (this.currentUser) {
      this.loadInitialNotificationsData();
      this.startPeriodicRefresh();
    }
  }

  static checkUserLockStatus() {
    if (!this.currentUser) return;

    getProfile(
      this.currentUser.id,
      (freshProfile) => {
        if (freshProfile?.isLocked) {
          Navigation.invalidateSession("Your account has been locked by an administrator.");
        }
      },
      (error) => {
        if (error.status === 404) {
          Navigation.invalidateSession("Invalid user profile. Please log in again.");
        }
      }
    );
  }

  static invalidateSession(message) {
    localStorage.removeItem("currentUser");
    UIManager.showPopup(message, false);
    setTimeout(() => (window.location.href = Utils.getNavHref("auth")), 2000);
  }

  static setupEventHandlers() {
    $(document).on("keydown", (e) => {
      if (e.key === "Escape") {
        this.handleEscapeKey();
      }
    });

    $(window).on("resize", () => {
      if ($(window).width() > CONSTANTS.MOBILE_BREAKPOINT) {
        this.closeMobileMenus();
      }
    });

    $(document).on("click", ".mobile-menu-btn, .mobile-menu-header .close-btn", () => {
      this.toggleMobileMenu();
    });

    $(document).on("click", (e) => {
      this.handleGlobalClick(e);
    });
  }

  static setupNotificationsEventHandlers() {
    // Notifications button click
    $(document).on("click", ".nav-notifications-btn", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleNotificationsDropdown();
    });

    // Individual notification click
    $(document).on("click", ".nav-notification-item", (e) => {
      const $item = $(e.currentTarget);
      const notificationId = $item.data("notification-id");
      const notificationType = $item.data("notification-type");
      const articleId = $item.data("article-id");

      if ($item.hasClass("unread")) {
        this.markNotificationAsRead(notificationId);
      }

      this.handleNotificationClick(notificationType, articleId);
      this.closeNotificationsDropdown();
    });
  }

  static handleGlobalClick(e) {
    const $target = $(e.target);
    const isProfileMenuActive = $("#profileMenu").hasClass("active");
    const isNotificationsOpen = this.isDropdownOpen;

    // Check what was clicked
    const clickedProfilePicture = $target.closest(".nav-profile-picture").length;
    const clickedInsideProfileMenu = $target.closest("#profileMenu").length;
    const clickedInsideNotifications = $target.closest(".nav-notifications-container").length;

    // Close profile menu if clicked outside
    if (isProfileMenuActive && !clickedInsideProfileMenu && !clickedProfilePicture) {
      this.toggleProfileMenu();
    }

    // Close notifications if clicked outside
    if (isNotificationsOpen && !clickedInsideNotifications) {
      this.closeNotificationsDropdown();
    }
  }

  static handleEscapeKey() {
    if ($("#searchOverlay").hasClass("active")) {
      SearchManager.toggle();
    } else if (this.isDropdownOpen) {
      this.closeNotificationsDropdown();
    } else if ($("#mobileMenu").hasClass("active")) {
      this.toggleMobileMenu();
    } else if ($("#profileMenu").hasClass("active")) {
      this.toggleProfileMenu();
    }
  }

  static closeMobileMenus() {
    if ($("#mobileMenu").hasClass("active")) {
      this.toggleMobileMenu();
    }
    if ($("#profileMenu").hasClass("active")) {
      this.toggleProfileMenu();
    }
    if (this.isDropdownOpen) {
      this.closeNotificationsDropdown();
    }
  }

  static toggleMobileMenu() {
    const $mobileMenu = $("#mobileMenu");
    const $searchIcon = $("#navbar .search-icon");

    if (!$mobileMenu.length) return;

    $mobileMenu.toggleClass("active");
    if ($searchIcon.length) {
      $searchIcon.toggleClass("hide");
    }
  }

  static setupProfileMenu() {
    $(document).on("click", ".nav-profile-picture", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleProfileMenu();
    });

    $(document).on("click", ".nav-profile-menu-close", () => {
      this.toggleProfileMenu();
    });

    $(document).on("click", ".nav-profile-logout-btn", () => {
      this.logout();
    });
  }

  static toggleProfileMenu() {
    const $profileMenu = $("#profileMenu");
    if (!$profileMenu.length) return;

    const isCurrentlyActive = $profileMenu.hasClass("active");

    if (!isCurrentlyActive) {
      // Close notifications dropdown if open (mutual exclusion)
      if (this.isDropdownOpen) {
        this.closeNotificationsDropdown();
      }
    }

    $profileMenu.toggleClass("active");
  }

  static logout() {
    try {
      this.destroyNotifications();

      localStorage.removeItem("currentUser");
      UIManager.showPopup("Logged out successfully!", true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      UIManager.showPopup("Error during logout. Please try again.", false);
    }
  }

  static setupAuthNavLinks() {
    $(document).on("click", ".login-btn, .mobile-login-btn", () => {
      window.location.href = Utils.getNavHref("auth");
    });

    // TODO: Implement subscription functionality
    $(document).on("click", ".subscribe-btn, .mobile-subscribe-btn", () => {
      UIManager.showPopup("Subscribe functionality coming soon!", "muted");
    });
  }

  static loadInitialNotificationsData() {
    this.loadUnreadCount();
    this.loadRecentNotifications();
  }

  static loadUnreadCount() {
    if (!this.currentUser) return;

    getUnreadNotificationCount(
      this.currentUser.id,
      (response) => {
        this.unreadCount = response.count || 0;
        this.updateNotificationsBadge();
      },
      () => {}
    );
  }

  static loadRecentNotifications() {
    if (!this.currentUser) return;

    const $dropdown = $(".nav-notifications-dropdown");
    if (!$dropdown.length) return;

    this.showNotificationsLoadingState();

    getRecentNotifications(
      this.currentUser.id,
      (notifications) => {
        this.notifications = notifications || [];
        this.renderNotifications();
      },
      () => {
        this.showNotificationsErrorState();
      }
    );
  }

  static showNotificationsLoadingState() {
    const $list = $(".nav-notifications-list");
    $list.html(Utils.createLoadingIndicator("../sources/images/sun/sun.png", "Loading"));
  }

  static showNotificationsErrorState() {
    const $list = $(".nav-notifications-list");
    $list.html(`
      <div class="nav-notifications-empty">
        <img src="../sources/icons/notifications-off-svgrepo-com.svg" alt="No notifications" />
        <p>Failed to load notifications</p>
      </div>
    `);
  }

  static renderNotifications() {
    const $list = $(".nav-notifications-list");

    if (!this.notifications.length) {
      $list.html(`
        <div class="nav-notifications-empty">
          <img src="../sources/icons/notifications-off-svgrepo-com.svg" alt="No notifications" />
          <p>No notifications yet</p>
        </div>
      `);
      return;
    }

    const notificationsHtml = this.notifications
      .slice(0, 5)
      .map((notification) => this.generateNotificationItem(notification))
      .join("");

    $list.html(notificationsHtml);
  }

  static generateNotificationItem(notification) {
    const timeAgo = Utils.formatTimeAgo(notification.createdAt);
    const isUnread = !notification.isRead;
    const avatarSrc = notification.senderAvatar || CONSTANTS.NO_IMAGE_URL;
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
  }

  static formatNotificationMessage(notification) {
    const senderName = notification.senderName || "Someone";
    const message = notification.message || "";
    return `${senderName} ${message}`;
  }

  static toggleNotificationsDropdown() {
    if (this.isDropdownOpen) {
      this.closeNotificationsDropdown();
    } else {
      this.openNotificationsDropdown();
    }
  }

  static openNotificationsDropdown() {
    // Close profile menu if open (mutual exclusion)
    if ($("#profileMenu").hasClass("active")) {
      this.toggleProfileMenu();
    }

    $(".nav-notifications-container").addClass("active");
    this.isDropdownOpen = true;
    this.loadRecentNotifications();
  }

  static closeNotificationsDropdown() {
    $(".nav-notifications-container").removeClass("active");
    this.isDropdownOpen = false;
  }

  static updateNotificationsBadge() {
    const $badge = $(".nav-notifications-badge");
    const $icon = $(".nav-notifications-icon");
    const $btn = $(".nav-notifications-btn");

    if (this.unreadCount > 0) {
      $badge.text(this.unreadCount > 99 ? "99+" : this.unreadCount).show();
      $icon.attr("src", "../sources/icons/notifications-alert-svgrepo-com.svg");
      $btn.addClass("has-unread");
    } else {
      $badge.hide();
      $icon.attr("src", "../sources/icons/notifications-svgrepo-com.svg");
      $btn.removeClass("has-unread");
    }
  }

  static markNotificationAsRead(notificationId) {
    markNotificationAsRead(
      notificationId,
      this.currentUser.id,
      () => {
        const notification = this.notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.updateNotificationsBadge();

          $(`.nav-notification-item[data-notification-id="${notificationId}"]`).removeClass("unread");
        }
      },
      () => {}
    );
  }

  static handleNotificationClick(type, articleId) {
    switch (type) {
      case "ArticleShare":
        if (articleId) {
          window.location.href = `article.html?id=${articleId}`;
        }
        break;
      case "CommentLike":
        if (articleId) {
          window.location.href = `article.html?id=${articleId}#comments-list`;
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
  }

  static startPeriodicRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 30000); // Maybe remove this later for firebase implementation
  }

  static destroyNotifications() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.notifications = [];
    this.unreadCount = 0;
    this.isDropdownOpen = false;
  }
}

window.Navigation = Navigation;
