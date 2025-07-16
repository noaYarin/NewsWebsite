const MOBILE_BREAKPOINT = 1024;
const SCROLL_THRESHOLD = 1200;

const PLACEHOLDER_IMAGE_URL = "../sources/images/placeholder.png";

function getNavHref(targetPage) {
  const currentPath = window.location.pathname;

  if (currentPath.includes(`${targetPage}.html`) || (targetPage === "index" && (currentPath.includes("index.html") || currentPath.endsWith("/")))) {
    return "#";
  }

  return `../html/${targetPage}.html`;
}

$(document).ready(function () {
  const isAuthPage = window.location.pathname.includes("auth.html");
  const logoHref = getNavHref("index");

  const currentUser = getCurrentUser();
  const isLoggedIn = currentUser !== null;

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
    `,
    mobileMenu: `
      <div class="mobile-menu-header">
        <button class="close-btn">
          <img src="../sources/icons/close-1511-svgrepo-com.svg" alt="Close" />
        </button>
        <img src="../sources/icons/search-svgrepo-com.svg" alt="Search" class="search-icon" ${isAuthPage ? 'style="display: none;"' : ""}/>
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
    `,
    profileMenu: `
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
          <li><a href="${getNavHref("index")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/home-svgrepo-com.svg"></img>
            <span>Home</span>
          </a></li>
          <li><a href="#" class="nav-profile-menu-item nav-profile-menu-search">
            <img class="nav-profile-menu-icon" src="../sources/icons/search-svgrepo-com-menu.svg"></img>
            <span>Search</span>
          </a></li>
          <li><a href="${getNavHref("notifications")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/notifications-svgrepo-com.svg"></img>
            <span>Notifications</span>
          </a></li>
          <li><a href="${getNavHref("bookmarks")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/bookmarks-svgrepo-com.svg"></img>
            <span>Bookmarks</span>
          </a></li>
          <li><a href="${getNavHref("messages")}" class="nav-profile-menu-item">
            <img class="nav-profile-menu-icon" src="../sources/icons/messages-2-svgrepo-com.svg"></img>
            <span>Messages</span>
          </a></li>
          <li><a href="${getNavHref("profile")}" class="nav-profile-menu-item">
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
    `
  };
  // TODO: Remember to make notifications show an icon when there are new notifications and change the icon based on that to - notifications-alert-svgrepo-com.svg

  for (const id in htmlSnippets) {
    const $element = $(`#${id}`);
    if ($element.length) {
      $element.html(htmlSnippets[id]);
    }
  }

  $(document).on("error", "img", function () {
    if ($(this).attr("src") !== PLACEHOLDER_IMAGE_URL) {
      $(this).attr("src", PLACEHOLDER_IMAGE_URL);
    }
  });

  setupEventHandlers();

  if (!isAuthPage) {
    setupAuthNavLinks();
  }

  if ($(window).width() > MOBILE_BREAKPOINT) {
    setupBackToTop();
  }

  setupProfileMenu();
});

function getCurrentUser() {
  try {
    const userData = localStorage.getItem("currentUser");
    const user = userData ? JSON.parse(userData) : null;
    if (user && !user.imageUrl) {
      user.imageUrl = "../sources/images/no-image.png";
    }
    return user;
  } catch (error) {
    return null;
  }
}

function setupProfileMenu() {
  $(document).on("click", ".nav-profile-picture", function (e) {
    e.preventDefault();
    toggleProfileMenu();
  });

  $(document).on("click", ".nav-profile-menu-close", function () {
    toggleProfileMenu();
  });

  $(document).on("click", ".nav-profile-logout-btn", function () {
    logout();
  });

  $(document).on("click", function (e) {
    if ($("#profileMenu").hasClass("active") && !$(e.target).closest("#profileMenu").length && !$(e.target).closest(".nav-profile-picture").length) {
      toggleProfileMenu();
    }
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && $("#profileMenu").hasClass("active")) {
      toggleProfileMenu();
    }
  });
}

function toggleProfileMenu() {
  const $profileMenu = $("#profileMenu");

  if (!$profileMenu.length) {
    return;
  }

  $profileMenu.toggleClass("active");
}

function logout() {
  try {
    localStorage.removeItem("currentUser");
    showPopup("Logged out successfully!", true);

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    showPopup("Error during logout. Please try again.", false);
  }
}

function setupEventHandlers() {
  let debounceTimer;
  let lastQuery = "";

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      if ($("#searchOverlay").hasClass("active")) toggleSearch();
      if ($("#mobileMenu").hasClass("active")) toggleMobileMenu();
      if ($("#profileMenu").hasClass("active")) toggleProfileMenu();
    }
  });

  $(window).on("resize", function () {
    if ($(window).width() > MOBILE_BREAKPOINT && $("#mobileMenu").hasClass("active")) {
      toggleMobileMenu();
    }
    if ($(window).width() > MOBILE_BREAKPOINT && $("#profileMenu").hasClass("active")) {
      toggleProfileMenu();
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
  $(document).on("click", ".nav-profile-menu-search", function (e) {
    e.preventDefault();
    if ($("#profileMenu").hasClass("active")) {
      toggleProfileMenu();
    }
    toggleSearch();
  });

  $(document).on("click", ".mobile-menu-header .search-icon", function () {
    if ($("#mobileMenu").hasClass("active")) {
      toggleMobileMenu();
    }
    toggleSearch();
  });

  $(document).on("input", ".search-input, .mobile-search-input", function () {
    clearTimeout(debounceTimer);
    const query = $(this).val().trim();

    debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 500);
  });

  $(document).on("keydown", ".search-input, .mobile-search-input", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(debounceTimer);
      const query = $(this).val().trim();
      handleSearch(query);
    }
  });

  function handleSearch(query) {
    if (query.length > 2) {
      if (query !== lastQuery) {
        lastQuery = query;
        performSearch(query);
      }
    } else {
      $("main").show();
      lastQuery = "";
    }
  }

  function performSearch(query) {
    showPopup(`Searching for: "${query}"`, true);
    $("main").hide();

    // TODO: Implement actual search functionality here
    showPopup(`Search functionality not yet implemented. Query: "${query}"`, "muted");
  }
}

