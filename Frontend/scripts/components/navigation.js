const Navigation = {
  init() {
    this.setupEventHandlers();
    this.setupAuthNavLinks();
    this.setupProfileMenu();
  },

  setupEventHandlers() {
    $(document).on("keydown", (e) => {
      if (e.key === "Escape") {
        if ($("#searchOverlay").hasClass("active")) SearchManager.toggle();
        if ($("#mobileMenu").hasClass("active")) this.toggleMobileMenu();
        if ($("#profileMenu").hasClass("active")) this.toggleProfileMenu();
        if (typeof NotificationsManager !== "undefined" && NotificationsManager.isDropdownOpen) {
          NotificationsManager.closeDropdown();
        }
      }
    });

    $(window).on("resize", () => {
      if ($(window).width() > CONSTANTS.MOBILE_BREAKPOINT) {
        if ($("#mobileMenu").hasClass("active")) this.toggleMobileMenu();
        if ($("#profileMenu").hasClass("active")) this.toggleProfileMenu();
      }
    });

    $(document).on("click", ".mobile-menu-btn, .mobile-menu-header .close-btn", () => {
      this.toggleMobileMenu();
    });
  },

  toggleMobileMenu() {
    const $mobileMenu = $("#mobileMenu");
    const $searchIcon = $("#navbar .search-icon");
    if (!$mobileMenu.length) return;

    $mobileMenu.toggleClass("active");
    if ($searchIcon.length) {
      $searchIcon.toggleClass("hide");
    }
  },

  setupProfileMenu() {
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

    $(document).on("click", (e) => {
      if ($("#profileMenu").hasClass("active") && !$(e.target).closest("#profileMenu").length && !$(e.target).closest(".nav-profile-picture").length) {
        this.toggleProfileMenu();
      }
    });
  },

  toggleProfileMenu() {
    const $profileMenu = $("#profileMenu");
    if (!$profileMenu.length) return;

    if (typeof NotificationsManager !== "undefined" && NotificationsManager.isDropdownOpen) {
      NotificationsManager.closeDropdown();
    }

    $profileMenu.toggleClass("active");
  },

  logout() {
    try {
      localStorage.removeItem("currentUser");
      UIManager.showPopup("Logged out successfully!", true);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      UIManager.showPopup("Error during logout. Please try again.", false);
    }
  },

  setupAuthNavLinks() {
    $(document).on("click", ".login-btn, .mobile-login-btn", () => {
      window.location.href = Utils.getNavHref("auth");
    });

    $(document).on("click", ".subscribe-btn, .mobile-subscribe-btn", () => {
      UIManager.showPopup("Subscribe functionality coming soon!", "muted");
    });
  }
};

window.Navigation = Navigation;
