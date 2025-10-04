using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.Domain.Shared;
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

    
    [HttpGet("id/{id:guid}")]
    public async Task<ActionResult<VesselTypeDto>> GetById(Guid id)
    {
        _logger.LogInformation("API Request: Fetching Vessel with ID = {Id}", id);
            
        try
        {
            var vesselDto = await _service.GetByIdAsync(new VesselId(id));
            _logger.LogWarning("API Response (200): Vessel with ID = {Id} -> FOUND", id);
            return Ok(vesselDto);
        }
        catch (BusinessRuleValidationException ex)
        {
            _logger.LogWarning("API Error (404): Vessel with ID = {Id} -> NOT FOUND", id);
            return NotFound(ex.Message);
        }
    }
    
    [HttpPost]
    public async Task<ActionResult<VesselDto>> CreateAsync(CreatingVesselDto creatingVesselDto)
    {
        try
        {
            _logger.LogInformation("API Request: Add Vessel with body = {@Dto}", creatingVesselDto);

            var vesselDto = await _service.CreateAsync(creatingVesselDto);
            _logger.LogInformation("API Response (201): Vessel created with IMO Number [{IMO}] and System ID [{ID}].", vesselDto.ImoNumber,vesselDto.Id);

            return CreatedAtAction(nameof(GetById), new { id = vesselDto.Id }, vesselDto);
        }
        catch (BusinessRuleValidationException e)
        {
            _logger.LogWarning("API Error (404): {Message}", e.Message);
            return BadRequest(e.Message);
        }
    }

    [HttpGet("imo/{imo}")]
    public async Task<ActionResult<VesselDto>> GetByImoAsync(string imo)
    {
        try
        {
            _logger.LogInformation("API Request: Fetching Vessel with IMO Number = {IMO}", imo);
            
            var vesselDto = await _service.GetByImoNumberAsync(imo);
            
            _logger.LogWarning("API Response (200): Vessel with IMO Number = {IMO} -> FOUND", imo);
            
            return Ok(vesselDto);

        }
        catch (BusinessRuleValidationException e)
        {
            _logger.LogWarning("API Error (404): {Message}", e.Message);
            return NotFound(e.Message);
        }
    }
    
    [HttpGet("name/{name}")]
    public async Task<ActionResult<List<VesselDto>>> GetByNameAsync(string name)
    {
        try
        {
            _logger.LogInformation("API Request: Fetching Vessel with Name = {NAME}", name);
            
            var vesselListDto = await _service.GetByNameAsync(name);
            
            _logger.LogWarning("API Response (200): Vessel with IMO Number = {NAME} -> FOUND", name);
            
            return Ok(vesselListDto);

        }
        catch (BusinessRuleValidationException e)
        {
            _logger.LogWarning("API Error (404): {Message}", e.Message);
            return NotFound(e.Message);
        }
    }

    [HttpGet("owner/{owner}")]
    public async Task<ActionResult<VesselDto>> GetByOwnerAsync(string owner)
    {
        try
        {
            _logger.LogInformation("API Request: Fetching Vessel with Owner = {OWNER}", owner);
            
            var vesselListDto = await _service.GetByOwnerAsync(owner);
            
            _logger.LogWarning("API Response (200): Vessel with Owner = {OWNER} -> FOUND", owner);
            
            return Ok(vesselListDto);

        }
        catch (BusinessRuleValidationException e)
        {
            _logger.LogWarning("API Error (404): {Message}", e.Message);
            return NotFound(e.Message);
        }
    }
}