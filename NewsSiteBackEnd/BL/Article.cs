﻿namespace NewsSiteBackEnd.BL
{
	public class Article
	{
		public int id { get; set; }
		public int UserId { get; set; }
		public string Title { get; set; }
		public DateTime PublishDate { get; set; }
		public List<Tag> Tags { get; set; }
		public List<Comment> Comments { get; set; }

		
	}
}
