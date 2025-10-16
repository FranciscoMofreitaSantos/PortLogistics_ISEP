using SEM5_PI_WEBAPI.Domain.Vessels.DTOs;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Vessels;

public class VesselFactory
{
    public static Vessel CreateVessel(CreatingVesselDto instanceDto, VesselTypeId vesselTypeId)
    {
        return new Vessel(instanceDto.ImoNumber,instanceDto.Name,instanceDto.Owner,vesselTypeId);
    }

    public static VesselDto CreateVesselDto(Vessel instance)
    {
        return new VesselDto(instance.Id.AsGuid(),instance.ImoNumber, instance.Name, instance.Owner, instance.VesselTypeId);
    }
}