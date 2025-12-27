using System.Text.Json.Serialization;
using System.Collections.Generic;
using SEM5_PI_DecisionEngineAPI.DTOs;

namespace SEM5_PI_PlanningScheduling.DTOs;

public class SaveScheduleDto
{
    [JsonPropertyName("planDate")]
    public DateTime PlanDate { get; set; }

    [JsonPropertyName("author")]
    public string Author { get; set; } = string.Empty;
    
    [JsonPropertyName("algorithm")]
    public string Algorithm { get; set; } = string.Empty;

    [JsonPropertyName("total_delay")] 
    public int TotalDelay { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
    
    [JsonPropertyName("operations")] 
    public List<SchedulingOperationDto> Operations { get; set; } = new();
}