using System.Text.Json;
using System.Text; // Necessário para Encoding

namespace SEM5_PI_DecisionEngineAPI.Services;

public class PrologClient
{
    private readonly HttpClient _httpClient;

    public PrologClient(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(config["PrologServer:BaseUrl"]!);
        _httpClient.Timeout = TimeSpan.FromMinutes(5); 
    }

    public async Task<T?> SendToPrologAsync<T>(string endpoint, object payload)
    {
        var jsonOptions = new JsonSerializerOptions 
        { 
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        };
        
        var jsonPayload = JsonSerializer.Serialize(payload, jsonOptions);
        
        var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
        
        request.Headers.ConnectionClose = true; 
        
        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"\n!!! [PROLOG ERROR {response.StatusCode}] !!!");
            Console.WriteLine($"URL: {response.RequestMessage?.RequestUri}");
            Console.WriteLine($"Body: {errorContent}");
            
            throw new HttpRequestException($"Prolog API Error: {response.StatusCode} - {errorContent}");
        }
        
        return await response.Content.ReadFromJsonAsync<T>();
    }
}