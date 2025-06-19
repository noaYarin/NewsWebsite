$(document).ready(function () {
  const htmlSnippets = {
    navbar: `
      <div class="nav-left">
        <button class="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <a href="#" class="logo">
          <div class="logo-icon">
            <img src="../sources/logo.png" alt="Logo" />
          </div>
        </a>
        <ul class="nav-items">
          <li><a href="#">Business</a></li>
          <li><a href="#">Entertainment</a></li>
          <li><a href="#">Health</a></li>
          <li><a href="#">Science</a></li>
          <li><a href="#">Sports</a></li>
          <li><a href="#">Technology</a></li>
          <li><a href="#">More</a></li>
        </ul>
      </div>
      <div class="nav-right">
        <div class="search-icon"></div>
        <button class="login-btn">Log In</button>
        <button class="signup-btn"><span>Sign Up</span></button>
      </div>
      <div class="search-overlay" id="searchOverlay">
        <a href="#" class="logo">
          <div class="logo-icon">
            <img src="../sources/logo.png" />
          </div>
        </a>
        <div class="search-container">
          <div class="search-icon" style="display: none"></div>
          <input
            type="text"
            class="search-input"
            placeholder="Search Here..."
            autofocus
          />
          <button class="close-search">✕</button>
        </div>
        <div class="nav-right">
          <button class="login-btn">Log In</button>
          <button class="signup-btn"><span>Sign Up</span></button>
        </div>
        <div class="mobile-search-header">
          <div class="mobile-search-icon"></div>
          <input
            type="text"
            class="mobile-search-input"
            placeholder="Search Here..."
            autofocus
          />
          <button class="mobile-close-search">✕</button>
        </div>
      </div>
    `,
    mobileMenu: `
      <div class="mobile-menu-header">
        <button class="close-btn">✕</button>
        <div class="search-icon"></div>
      </div>
      <ul class="mobile-nav-items">
        <li><a href="#">Business</a></li>
        <li><a href="#">Entertainment</a></li>
        <li><a href="#">Health</a></li>
        <li><a href="#">Science</a></li>
        <li><a href="#">Sports</a></li>
        <li><a href="#">Technology</a></li>
        <li><a href="#">More</a></li>
      </ul>
      <div class="mobile-menu-footer">
        <button class="mobile-login-btn">LOG IN</button>
        <button class="mobile-signup-btn">SIGN UP</button>
      </div>
    `,
    footer: `
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
    `
  };

  for (const id in htmlSnippets) {
    $(`#${id}`).html(htmlSnippets[id]);
  }

  setupEventHandlers();
  updateFooterPosition();

  $(window).on("resize", updateFooterPosition);
});

function setupEventHandlers() {
  // keyboard handler (Esc to close)
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      if ($("#searchOverlay").hasClass("active")) toggleSearch();
      if ($("#mobileMenu").hasClass("active")) toggleMobileMenu();
    }
  });

  // resize handler (auto-close/focus)
  $(window).on("resize", function () {
    if ($(window).width() > 768 && $("#mobileMenu").hasClass("active")) {
      toggleMobileMenu();
    }
    // Refocus on search input when resizing with overlay open
    if ($("#searchOverlay").hasClass("active")) {
      setTimeout(() => {
        const inputToFocus = $(window).width() <= 768 ? ".mobile-search-input" : ".search-input";
        $(inputToFocus).focus();
      }, 100);
    }
  });

  // Event delegation for toggling menus and search
  $(document).on("click", ".mobile-menu-btn, .mobile-menu-header .close-btn", toggleMobileMenu);
  $(document).on("click", ".nav-right .search-icon, .close-search, .mobile-close-search", toggleSearch);

  $(document).on("click", ".mobile-menu-header .search-icon", function () {
    if ($("#mobileMenu").hasClass("active")) {
      toggleMobileMenu();
    }
    toggleSearch();
  });
}

function toggleMobileMenu() {
  $("#mobileMenu").toggleClass("active");
  $("#navbar .search-icon").toggleClass("hide");
}

function toggleSearch() {
  const $overlay = $("#searchOverlay");
  $overlay.toggleClass("active");

  if ($overlay.hasClass("active")) {
    setTimeout(() => {
      const inputToFocus = $(window).width() <= 768 ? ".mobile-search-input" : ".search-input";
      $(inputToFocus).focus();
    }, 100); // Ensures element is visible before focusing
  }
}

function updateFooterPosition() {
  const $footer = $("#footer");
  const isScrollable = document.body.scrollHeight > window.innerHeight;
  $footer.toggleClass("fixed-footer", !isScrollable);
}
