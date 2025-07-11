using Horizon.BL;
using Horizon.DAL;
using Horizon.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace Horizon.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly TagService _tagService;

    public TagsController()
    {
        _tagService = new TagService();
    }

    [HttpPost]
    public IActionResult AddTag([FromBody] AddTagRequestDto request)
    {
        var tag = new Tag { Name = request.Name, ImageUrl = request.ImageUrl };
        bool success = _tagService.AddTag(tag);

        if (!success)
        {
            return Conflict("A tag with this name already exists.");
        }
        return Ok(tag);
    }
}