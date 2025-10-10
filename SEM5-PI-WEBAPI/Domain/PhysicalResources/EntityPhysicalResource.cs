using System.ComponentModel.DataAnnotations;
using SEM5_PI_WEBAPI.Domain.BusinessShared;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.PhysicalResources;

public enum PhysicalResourceStatus
{
    Available,
    Unavailable,
    UnderMaintenance,
}

public class EntityPhysicalResource : Entity<PhysicalResourceId>
{
    [MaxLength(10)] public string Code { get; set; }

    [MaxLength(80)] public string Description { get; set; }

    public double OperationalCapacity { get; set; }

    public double SetupTime { get; set; }

    public PhysicalResourceType Type { get; set; }

    public PhysicalResourceStatus Status { get; set; }
    
    public QualificationId? QualificationID { get; set; }


    protected EntityPhysicalResource()
    {
    }

    public EntityPhysicalResource(string code, string description, double operationalCapacity,
        double setupTime, PhysicalResourceType type, PhysicalResourceStatus status, QualificationId? qualificationID)
    {
        Id = new PhysicalResourceId(Guid.NewGuid());
        Code = code;
        Description = description;
        OperationalCapacity = operationalCapacity;
        SetupTime = setupTime;
        Type = type;
        Status = PhysicalResourceStatus.Available;
        QualificationID = qualificationID;
        
    }
    
    // Fazer Validacoes
    //Fazer Updates

    public override bool Equals(object? obj)
    {
        if (obj is EntityPhysicalResource other)
            return Id == other.Id;
        return false;
    }
    
    public override int GetHashCode()  => Id.GetHashCode();
}