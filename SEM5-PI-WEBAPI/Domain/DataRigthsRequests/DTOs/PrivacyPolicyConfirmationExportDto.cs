using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

public class PrivacyPolicyConfirmationExportDto
{
    public string VersionPrivacyPolicy { get; set; }
    public bool IsAccepted { get; set; }
    public ClockTime? AcceptedAtUtc { get; set; }
    public string UserEmail { get; set; }

}