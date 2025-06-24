using System.Xml.Linq;

namespace Horizon.BL
{
    public class Article
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Title { get; set; }
        public DateTime PublishDate { get; set; }
        public List<Tag> Tags { get; set; }
        public List<Comment> Comments { get; set; }
        public List<Report> Reports { get; set; }

        public Article(int id, int userId, string title, DateTime publishDate, List<Tag> tags, List<Comment> comments, List<Report> reports)
        {
            Id = id;
            UserId = userId;
            Title = title;
            PublishDate = publishDate;
            Tags = tags;
            Comments = comments;
            Reports = reports;
        }

        public Article() { }

        public List<Article> Read()
        {
            DBservices db = new DBservices();
            return db.GetAllArticles();
        }

    }
}
