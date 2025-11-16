using SEM5_PI_DecisionEngineAPI.DTOs;

namespace SEM5_PI_DecisionEngineAPI.Services;

public class StaffMemberServiceClient
{
    private readonly HttpClient _httpClient;

    public StaffMemberServiceClient(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(config["BackendPrimary:BaseUrl"]!);
    }

    public async Task<List<StaffMemberDto>> GetStaffWithQualifications(List<string> qualifications)
    {
        if (qualifications == null || qualifications.Count == 0)
            return new List<StaffMemberDto>();

        
        var query = string.Join("&", qualifications.Select(q =>
            $"codes={Uri.EscapeDataString(q)}"));

        
        var endpoint = $"/api/StaffMembers/by-qualifications?{query}";

        var response = await _httpClient.GetAsync(endpoint);

        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<List<StaffMemberDto>>();

        return result ?? new List<StaffMemberDto>();
    }
}