function setupAuthNavLinks() {
  $(document).on("click", ".login-btn, .mobile-login-btn", () => {
    window.location.href = getNavHref("auth");
  });

  $(document).on("click", ".subscribe-btn, .mobile-subscribe-btn", () => {
    // TODO: Implement subscription functionality
    showPopup("Subscribe functionality coming soon!", "muted");
  });
}

function setupBackToTop() {
  const $backToTop = $("#backToTop");
  const $footer = $("#footer");

  if (!$backToTop.length) {
    return;
  }

  $(window).on("scroll", function () {
    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();

    if (scrollTop > SCROLL_THRESHOLD) {
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
    return;
  }

  $mobileMenu.toggleClass("active");

  if ($searchIcon.length) {
    $searchIcon.toggleClass("hide");
  }
}

function toggleSearch() {
  const $overlay = $("#searchOverlay");

  if (!$overlay.length) {
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
      }
    }, 100);
  } else {
    if ($("main").is(":hidden")) {
      $("main").show();
    }
  }
}

function showPopup(message, colorFlag) {
  if (typeof colorFlag === "boolean") {
    colorFlag = colorFlag ? "success" : "failure";
  } else if (typeof colorFlag !== "string") {
    colorFlag = "failure";
  }

  let $popup = $("#popup");
  if ($popup.length > 0) {
    $popup.remove();
  }

  $popup = $("<div></div>").attr("id", "popup").addClass("popup").addClass(colorFlag).text(message);
  $("body").append($popup);

  $popup[0].offsetHeight;
  $popup.addClass("show");

  setTimeout(() => {
    $popup.removeClass("show");
    setTimeout(() => {
      $popup.remove();
    }, 500);
  }, 2000);
}

function showDialog(message, isReportDialog = false) {
  return new Promise((resolve) => {
    $("#dialog-popup").remove();

    const $dialog = $("<div></div>").attr("id", "dialog-popup").addClass("dialog-popup");
    const $message = $("<p></p>").addClass("dialog-message").text(message);
    const $actions = $("<div></div>").addClass("dialog-actions");
    const $yesButton = $("<button>Yes</button>").addClass("dialog-yes");
    const $noButton = $("<button>No</button>").addClass("dialog-no");

    const closeDialog = (value) => {
      $(document).off("click.dialog");

      $dialog.removeClass("show");
      setTimeout(() => {
        $dialog.remove();
      }, 400);
      resolve(value);
    };

    $yesButton.on("click", () => {
      if (isReportDialog) {
        transformToReportForm($dialog, $message, $actions, closeDialog);
      } else {
        closeDialog(true);
      }
    });

    $noButton.on("click", () => {
      closeDialog(false);
    });

    $actions.append($yesButton, $noButton);
    $dialog.append($message, $actions);
    $("body").append($dialog);

    setTimeout(() => {
      $dialog.addClass("show");

      setTimeout(() => {
        $(document).on("click.dialog", (event) => {
          if (!$(event.target).closest("#dialog-popup").length) {
            closeDialog(false);
          }
        });
      }, 0);
    }, 10);
  });
}

function transformToReportForm($dialog, $message, $actions, closeDialog) {
  $message.text("Please provide a reason for reporting this comment");

  $dialog.addClass("report-dialog");
  const $inputContainer = $("<div></div>").addClass("dialog-input-container");
  const $textarea = $("<textarea></textarea>").addClass("dialog-textarea").attr("placeholder", "Enter your report here...").attr("max-length", "200");
  const $sendButton = $("<button><img src='../sources/icons/send-alt-1-svgrepo-com.svg' alt='Send' /></button>").addClass("dialog-send");

  const $newActions = $("<div></div>").addClass("dialog-actions");

  $sendButton.on("click", () => {
    const reportText = $textarea.val().trim();
    if (reportText === "") {
      $textarea.focus();
      $textarea.addClass("error");
      setTimeout(() => $textarea.removeClass("error"), 2000);
      return;
    }
    closeDialog({ reported: true, reason: reportText });
  });

  $inputContainer.append($textarea, $sendButton);
  $newActions.append();

  $dialog.addClass("transforming");

  setTimeout(() => {
    $actions.fadeOut(200, () => {
      $actions.remove();
      $dialog.append($inputContainer, $newActions);

      setTimeout(() => {
        $dialog.addClass("expanded");
        $inputContainer.addClass("show");
        $textarea.focus();
      }, 50);
    });
  }, 100);
}
