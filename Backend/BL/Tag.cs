using Horizon.DAL;

namespace Horizon.BL;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? ImageUrl { get; set; }

    public Tag() { }

    public Tag(int id, string name, string? imageUrl)
    {
        Id = id;
        Name = name;
        ImageUrl = imageUrl;
    }

    public static bool AddTag(Tag tag)
    {
        var tagService = new TagService();
        return tagService.AddTag(tag);
    }
}