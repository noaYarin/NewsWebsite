const Utils = {
  formatDate(dateString) {
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
  },

  getNavHref(targetPage) {
    const currentPath = window.location.pathname;
    if (currentPath.includes(`${targetPage}.html`) || (targetPage === "index" && (currentPath.includes("index.html") || currentPath.endsWith("/")))) {
      return "#";
    }
    return `../html/${targetPage}.html`;
  },

  getCurrentUser() {
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
  },

  handleImageError(img, fallbackUrl = CONSTANTS.PLACEHOLDER_IMAGE_URL) {
    if (img.src !== fallbackUrl) {
      img.src = fallbackUrl;
    }
  },

  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  debounce(func, wait) {
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
};

window.Utils = Utils;
