using Microsoft.AspNetCore.Mvc;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StaffMembers;
using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

namespace SEM5_PI_WEBAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StaffMembersController : ControllerBase
{
    private readonly StaffMemberService _service;

    public StaffMembersController(StaffMemberService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StaffMemberDto>>> GetAll()
    {
        return await _service.GetAllAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StaffMemberDto>> GetById(Guid id)
    {
        try
        {
            var staff = await _service.GetByIdAsync(new StaffMemberId(id));

            if (staff == null)
            {
                return NotFound();
            }

            return staff;
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("by-qualifications")]
    public async Task<ActionResult<List<StaffMemberDto>>> GetByQualifications(CodesListDto codesListDto)
    {
        try
        {
            var qualificationCodes = codesListDto.QualificationsCodes;
            if (!qualificationCodes.Any())
                return BadRequest("At least one qualification code must be provided.");

            var staffList = await _service.GetByQualificationsAsync(qualificationCodes);
            return Ok(staffList);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    [HttpGet("by-exact-qualifications")]
    public async Task<ActionResult<List<StaffMemberDto>>> GetByAllQualifications(CodesListDto codesListDto)
    {
        try
        {
            var qualificationCodes = codesListDto.QualificationsCodes;
            if (!qualificationCodes.Any())
                return BadRequest("At least one qualification code must be provided.");

            var staffList = await _service.GetByExactQualificationsAsync(qualificationCodes);

            return Ok(staffList);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("mec/{mec}")]
    public async Task<ActionResult<StaffMemberDto>> GetByMecanographicNumber(string mec)
    {
        try
        {
            var staff = await _service.GetByMecNumberAsync(mec);
            if (staff == null)
                return NotFound();
            return Ok(staff);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("name/{name}")]
    public async Task<ActionResult<List<StaffMemberDto>>> GetByName(string name)
    {
        try
        {
            var staff = await _service.GetByNameAsync(name);
            if (staff == null || staff.Count == 0)
                return NotFound();
            return Ok(staff);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }


    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<StaffMemberDto>>> GetByStatus(bool status)
    {
        try
        {
            var staffList = await _service.GetByStatusAsync(status);
            return Ok(staffList);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<StaffMemberDto>> Create(CreatingStaffMemberDto dto)
    {
        try
        {
            var staff = await _service.AddAsync(dto);

            return CreatedAtAction(nameof(GetById), new { id = staff.Id }, staff);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("update/")]
    public async Task<ActionResult<StaffMemberDto>> Update(UpdateStaffMemberDto dto)
    {
        try
        {
            var updatedStaff = await _service.UpdateAsync(dto);
            if (updatedStaff == null)
                return NotFound();
            return Ok(updatedStaff);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("toggle/{mec}")]
    public async Task<ActionResult<StaffMemberDto>> ToggleStatus(string mec)
    {
        try
        {
            var updatedStaff = await _service.ToggleAsync(mec);
            if (updatedStaff == null)
                return NotFound();
            return Ok(updatedStaff);
        }
        catch (BusinessRuleValidationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}