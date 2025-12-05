namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

public class PrivacyPolicyConfirmationExportDto
{
    public string VersionPrivacyPolicy { get; set; }
    public bool IsAccepted { get; set; }
    public DateTime? AcceptedAtUtc { get; set; }
    public string UserEmail { get; private set; }

}