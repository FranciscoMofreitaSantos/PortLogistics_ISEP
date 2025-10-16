namespace SEM5_PI_WEBAPI.Domain.VVN.DTOs.GetByStatus;

public class FilterAcceptedVvnStatusDto
{
    public Guid? SpecificRepresentative { get; set; }
    public string? VesselImoNumber { get; set; }
    public string? EstimatedTimeArrival { get; set; }
    public string? EstimatedTimeDeparture { get; set; }
    public string? SubmittedDate { get; set; }
    public string? AcceptedDate { get; set; }
}