using SEM5_PI_DecisionEngineAPI.DTOs;

namespace SEM5_PI_DecisionEngineAPI.Services;

public class DockServiceClient
{
    private readonly HttpClient _httpClient;

    public DockServiceClient(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(config["BackendPrimary:BaseUrl"]!);
    }

    public async Task<List<DockDto>> GetAvailableDocksAsync()
    {
        var response = await _httpClient.GetAsync("/api/Dock/filter?status=Available");

        if (!response.IsSuccessStatusCode)
            return new List<DockDto>(); 
        var docks = await response.Content.ReadFromJsonAsync<List<DockDto>>();

        return docks ?? new List<DockDto>();
    }
}