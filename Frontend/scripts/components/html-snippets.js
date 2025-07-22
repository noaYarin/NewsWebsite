const HTMLSnippets = {
  init() {
    this.loadSnippets();
  },

  loadSnippets() {
    const isAuthPage = window.location.pathname.includes("auth.html");
    const logoHref = Utils.getNavHref("index");
    const currentUser = Utils.getCurrentUser();
    const isLoggedIn = currentUser !== null;

    const snippets = this.generateSnippets(isAuthPage, logoHref, currentUser, isLoggedIn);

    for (const id in snippets) {
      const $element = $(`#${id}`);
      if ($element.length) {
        $element.html(snippets[id]);
      }
    }
  },

  generateSnippets(isAuthPage, logoHref, currentUser, isLoggedIn) {
    return {
      navbar: this.generateNavbar(isAuthPage, logoHref, currentUser, isLoggedIn),
      mobileMenu: this.generateMobileMenu(isAuthPage, isLoggedIn),
      footer: this.generateFooter(),
      profileMenu: this.generateProfileMenu(currentUser, isLoggedIn)
    };
  },

  generateNavbar(isAuthPage, logoHref, currentUser, isLoggedIn) {
    return `
      <div class="nav-left">
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
          <li><a href="../html/category.html?name=business">Business</a></li>
          <li><a href="../html/category.html?name=entertainment">Entertainment</a></li>
          <li><a href="../html/category.html?name=health">Health</a></li>
          <li><a href="../html/category.html?name=science">Science</a></li>
          <li><a href="../html/category.html?name=sports">Sports</a></li>
          <li><a href="../html/category.html?name=technology">Technology</a></li>
          <li><a href="../html/category.html?name=general">More</a></li>
        </ul>
      </div>
      <div class="nav-right" ${isAuthPage ? 'style="display: none;"' : ""}>
        <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="search-icon" />
        ${
          isLoggedIn
            ? `
          <div class="nav-profile-container">
            <img src="${currentUser.imageUrl}" alt="Profile" class="nav-profile-picture" />
          </div>
        `
            : `
          <button class="login-btn">Log In</button>
        `
        }
        <button class="subscribe-btn"><span>Subscribe</span></button>
      </div>
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
          <input
            type="text"
            class="search-input"
            placeholder="Search Here..."
            autofocus
          />
          <button class="close-search">
            <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
          </button>
        </div>
        <div class="nav-right">
          ${
            isLoggedIn
              ? `
            <div class="nav-profile-container">
              <img src="${currentUser.imageUrl}" alt="Profile" class="nav-profile-picture" />
            </div>
          `
              : `
            <button class="login-btn">Log In</button>
          `
          }
          <button class="subscribe-btn"><span>Subscribe</span></button>
        </div>
        <div class="mobile-search-header">
          <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="mobile-search-icon" />
          <input
            type="text"
            class="mobile-search-input"
            placeholder="Search Here..."
            autofocus
          />
          <button class="mobile-close-search">
            <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
          </button>
        </div>
      </div>
    `;
  },

  generateMobileMenu(isAuthPage, isLoggedIn) {
    return `
      <div class="mobile-menu-header">
        <button class="close-btn">
          <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
        </button>
        <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="search-icon" ${isAuthPage ? 'style="display: none;"' : ""}/>
      </div>
      <ul class="mobile-nav-items">
        <li><a href="../html/category.html?name=business">Business</a></li>
        <li><a href="../html/category.html?name=entertainment">Entertainment</a></li>
        <li><a href="../html/category.html?name=health">Health</a></li>
        <li><a href="../html/category.html?name=science">Science</a></li>
        <li><a href="../html/category.html?name=sports">Sports</a></li>
        <li><a href="../html/category.html?name=technology">Technology</a></li>
        <li><a href="../html/category.html?name=general">More</a></li>
      </ul>
      <div class="mobile-menu-footer" ${isAuthPage ? 'style="display: none;"' : ""}>
        ${
          isLoggedIn
            ? ``
            : `
          <button class="mobile-login-btn">LOG IN</button>
        `
        }
        <button class="mobile-subscribe-btn">SUBSCRIBE</button>
      </div>
    `;
  },

  generateFooter() {
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
  },

  generateProfileMenu(currentUser, isLoggedIn) {
    return `
      <div class="nav-profile-menu-header">
        <div class="nav-profile-info">
          <img src="${isLoggedIn ? currentUser.imageUrl : ""}" alt="Profile" class="nav-profile-menu-picture" />
          <div class="nav-profile-details">
            <h3>${isLoggedIn ? currentUser.firstName + " " + currentUser.lastName : ""}</h3>
            <p>${isLoggedIn ? currentUser.email : ""}</p>
          </div>
        </div>
        <button class="nav-profile-menu-close">
          <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
        </button>
      </div>
      <div class="nav-profile-menu-content">
        <ul class="nav-profile-menu-items">
          <li><a href="${Utils.getNavHref("index")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/home-svgrepo-com.svg"></img>
            <span>Home</span>
          </a></li>
          <li><a href="#" class="nav-profile-menu-item nav-profile-menu-search">
            <img class="nav-profile-menu-icon" src="../sources/icons/search-svgrepo-com-menu.svg"></img>
            <span>Search</span>
          </a></li>
          <li><a href="${Utils.getNavHref("notifications")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/notifications-svgrepo-com.svg"></img>
            <span>Notifications</span>
          </a></li>
          <li><a href="#" class="nav-profile-menu-item nav-profile-menu-add-friend">
            <img class="nav-profile-menu-icon" src="../sources/icons/profile-plus-round-1324-svgrepo-com.svg"></img>
            <span>Add Friend</span>
          </a></li>
          <li><a href="${Utils.getNavHref("bookmarks")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/bookmarks-svgrepo-com.svg"></img>
            <span>Bookmarks</span>
          </a></li>
          <li><a href="${Utils.getNavHref("messages")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/messages-2-svgrepo-com.svg"></img>
            <span>Messages</span>
          </a></li>
          <li><a href="${Utils.getNavHref("profile")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/user-svgrepo-com.svg"></img>
            <span>Profile Settings</span>
          </a></li>
        </ul>
      </div>
      <div class="nav-profile-menu-footer">
        <button class="nav-profile-logout-btn">
          <span>Log Out</span>
        </button>
      </div>
    `;
  }
};

window.HTMLSnippets = HTMLSnippets;
