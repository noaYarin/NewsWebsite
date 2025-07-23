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
  },

  formatTimeAgo(dateString) {
    if (!dateString) return "Unknown time";

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
      return "Unknown time";
    }
  }
};

window.Utils = Utils;
