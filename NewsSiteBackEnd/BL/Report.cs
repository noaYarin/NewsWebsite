namespace NewsSiteBackEnd.BL
{
	public class Report
	{
		public int Id { get; set; }
		public Enum  Flag { get; set; } //to change
		public User Reporter { get; set; }
		
	}
}
