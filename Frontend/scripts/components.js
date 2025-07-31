class ComponentsManager {
  static CONFIG = {
    MOBILE_BREAKPOINT: 1024,
    KEYBOARD_VISIBILITY_THRESHOLD: 0.9
  };

  static SELECTORS = {
    profileMenuAddFriend: ".nav-profile-menu-add-friend"
  };

  static COMPONENTS = ["HTMLSnippets", "Navigation", "SearchManager", "GlobalFriendDialog", "NotificationsManager", "BackToTop"];

  static init() {
    this.initializeComponents();
    this.setupImageErrorHandling();
    this.setupKeyboardWatcher();
    this.setupProfileMenuHandlers();
    this.initializeBackToTop();
  }

  static initializeComponents() {
    this.COMPONENTS.forEach((componentName) => {
      if (componentName === "BackToTop") return; // Handle separately
      this.initializeComponent(componentName);
    });
  }

  static initializeComponent(componentName) {
    if (typeof window[componentName] !== "undefined" && window[componentName].init) {
      window[componentName].init();
    }
  }

  static initializeBackToTop() {
    const isAuthPage = this.isAuthPage();
    const isDesktop = this.isDesktop();

    if (!isAuthPage && isDesktop) {
      this.initializeComponent("BackToTop");
    }
  }

  static isAuthPage() {
    return window.location.pathname.includes("auth.html");
  }

  static isDesktop() {
    const breakpoint = window.CONSTANTS?.MOBILE_BREAKPOINT || this.CONFIG.MOBILE_BREAKPOINT;
    return $(window).width() > breakpoint;
  }

  static setupImageErrorHandling() {
    $(document).on("error", "img", function () {
      const fallbackUrl = ComponentsManager.getFallbackImageUrl();
      const currentSrc = $(this).attr("src");

      if (currentSrc !== fallbackUrl) {
        $(this).attr("src", fallbackUrl);
      }
    });
  }

  static getFallbackImageUrl() {
    return window.CONSTANTS?.PLACEHOLDER_IMAGE_URL || "../sources/images/placeholder.png";
  }

  static setupProfileMenuHandlers() {
    $(document).on("click", this.SELECTORS.profileMenuAddFriend, (e) => {
      e.preventDefault();
      this.handleProfileMenuAddFriend();
    });
  }

  static handleProfileMenuAddFriend() {
    this.closeProfileMenu();
    this.openFriendDialog();
  }

  static closeProfileMenu() {
    if (typeof Navigation !== "undefined" && Navigation.toggleProfileMenu) {
      Navigation.toggleProfileMenu();
    }
  }

  static openFriendDialog() {
    if (typeof GlobalFriendDialog !== "undefined" && GlobalFriendDialog.showAddFriendDialog) {
      GlobalFriendDialog.showAddFriendDialog();
    }
  }

  static setupKeyboardWatcher() {
    if (!window.visualViewport) return;

    const initialHeight = window.visualViewport.height;

    window.visualViewport.addEventListener("resize", () => {
      this.handleViewportResize(initialHeight);
    });
  }

  static handleViewportResize(initialHeight) {
    const currentHeight = window.visualViewport.height;
    const heightRatio = currentHeight / initialHeight;

    if (heightRatio < this.CONFIG.KEYBOARD_VISIBILITY_THRESHOLD) {
      this.showKeyboard(currentHeight);
    } else {
      this.hideKeyboard();
    }
  }

  static showKeyboard(currentHeight) {
    const keyboardHeight = window.innerHeight - currentHeight;
    document.documentElement.style.setProperty("--keyboard-inset", `${keyboardHeight}px`);
    document.body.classList.add("keyboard-active");
  }

  static hideKeyboard() {
    document.documentElement.style.setProperty("--keyboard-inset", "0px");
    document.body.classList.remove("keyboard-active");
  }
}

$(document).ready(() => {
  ComponentsManager.init();
});

window.ComponentsManager = ComponentsManager;
