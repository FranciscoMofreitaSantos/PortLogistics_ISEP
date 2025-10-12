using System.ComponentModel.DataAnnotations;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;

public class PhysicalResourceDTO
{
    public Guid Id { get; set; }
    
    [Required]
    public PhysicalResourceCode Code { get; set; }
    
    [Required]
    [MaxLength(80)]
    public string Description { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public double OperationalCapacity { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public double SetupTime { get; set; }
    
    [Required]
    public PhysicalResourceType PhysicalResourceType { get; set; }
    
    [Required]
    public PhysicalResourceStatus PhysicalResourceStatus { get; set; }
    
    public Guid? QualificationID { get; set; }
    
    
    public PhysicalResourceDTO(
        Guid id,
        PhysicalResourceCode code,
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