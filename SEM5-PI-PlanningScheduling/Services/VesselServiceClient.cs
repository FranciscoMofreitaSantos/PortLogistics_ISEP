using SEM5_PI_DecisionEngineAPI.DTOs;

namespace SEM5_PI_DecisionEngineAPI.Services;

public class VesselServiceClient
{
    private readonly HttpClient _httpClient;

    public VesselServiceClient(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(config["BackendPrimary:BaseUrl"]!);
    }
    
    public async Task<VesselDto?> GetVesselByImo(string imo)
    {
        var response = await _httpClient.GetAsync($"/api/Vessel/imo/{imo}");

        if (!response.IsSuccessStatusCode)
            return null; 

        var dto = await response.Content.ReadFromJsonAsync<VesselDto>();
        return dto;
    }
}