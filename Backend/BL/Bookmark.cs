using Horizon.DAL;
using System.Collections.Generic;

namespace Horizon.BL
{
    public class Bookmark
    {
        public static bool Toggle(int userId, int articleId)
        {
            var bookmarkService = new BookmarkService();
            return bookmarkService.ToggleBookmark(userId, articleId);
        }

        public static bool IsArticleBookmarked(int userId, int articleId)
        {
            var bookmarkService = new BookmarkService();
            return bookmarkService.IsArticleBookmarked(userId, articleId);
        }

        public static List<Article> GetUserBookmarks(int userId)
        {
            var bookmarkService = new BookmarkService();
            return bookmarkService.GetUserBookmarks(userId);
        }

        public static List<Article> Search(int userId, string searchTerm)
        {
            var bookmarkService = new BookmarkService();
            return bookmarkService.SearchUserBookmarks(userId, searchTerm);
        }
    }
}
