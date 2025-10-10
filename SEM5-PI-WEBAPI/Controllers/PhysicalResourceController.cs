using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.Domain.PhysicalResources;
using SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Controllers;

[ApiController]
[Route("api/[controller]")]

public class PhysicalResourceController : ControllerBase
{
    private readonly PhysicalResourceService  _service;

    public PhysicalResourceController(PhysicalResourceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PhysicalResourceDTO>>> GetAll()
    {
        return await _service.GetAllAsync();
    }

    [HttpGet("id")]
    public async Task<ActionResult<PhysicalResourceDTO>> GetByID(Guid id)
    {
        var phy = await _service.GetByIdAsync(new PhysicalResourceId(id));

        if (phy == null)
        {
            return NotFound();
        }
        
        return phy;
    }

    [HttpPost]
    public async Task<ActionResult<PhysicalResourceDTO>> Create(CreatingPhysicalResourceDTO dto)
    {
        try
        {
            var phy = await _service.AddAsync(dto);
            
            return CreatedAtAction(nameof(GetByID), new { id = phy.Id }, phy);
        }
        catch (BusinessRuleValidationException e)
        {
           return BadRequest(new { error = e.Message });
        }
    }
}