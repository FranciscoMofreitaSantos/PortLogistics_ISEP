using SEM5_PI_WEBAPI.Domain.BusinessShared;
using SEM5_PI_WEBAPI.Domain.Qualifications;

namespace SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;

public class PhysicalResourceDTO
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public double OperationalCapacity { get; set; }
    public double SetupTime { get; set; }
    public PhysicalResourceType PhysicalResourceType { get; set; }
    public PhysicalResourceStatus PhysicalResourceStatus { get; set; }
    public Guid? QualificationID { get; set; }
    
    
    public PhysicalResourceDTO(
        Guid id,
        string code,
        string description,
        double operationalCapacity,
        double setupTime,
        PhysicalResourceType physicalResourceType,
        PhysicalResourceStatus physicalResourceStatus,
        Guid? qualificationID)
    {
        Id = id;
        Code = code;
        Description = description;
        OperationalCapacity = operationalCapacity;
        SetupTime = setupTime;
        PhysicalResourceType = physicalResourceType;
        PhysicalResourceStatus = physicalResourceStatus;
        QualificationID = qualificationID;
    }
}