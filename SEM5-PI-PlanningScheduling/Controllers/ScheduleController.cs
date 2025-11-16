using Microsoft.AspNetCore.Mvc;
using SEM5_PI_DecisionEngineAPI.Services;

namespace SEM5_PI_DecisionEngineAPI.Controllers;

[ApiController]
[Route("api/schedule")]
public class ScheduleController : ControllerBase
{
    private readonly DockServiceClient _dockClient;
    private readonly StaffMemberServiceClient _staffMemberServiceClient;
    private readonly VesselServiceClient _vesselServiceClient;
    private readonly PhysicalResourceServiceClient _physicalResourceServiceClient;


    public ScheduleController(DockServiceClient dockClient,
        StaffMemberServiceClient staffMemberServiceClient,
        VesselServiceClient vesselServiceClient,
        PhysicalResourceServiceClient physicalResourceServiceClient)
    {
        _dockClient = dockClient;
        _staffMemberServiceClient = staffMemberServiceClient;
        _vesselServiceClient = vesselServiceClient;
        _physicalResourceServiceClient = physicalResourceServiceClient;
    }

    [HttpGet("assign-dock")]
    public async Task<IActionResult> AssignDock()
    {
        var docks = await _dockClient.GetAvailableDocksAsync();

        // Prolog 
        return Ok(docks);
    }
    
    [HttpGet("check-staff")]
    public async Task<IActionResult> CheckStaff([FromQuery(Name = "codes")] List<string> qualificationCodes)
    {
        var staff = await _staffMemberServiceClient.GetStaffWithQualifications(qualificationCodes);
        //Prolog
        return Ok(staff);
    }
    
    [HttpGet("vessel-details")]
    public async Task<IActionResult> VesselDetails(string imo)
    {
        var vessel = await _vesselServiceClient.GetVesselByImo(imo);

        // Prolog 
        return Ok(vessel);
    }
    
    [HttpGet("physicalResource-details")]
    public async Task<IActionResult> PhysicalResourceDetails(string code)
    {
        var vessel = await _physicalResourceServiceClient.GetPhysicalResourceByCode(code);

        // Prolog 
        return Ok(vessel);
    }
}