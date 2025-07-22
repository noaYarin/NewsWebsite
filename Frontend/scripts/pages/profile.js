$(document).ready(function () {
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) {
    window.location.href = "auth.html";
    return;
  }

  if (window.location.hash) {
    const targetElement = $(window.location.hash);
    if (targetElement.length) {
      $("html, body").animate({
        scrollTop: targetElement.offset().top + 450
      });
    }
  }

  ProfileFormManager.init();
  ProfileFriendsManager.init();

  ValidationManager.populateInterestsList();
  ProfileFormManager.loadUserProfile();
});
