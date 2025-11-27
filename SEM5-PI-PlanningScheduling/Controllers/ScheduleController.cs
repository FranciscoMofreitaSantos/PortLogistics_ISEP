using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SEM5_PI_DecisionEngineAPI.DTOs;
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

    // Endpoint that triggers Prolog (Optimal)
    // CHANGED: From HttpPost to HttpGet to match legacy requests
    [HttpGet("daily/optimal")]
        public async Task<IActionResult> GetOptimalSchedule([FromQuery] DateOnly day)
        {
            try
            {
                var schedule = await _schedulingService.ComputeDailyScheduleAsync(day);
                var prologResult = await _schedulingService.SendScheduleToPrologOptimal(schedule);

                // CORREÇÃO: Envolver a resposta num objeto anónimo compatível com o Frontend
                return Ok(new {
                    algorithm = "optimal",
                    schedule = schedule,
                    prolog = prologResult
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint that triggers Prolog (Greedy)
        [HttpGet("daily/greedy")]
        public async Task<IActionResult> GetGreedySchedule([FromQuery] DateOnly day)
        {
            try
            {
                var schedule = await _schedulingService.ComputeDailyScheduleAsync(day);
                var prologResult = await _schedulingService.SendScheduleToPrologGreedy(schedule);

                // CORREÇÃO: Envolver a resposta
                return Ok(new {
                    algorithm = "greedy",
                    schedule = schedule,
                    prolog = prologResult
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoint that triggers Prolog (Local Search)
        // Nota: Certifique-se que a rota corresponde ao frontend ("local-search" vs "local_search")
        [HttpGet("daily/local_search")]
        public async Task<IActionResult> GetLocalSearchSchedule([FromQuery] DateOnly day)
        {
            try
            {
                var schedule = await _schedulingService.ComputeDailyScheduleAsync(day);
                var prologResult = await _schedulingService.SendScheduleToPrologLocalSearch(schedule);

                // CORREÇÃO: Envolver a resposta
                return Ok(new {
                    algorithm = "local_search", // Manter consistente com o tipo no frontend
                    schedule = schedule,
                    prolog = prologResult
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    // Comparison Endpoint
    // Allows selecting algorithm via query parameter (default = greedy)
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