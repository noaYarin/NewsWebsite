class Utils {
  static formatDate(dateString) {
    if (!dateString) return "Unknown Date";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Unknown Date";
    }
  }

  static getNavHref(targetPage) {
    const currentPath = window.location.pathname;
    const isCurrentPage = currentPath.includes(`${targetPage}.html`) || (targetPage === "index" && (currentPath.includes("index.html") || currentPath.endsWith("/")));

    return isCurrentPage ? "#" : `../html/${targetPage}.html`;
  }

  static getCurrentUser() {
    try {
      const userData = localStorage.getItem("currentUser");
      const user = userData ? JSON.parse(userData) : null;
      if (user && !user.imageUrl) {
        user.imageUrl = CONSTANTS.NO_IMAGE_URL;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  static handleImageError(img, fallbackUrl = CONSTANTS.PLACEHOLDER_IMAGE_URL) {
    if (img.src !== fallbackUrl) {
      img.src = fallbackUrl;
    }
  }

  static getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  static buildUrlWithParams(baseUrl, params) {
    const url = new URL(baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.append(key, encodeURIComponent(value));
      }
    });
    return url.toString();
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static formatTimeAgo(dateString) {
    if (!dateString) return "Unknown Time";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return date.toLocaleDateString();
    } catch (error) {
      return "Unknown Time";
    }
  }

  static checkUserAccess(requireAdmin = false, redirectPage = "index.html") {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      window.location.href = "auth.html";
      return null;
    }

    if (requireAdmin && !currentUser.isAdmin) {
      window.location.href = redirectPage;
      return null;
    }

    return currentUser;
  }

  static throttleAnimationFrame(callback) {
    let ticking = false;
    return function (...args) {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback.apply(this, args);
          ticking = false;
        });
        ticking = true;
      }
    };
  }

  static setButtonLoading(button, loadingText) {
    button.text(loadingText).prop("disabled", true);
  }

  static updateButtonState(button, newText, newClasses, oldClasses) {
    button.text(newText).prop("disabled", false).removeClass(oldClasses).addClass(newClasses);
  }

  static resetButtonState(button, originalText) {
    button.text(originalText).prop("disabled", false);
  }

  static createLoadingIndicator(imagePath = "../sources/images/sun/sun.png", altText = "Loading") {
    return `
      <div class="sun-loading">
        <div class="thinking-container">
          <img src="${imagePath}" alt="${altText}" class="thinking-icon" />
        </div>
      </div>
    `;
  }

  static setupInfiniteScroll(container, threshold = 100, callback) {
    container.off("scroll.infiniteScroll").on("scroll.infiniteScroll", () => {
      const scrollTop = container.scrollTop();
      const innerHeight = container.innerHeight();
      const scrollHeight = container[0].scrollHeight;

      if (scrollTop + innerHeight >= scrollHeight - threshold) {
        callback();
      }
    });
  }

  static capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static showInputError($element, duration = 2000) {
    $element.focus().addClass("error");
    setTimeout(() => $element.removeClass("error"), duration);
  }
}

window.Utils = Utils;
