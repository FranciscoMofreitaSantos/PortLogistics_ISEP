namespace SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;

public class CreatingPhysicalResourceDto
{
    public string Description { get; set; }
    public double OperationalCapacity { get; set; }
    public double SetupTime { get; set; }
    public PhysicalResourceType PhysicalResourceType { get; set; }
    public string? QualificationCode { get; set; }

    public CreatingPhysicalResourceDto(string description, double operationalCapacity,
        double setupTime, PhysicalResourceType physicalResourceType, string? qualificationCode)
    {
        Description = description;
        OperationalCapacity = operationalCapacity;
        SetupTime = setupTime;
        PhysicalResourceType = physicalResourceType;
        QualificationCode = qualificationCode;
    }
}