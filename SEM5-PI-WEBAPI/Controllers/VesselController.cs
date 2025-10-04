using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.Domain.Vessels;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VesselController : ControllerBase
{
    
    private readonly ILogger<VesselController> _logger;
    private readonly VesselService _service;


    public VesselController(VesselService service, ILogger<VesselController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<VesselDto>>> GetAllAsync()
    {
        _logger.LogInformation("API Request: Get All Vessels on DataBase");
            
        var listVesselDtos = await _service.GetAllAsync();
            
        if (listVesselDtos.Count > 0) 
            _logger.LogWarning("API Response (200): A total of {count} were found -> {@Vessels}", listVesselDtos.Count, listVesselDtos);
        else 
            _logger.LogWarning("API Response (400): No Vessels found on DataBase"); 
            
        return Ok(listVesselDtos);
    }
}