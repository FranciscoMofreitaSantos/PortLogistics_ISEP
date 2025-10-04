using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Vessels;

public class VesselDto
{
    public ImoNumber ImoNumber {get; private set;}
    public string Name {get; private set;}
    public string Owner {get; private set;}
    public VesselTypeId VesselTypeId {get; private set;}

    public VesselDto(ImoNumber imoNumber, string name,string owner, VesselTypeId vesselTypeId)
    {
        this.ImoNumber = imoNumber;
        this.Name = name;
        this.Owner = owner;
        this.VesselTypeId = vesselTypeId;
    }
}