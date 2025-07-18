﻿namespace NewsSiteBackEnd.BL
{
	public class Article
	{
		public Article(int id, int userId, string title, DateTime publishDate, List<Tag> tags
			, List<Comment> comments, List<Report> reports)
		{
			this.id = id;
			UserId = userId;
			Title = title;
			PublishDate = publishDate;
			Tags = tags;
			Comments = comments;
			Reports = reports;
		}

		public int id { get; set; }
		public int UserId { get; set; }
		public string Title { get; set; }
		public DateTime PublishDate { get; set; }
		public List<Tag> Tags { get; set; }
		public List<Comment> Comments { get; set; }
		public List<Report> Reports { get; set; }


		public Article() { }
		
	}
}
