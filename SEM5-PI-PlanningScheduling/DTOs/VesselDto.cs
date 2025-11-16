namespace SEM5_PI_DecisionEngineAPI.DTOs;

public class VesselDto
{
    public Guid Id { get; set; }
    public ImoNumberDto ImoNumber { get; set; }
    public string Name { get; set; }
    public string Owner { get;  set; }
    public VesselTypeIdDto VesselTypeId { get; set; }
}

public class ImoNumberDto
{
    public string Value { get; set; }
}