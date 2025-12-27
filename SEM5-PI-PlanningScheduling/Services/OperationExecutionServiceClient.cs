using System.Net.Http.Json;
using SEM5_PI_PlanningScheduling.DTOs;

namespace SEM5_PI_PlanningScheduling.Services;

public class OperationExecutionServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OperationExecutionServiceClient> _logger;

    public OperationExecutionServiceClient(HttpClient httpClient, ILogger<OperationExecutionServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SaveOperationPlanAsync(SaveScheduleDto planDto)
    {
        try
        {
            _logger.LogInformation("Sending Operation Plan to OEM Backend...");

            // Envia para: http://localhost:3000/api/operation-plans
            var response = await _httpClient.PostAsJsonAsync("operation-plans", planDto);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Failed to save plan in OEM. Status: {response.StatusCode}, Error: {errorContent}");

                throw new HttpRequestException($"OEM Backend rejected the plan: {errorContent}");
            }

            _logger.LogInformation("Operation Plan saved successfully in OEM.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error connecting to OEM Backend.");
            throw;
        }
    }
}