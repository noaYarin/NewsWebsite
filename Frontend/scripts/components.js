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
          <img src="../sources/logo.png" />
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
};

$(document).ready(function () {
  // inject snippets
  for (const key in htmlSnippets) {
    const sel = `.${key}, #${key}`;
    if ($(sel).length) {
      $(sel).html(htmlSnippets[key]);
    }
  }
  setupEventHandlers();
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
    if ($("#searchOverlay").hasClass("active")) {
      setTimeout(() => {
        if ($(window).width() <= 768) {
          $(".mobile-search-input").focus();
        } else {
          $(".search-input").focus();
        }
      }, 100);
    }
  });

  // click handlers instead of inline onclick
  $(document).on("click", ".mobile-menu-btn", toggleMobileMenu);
  $(document).on("click", ".mobile-menu-header .close-btn", toggleMobileMenu);

  // in mobile-menu, clicking the search-icon opens both menu & search
  $(document).on("click", ".mobile-menu-header .search-icon", function () {
    toggleMobileMenu();
    toggleSearch();
  });

  $(document).on("click", ".nav-right .search-icon", toggleSearch);
  $(document).on("click", ".close-search, .mobile-close-search", toggleSearch);
}

function toggleMobileMenu() {
  $("#mobileMenu").toggleClass("active");
  $(".search-icon").first().toggleClass("hide");
}

function toggleSearch() {
  const $o = $("#searchOverlay");
  $o.toggleClass("active");
  if ($o.hasClass("active")) {
    setTimeout(() => {
      if ($(window).width() <= 768) {
        $(".mobile-search-input").focus();
      } else {
        $(".search-input").focus();
      }
    }, 100);
  }
}
