namespace SEM5_PI_DecisionEngineAPI.DTOs;

public class PhysicalResourceDto
{
    public Guid Id { get; set; }
    public PhysicalResourceCodeDto Code { get; set; }
    public string Description { get; set; }
    public double OperationalCapacity { get; set; }
    public double SetupTime { get; set; }
    public string PhysicalResourceType { get; set; }
    public string PhysicalResourceStatus { get; set; }
    public Guid? QualificationID { get; set; }
}

