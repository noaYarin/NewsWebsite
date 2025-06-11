namespace NewsSiteBackEnd.BL
{
	public class Tag
	{

		public int Id { get; set; }
		public string Name { get; set; }
		public DateTime CreateDate { get; set; }
		
		public Tag(int id, string name, DateTime createDate)
		{
			Id = id;
			Name = name;
			CreateDate = createDate;
		}

		public Tag() { }
	}
}
