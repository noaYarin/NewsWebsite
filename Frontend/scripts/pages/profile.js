$(document).ready(function () {
  const userJson = localStorage.getItem("currentUser");
  if (!userJson) {
    window.location.href = "auth.html";
    return;
  }

  ProfileFormManager.init();
  ProfileFriendsManager.init();

  ValidationManager.populateInterestsList();
  ProfileFormManager.loadUserProfile();
});
