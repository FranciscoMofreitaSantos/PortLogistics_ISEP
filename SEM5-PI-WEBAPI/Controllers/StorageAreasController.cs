using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;

namespace SEM5_PI_WEBAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StorageAreasController: ControllerBase
{
    private readonly ILogger<StorageAreasController> _logger;
    private readonly StorageAreaService _service;
    
    public StorageAreasController(ILogger<StorageAreasController> logger, StorageAreaService service)
    {
        _logger = logger;
        _service = service;
    }


    [HttpGet]
    public async Task<ActionResult<List<StorageAreaDto>>> GetAllAsync()
    {
        try
        {
            var listStorageAreaDto = await _service.GetAllAsync();
            return Ok( listStorageAreaDto);
        }
        catch (BusinessRuleValidationException e)
        {
            return NotFound();
        }
    }
}