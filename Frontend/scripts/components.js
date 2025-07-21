const ComponentsManager = {
  init() {
    if (typeof HTMLSnippets !== "undefined") {
      HTMLSnippets.init();
    }

    this.setupImageErrorHandling();
    this.setupKeyboardWatcher();

    if (typeof Navigation !== "undefined") {
      Navigation.init();
    }

    if (typeof SearchManager !== "undefined") {
      SearchManager.init();
    }

    const isAuthPage = window.location.pathname.includes("auth.html");
    if (!isAuthPage && $(window).width() > (window.CONSTANTS ? CONSTANTS.MOBILE_BREAKPOINT : 1024)) {
      if (typeof BackToTop !== "undefined") {
        BackToTop.init();
      }
    }
  },

  setupImageErrorHandling() {
    $(document).on("error", "img", function () {
      const fallbackUrl = window.CONSTANTS ? CONSTANTS.PLACEHOLDER_IMAGE_URL : "../sources/images/placeholder.png";
      if ($(this).attr("src") !== fallbackUrl) {
        $(this).attr("src", fallbackUrl);
      }
    });
  },

  setupKeyboardWatcher() {
    if (!window.visualViewport) return;

    const initialHeight = window.visualViewport.height;
    window.visualViewport.addEventListener("resize", () => {
      const currentHeight = window.visualViewport.height;
      if (currentHeight < initialHeight * 0.9) {
        const keyboardHeight = window.innerHeight - currentHeight;
        document.documentElement.style.setProperty("--keyboard-inset", `${keyboardHeight}px`);
        document.body.classList.add("keyboard-active");
      } else {
        document.documentElement.style.setProperty("--keyboard-inset", "0px");
        document.body.classList.remove("keyboard-active");
      }
    });
  }
};

$(document).ready(() => ComponentsManager.init());
