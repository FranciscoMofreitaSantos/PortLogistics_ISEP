using Microsoft.AspNetCore.Mvc;
using SEM5_PI_DecisionEngineAPI.Services;

namespace SEM5_PI_DecisionEngineAPI.Controllers;

[ApiController]
[Route("api/schedule")]
public class ScheduleController : ControllerBase
{
    private readonly DockServiceClient _dockClient;

    public ScheduleController(DockServiceClient dockClient)
    {
        _dockClient = dockClient;
    }

    [HttpGet("assign-dock")]
    public async Task<IActionResult> AssignDock()
    {
        var docks = await _dockClient.GetAvailableDocksAsync();

        // Prolog 
        return Ok(docks);
    }
}