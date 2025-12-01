using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SEM5_PI_DecisionEngineAPI.DTOs;
using SEM5_PI_DecisionEngineAPI.Exceptions;
using SEM5_PI_DecisionEngineAPI.Services;

namespace SEM5_PI_DecisionEngineAPI.Controllers;

[ApiController]
[Route("api/schedule")]
public class ScheduleController : ControllerBase
{
    private readonly SchedulingService _schedulingService;

    public ScheduleController(SchedulingService schedulingService)
    {
        _schedulingService = schedulingService;
    }

    [HttpGet("daily/basic")]
    public async Task<ActionResult<DailyScheduleResultDto>> GetDailySchedule([FromQuery] DateOnly day)
    {
        try
        {
            var schedule = await _schedulingService.ComputeDailyScheduleAsync(day);
            return Ok(schedule);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    
    [HttpGet("daily/optimal")]
    public async Task<IActionResult> GetOptimalSchedule([FromQuery] DateOnly day)
    {
        try
        {
            var schedule = await _schedulingService.ComputeDailyScheduleAsync(day);
            var prologResult = await _schedulingService.SendScheduleToPrologOptimal(schedule);
            
            _schedulingService.UpdateScheduleFromPrologResult(schedule, prologResult);

            return Ok(new {
                algorithm = "optimal",
                schedule = schedule, 
                prolog = prologResult
            });
        }
        
        catch (PlanningSchedulingException e) 
        {
            return BadRequest(new { error = e.Message });
        }
    }

        
        [HttpGet("daily/greedy")]
        public async Task<IActionResult> GetGreedySchedule([FromQuery] DateOnly day)
        {
            try
            {
                var schedule = await _schedulingService.ComputeDailyScheduleAsync(day);
                var prologResult = await _schedulingService.SendScheduleToPrologGreedy(schedule);
                
                _schedulingService.UpdateScheduleFromPrologResult(schedule, prologResult);

                return Ok(new {
                    algorithm = "greedy",
                    schedule = schedule,
                    prolog = prologResult
                });
            }
            catch (PlanningSchedulingException e)
            {
                return BadRequest(new { error = e.Message });
            }
        }

        [HttpGet("daily/local_search")]
        public async Task<IActionResult> GetLocalSearchSchedule([FromQuery] DateOnly day)
        {
            try
            {
                var schedule = await _schedulingService.ComputeDailyScheduleAsync(day);
                var prologResult = await _schedulingService.SendScheduleToPrologLocalSearch(schedule);

                
                _schedulingService.UpdateScheduleFromPrologResult(schedule, prologResult);

                return Ok(new {
                    algorithm = "local_search",
                    schedule = schedule,
                    prolog = prologResult
                });
            }
            catch (PlanningSchedulingException e)
            {
                return BadRequest(new { error = e.Message });
            }
        }


    [HttpGet("daily/multi-crane-comparison")]
    public async Task<ActionResult<MultiCraneComparisonResultDto>> GetMultiCraneComparison(
        [FromQuery] DateOnly day,
        [FromQuery] string algorithm = "greedy")
    {
        try
        {
            var result = await _schedulingService.ComputeDailyScheduleWithPrologComparisonAsync(day, algorithm);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}