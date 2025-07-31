class ProfilePageManager {
  static SCROLL_CONFIG = {
    OFFSET: 450,
    DURATION: 400
  };

  static init() {
    if (!this.validateUserAccess()) {
      return;
    }

    this.handlePageHash();
    this.initializeManagers();
    this.populateInterests();
    this.loadUserProfile();
  }

  static validateUserAccess() {
    const currentUser = Utils.getCurrentUser();

    if (!currentUser) {
      window.location.href = "auth.html";
      return false;
    }

    return true;
  }

  static handlePageHash() {
    const hash = window.location.hash;
    if (!hash) return;

    const targetElement = $(hash);
    if (targetElement.length) {
      this.scrollToElement(targetElement);
    }
  }

  static scrollToElement(element) {
    $("html, body").animate(
      {
        scrollTop: element.offset().top + this.SCROLL_CONFIG.OFFSET
      },
      this.SCROLL_CONFIG.DURATION
    );
  }

  static initializeManagers() {
    ProfileFormManager.init();
    ProfileFriendsManager.init();
  }

  static populateInterests() {
    ValidationManager.populateInterestsList();
  }

  static loadUserProfile() {
    ProfileFormManager.loadUserProfile();
  }
}

$(document).ready(() => {
  ProfilePageManager.init();
});

window.ProfilePageManager = ProfilePageManager;
