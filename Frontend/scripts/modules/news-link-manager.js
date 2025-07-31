class NewsLinkManager {
  static setupCategoryLinks() {
    const interests = NewsSectionManager.getUserInterests();

    $("#see-more-latest").attr("href", `../html/category.html?name=general`);
    $("#see-articles-travel").attr("href", `../html/category.html?name=travel`);
    $("#view-all-trending").attr("href", `../html/category.html?name=general`);

    if (interests[0]) {
      $("#see-more-interest1").attr("href", `../html/category.html?name=${interests[0]}`);
    }
  }
}
