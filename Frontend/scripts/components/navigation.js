class Navigation {
  static init() {
    this.setupEventHandlers();
    this.setupAuthNavLinks();
    this.setupProfileMenu();
    this.checkUserLockStatus();
  }

  static checkUserLockStatus() {
    const currentUser = Utils.getCurrentUser();
    if (!currentUser) return;

    getProfile(
      currentUser.id,
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
  }

  static handleEscapeKey() {
    if ($("#searchOverlay").hasClass("active")) {
      SearchManager.toggle();
    } else if ($("#mobileMenu").hasClass("active")) {
      this.toggleMobileMenu();
    } else if ($("#profileMenu").hasClass("active")) {
      this.toggleProfileMenu();
    } else if (typeof NotificationsManager !== "undefined" && NotificationsManager.isDropdownOpen) {
      NotificationsManager.closeDropdown();
    }
  }

  static closeMobileMenus() {
    if ($("#mobileMenu").hasClass("active")) {
      this.toggleMobileMenu();
    }
    if ($("#profileMenu").hasClass("active")) {
      this.toggleProfileMenu();
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
      this.toggleProfileMenu();
    });

    $(document).on("click", ".nav-profile-menu-close", () => {
      this.toggleProfileMenu();
    });

    $(document).on("click", ".nav-profile-logout-btn", () => {
      this.logout();
    });

    // Click outside to close profile menu
    $(document).on("click", (e) => {
      const isProfileMenuActive = $("#profileMenu").hasClass("active");
      const isClickInsideMenu = $(e.target).closest("#profileMenu").length;
      const isClickOnProfilePicture = $(e.target).closest(".nav-profile-picture").length;

      if (isProfileMenuActive && !isClickInsideMenu && !isClickOnProfilePicture) {
        this.toggleProfileMenu();
      }
    });
  }

  static toggleProfileMenu() {
    const $profileMenu = $("#profileMenu");
    if (!$profileMenu.length) return;

    // Close notifications if open (mutual exclusion)
    if (typeof NotificationsManager !== "undefined" && NotificationsManager.isDropdownOpen) {
      NotificationsManager.closeDropdown();
    }

    $profileMenu.toggleClass("active");
  }

  static logout() {
    try {
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

    // TODO: Subscribe button handlers
    $(document).on("click", ".subscribe-btn, .mobile-subscribe-btn", () => {
      UIManager.showPopup("Subscribe functionality coming soon!", "muted");
    });
  }
}

window.Navigation = Navigation;
