class HTMLSnippets {
  static init() {
    this.loadSnippets();
  }

  static loadSnippets() {
    const pageContext = this.getPageContext();
    const snippets = this.generateSnippets(pageContext);

    for (const id in snippets) {
      const $element = $(`#${id}`);
      if ($element.length) {
        $element.html(snippets[id]);
      }
    }
  }

  static getPageContext() {
    const isAuthPage = window.location.pathname.includes("auth.html");
    const logoHref = Utils.getNavHref("index");
    const currentUser = Utils.getCurrentUser();
    const isLoggedIn = currentUser !== null;

    return { isAuthPage, logoHref, currentUser, isLoggedIn };
  }

  static generateSnippets(context) {
    return {
      navbar: this.generateNavbar(context),
      mobileMenu: this.generateMobileMenu(context),
      footer: this.generateFooter(),
      profileMenu: this.generateProfileMenu(context)
    };
  }

  static generateNavbar(context) {
    const { isAuthPage, logoHref, currentUser, isLoggedIn } = context;

    return `
      <div class="nav-left">
        ${this.generateNavLeft(logoHref)}
      </div>
      <div class="nav-right" ${isAuthPage ? 'style="display: none;"' : ""}>
        <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="search-icon" />
        ${this.generateNavRight(currentUser, isLoggedIn)}
      </div>
      ${this.generateSearchOverlay(logoHref, currentUser, isLoggedIn)}
    `;
  }

  static generateNavLeft(logoHref) {
    const categoryLinks = CONSTANTS.NAV_CATEGORIES.map((category) => `<li><a href="../html/category.html?name=${category}">${Utils.capitalizeFirst(category)}</a></li>`).join("");
    return `
      <button class="mobile-menu-btn">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <a href="${logoHref}" class="logo">
        <div class="logo-icon">
          <img src="../sources/logo.png" alt="Logo" />
        </div>
      </a>
      <ul class="nav-items">
        ${categoryLinks}
      </ul>
    `;
  }

  static generateNavRight(currentUser, isLoggedIn) {
    if (isLoggedIn) {
      return `
        ${this.generateNotificationsContainer()}
        <div class="nav-profile-container">
          <img src="${currentUser.imageUrl}" alt="Profile" class="nav-profile-picture" />
        </div>
      `;
    }

    return `<button class="login-btn">Log In</button>`;
  }

  static generateNotificationsContainer() {
    return `
      <div class="nav-notifications-container">
        <button class="nav-notifications-btn">
          <img src="../sources/icons/notifications-svgrepo-com.svg" alt="Notifications" class="nav-notifications-icon" />
          <span class="nav-notifications-badge" style="display: none;">0</span>
        </button>
        <div class="nav-notifications-dropdown">
          <div class="nav-notifications-header">
            <h4>Notifications</h4>
            <a href="../html/notifications.html" class="nav-notifications-view-all">View All</a>
          </div>
          <div class="nav-notifications-list">
            ${Utils.createLoadingIndicator("../sources/images/sun/sun.png", "Loading")}
          </div>
        </div>
      </div>
    `;
  }

  static generateSearchOverlay(logoHref, currentUser, isLoggedIn) {
    return `
      <div class="search-overlay" id="searchOverlay">
        <a href="${logoHref}" class="logo">
          <div class="logo-icon">
            <img src="../sources/logo.png" />
          </div>
        </a>
        <div class="search-container">
          <div class="search-scope-indicator" style="display: none;">
            <span>Bookmarks</span>
            <button class="remove-scope" title="Remove filter">
              <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Remove scope" />
            </button>
          </div>
          <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="search-icon" style="display: none" />
          <input type="text" class="search-input" placeholder="Search Here..." autofocus />
          <button class="close-search">
            <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
          </button>
        </div>
        <div class="nav-right">
          ${this.generateNavRight(currentUser, isLoggedIn)}
        </div>
        <div class="mobile-search-header">
          <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="mobile-search-icon" />
          <input type="text" class="mobile-search-input" placeholder="Search Here..." autofocus />
          <button class="mobile-close-search">
            <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
          </button>
        </div>
      </div>
    `;
  }

