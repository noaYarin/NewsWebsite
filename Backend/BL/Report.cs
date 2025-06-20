namespace Horizon.BL
{
    public class Report
    {
        public int Id { get; set; }
        public Enum Flag { get; set; } //to change
        public User Reporter { get; set; }
        public Article? ToArticle { get; set; }
        public Comment? ToComment { get; set; }
    }
}
