using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Vessels.DTOs;

public class CreatingVesselDto
{
    public string ImoNumber {get; set;}
    public string Name {get; set;}
    public string Owner {get; set;}
    public string VesselTypeName {get;set;}
    
    public CreatingVesselDto() { }

    public CreatingVesselDto(string imoNumber, string name, string owner, string vesselTypeName)
    {
        this.ImoNumber = imoNumber;
        this.Name = name;
        this.Owner = owner;
        this.VesselTypeName = vesselTypeName;
    }
    
}