  static generateMobileMenu(context) {
    const { isAuthPage, isLoggedIn } = context;
    const categoryLinks = CONSTANTS.NAV_CATEGORIES.map((category) => `<li><a href="../html/category.html?name=${category}">${Utils.capitalizeFirst(category)}</a></li>`).join("");
    return `
      <div class="mobile-menu-header">
        <button class="close-btn">
          <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
        </button>
        <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="search-icon" ${isAuthPage ? 'style="display: none;"' : ""} />
      </div>
      <ul class="mobile-nav-items">
        ${categoryLinks}
      </ul>
      <div class="mobile-menu-footer" ${isAuthPage ? 'style="display: none;"' : ""}>
        ${isLoggedIn ? "" : '<button class="mobile-login-btn">LOG IN</button>'}
      </div>
    `;
  }

  static generateFooter() {
    return `
      <div class="footer-content">
        <div class="footer-logo">
          <img src="../sources/logo_name.png" alt="Logo" />
        </div>
        <div class="footer-copy">
          <span>Copyright © 2008-2015 Horizon Society</span>
          <span class="pipe">|</span>
          <span>Copyright © 2015-2025 Horizon Partners, LLC. All rights reserved</span>
        </div>
      </div>
    `;
  }

  static generateProfileMenu(context) {
    const { currentUser, isLoggedIn } = context;

    return `
      <div class="nav-profile-menu-header">
        ${this.generateProfileHeader(currentUser, isLoggedIn)}
      </div>
      <div class="nav-profile-menu-content">
        ${this.generateProfileMenuItems(currentUser, isLoggedIn)}
      </div>
      <div class="nav-profile-menu-footer">
        <button class="nav-profile-logout-btn">
          <span>Log Out</span>
        </button>
      </div>
    `;
  }

  static generateProfileHeader(currentUser, isLoggedIn) {
    return `
      <div class="nav-profile-info">
        <img src="${isLoggedIn ? currentUser.imageUrl : ""}" alt="Profile" class="nav-profile-menu-picture" />
        <div class="nav-profile-details">
          <h3>${isLoggedIn ? `${currentUser.firstName} ${currentUser.lastName}` : ""}</h3>
          <p>${isLoggedIn ? currentUser.email : ""}</p>
        </div>
      </div>
      <button class="nav-profile-menu-close">
        <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
      </button>
    `;
  }

  static generateProfileMenuItems(currentUser, isLoggedIn) {
    const menuItems = [
      { href: Utils.getNavHref("index"), icon: "home-svgrepo-com.svg", text: "Home" },
      { href: "#", icon: "search-svgrepo-com-menu.svg", text: "Search", class: "nav-profile-menu-search" },
      { href: Utils.getNavHref("notifications"), icon: "notifications-svgrepo-com.svg", text: "Notifications" },
      { href: "#", icon: "profile-plus-round-1324-svgrepo-com.svg", text: "Add Friend", class: "nav-profile-menu-add-friend" },
      { href: Utils.getNavHref("bookmarks"), icon: "bookmarks-svgrepo-com.svg", text: "Bookmarks" },
      { href: Utils.getNavHref("profile"), icon: "user-svgrepo-com.svg", text: "Profile Settings" }
    ];

    const menuItemsHTML = menuItems.map((item) => this.generateMenuItem(item)).join("");

    const adminItem =
      isLoggedIn && currentUser.isAdmin
        ? this.generateMenuItem({
            href: Utils.getNavHref("admin"),
            icon: "dashboard-1-svgrepo-com.svg",
            text: "Admin Dashboard",
            class: "nav-profile-menu-admin"
          })
        : "";

    return `
      <ul class="nav-profile-menu-items">
        ${menuItemsHTML}
        ${adminItem}
      </ul>
    `;
  }

  static generateMenuItem(item) {
    const cssClass = item.class ? ` ${item.class}` : "";
    return `
      <li>
        <a href="${item.href}" class="nav-profile-menu-item${cssClass}">
          <img class="nav-profile-menu-icon" src="../sources/icons/${item.icon}" />
          <span>${item.text}</span>
        </a>
      </li>
    `;
  }
}

window.HTMLSnippets = HTMLSnippets;
