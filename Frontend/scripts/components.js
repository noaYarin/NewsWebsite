$(document).ready(function () {
  // Check if we're on index.html page
  const isIndexPage = window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/");
  const logoHref = isIndexPage ? "#" : "index.html";

  const htmlSnippets = {
    navbar: `
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
        <a href="${logoHref}" class="logo">
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
    const $element = $(`#${id}`);
    if ($element.length) {
      $element.html(htmlSnippets[id]);
    } else {
      console.warn(`Element with ID '${id}' not found. Skipping HTML injection.`);
    }
  }

  setupEventHandlers();
  setupBackToTop();
  updateFooterPosition();

  $(window).on("resize", updateFooterPosition);
});

function setupEventHandlers() {
  const MOBILE_BREAKPOINT = 1024;

  // keyboard handler (Esc to close)
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      if ($("#searchOverlay").hasClass("active")) toggleSearch();
      if ($("#mobileMenu").hasClass("active")) toggleMobileMenu();
    }
  });

  $(window).on("resize", function () {
    if ($(window).width() > MOBILE_BREAKPOINT && $("#mobileMenu").hasClass("active")) {
      toggleMobileMenu();
    }
    // Refocus on search input when resizing with overlay open
    if ($("#searchOverlay").hasClass("active")) {
      setTimeout(() => {
        const inputToFocus = $(window).width() <= MOBILE_BREAKPOINT ? ".mobile-search-input" : ".search-input";
        const $input = $(inputToFocus);
        if ($input.length) {
          $input.focus();
        }
      }, 100);
    }
  });

  $(document).on("click", ".mobile-menu-btn, .mobile-menu-header .close-btn", toggleMobileMenu);
  $(document).on("click", ".nav-right .search-icon, .close-search, .mobile-close-search", toggleSearch);

  $(document).on("click", ".mobile-menu-header .search-icon", function () {
    if ($("#mobileMenu").hasClass("active")) {
      toggleMobileMenu();
    }
    toggleSearch();
  });

  $(document).on("keydown", ".search-input, .mobile-search-input", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = $(this).val().trim();
      if (query) {
        performSearch(query);
      }
    }
  });
}

function setupBackToTop() {
  const $backToTop = $("#backToTop");
  const $footer = $("#footer");

  if (!$backToTop.length) {
    console.warn("Back to top button (#backToTop) not found. Skipping setup.");
    return;
  }

  if (!$footer.length) {
    console.warn("Footer (#footer) not found. Back to top positioning may not work correctly.");
  }

  $(window).on("scroll", function () {
    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();

    if (scrollTop > 600) {
      $backToTop.addClass("visible");
    } else {
      $backToTop.removeClass("visible");
    }

    if ($footer.length) {
      const footerTop = $footer.offset().top;
      const buttonBottom = scrollTop + windowHeight - 30;
      const footerOverlap = buttonBottom + 20 - footerTop;

      if (footerOverlap > 0) {
        // Move button up by the overlap amount
        $backToTop.css({
          bottom: 30 + footerOverlap + "px",
          transition: "bottom 0.3s ease, opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease"
        });
      } else {
        // Reset to original position
        $backToTop.css({
          bottom: "30px",
          transition: "all 0.3s ease"
        });
      }
    }
  });

  $backToTop.on("click", function () {
    $("html, body").scrollTop(0);
  });
}

function toggleMobileMenu() {
  const $mobileMenu = $("#mobileMenu");
  const $searchIcon = $("#navbar .search-icon");

  if (!$mobileMenu.length) {
    console.warn("Mobile menu (#mobileMenu) not found. Cannot toggle.");
    return;
  }

  $mobileMenu.toggleClass("active");

  if ($searchIcon.length) {
    $searchIcon.toggleClass("hide");
  }
}

function toggleSearch() {
  const $overlay = $("#searchOverlay");
  const MOBILE_BREAKPOINT = 1024;

  if (!$overlay.length) {
    console.warn("Search overlay (#searchOverlay) not found. Cannot toggle.");
    return;
  }

  $overlay.toggleClass("active");

  if ($overlay.hasClass("active")) {
    // Focus on search input
    setTimeout(() => {
      const inputToFocus = $(window).width() <= MOBILE_BREAKPOINT ? ".mobile-search-input" : ".search-input";
      const $input = $(inputToFocus);
      if ($input.length) {
        $input.focus();
      } else {
        console.warn(`Search input (${inputToFocus}) not found. Cannot focus.`);
      }
    }, 100);
  }
}

function updateFooterPosition() {
  const $footer = $("#footer");
  if (!$footer.length) {
    console.warn("Footer (#footer) not found. Cannot update position.");
    return;
  }

  const isScrollable = document.body.scrollHeight > window.innerHeight;
  $footer.toggleClass("fixed-footer", !isScrollable);
}

function performSearch(query) {
  if (!query || !query.trim()) {
    console.warn("Empty search query provided.");
    return;
  }

  console.log("Performing search for:", query);

  // TODO: Implement actual search functionality here
  // This is a placeholder for future search implementation

  alert(`Search functionality not yet implemented. Query: "${query}"`);
}
