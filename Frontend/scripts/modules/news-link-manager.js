class NewsLinkManager {
  static setupCategoryLinks() {
    const interests = NewsSectionManager.getUserInterests();

    $("#see-more-latest").attr("href", `../html/category.html?name=general`);
    $("#start-your-adventure").attr("href", `../html/category.html?name=travel`);
    $("#see-articles-travel").attr("href", `../html/category.html?name=travel`);
    $("#view-all-trending").attr("href", `../html/category.html?name=general`);

    if (interests[0]) {
      $("#see-more-interest1").attr("href", `../html/category.html?name=${interests[0]}`);
    }

    $(document).on("click", "#personalize-news-btn", () => {
      const currentUser = Utils.getCurrentUser();
      if (currentUser) {
        window.location.href = Utils.getNavHref("profile") + "#select-your-interests";
      } else {
        window.location.href = Utils.getNavHref("auth");
      }
    });
  }
}
