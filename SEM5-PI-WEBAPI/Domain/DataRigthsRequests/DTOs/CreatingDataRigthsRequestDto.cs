using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

public class CreatingDataRigthsRequestDto
{
    public string UserEmail { get;set;}
    public RequestType Type { get; set; }
    public string? Payload { get;set;}
    
}