using SEM5_PI_WEBAPI.Domain.Dock.DTOs;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Dock
{
    public static class DockFactory
    {
        public static EntityDock RegisterDock(RegisterDockDto dto)
        {
            var prcs = dto.PhysicalResourceCodes?.Select(x => new PhysicalResourceCode(x)).ToList()
                       ?? new List<PhysicalResourceCode>();

            return new EntityDock(
                new DockCode(dto.Code),
                prcs,
                dto.Location,
                dto.LengthM,
                dto.DepthM,
                dto.MaxDraftM,
                dto.VesselsTypesObjs,
                DockStatus.Available
            );
        }

        public static DockDto RegisterDockDto(EntityDock instance)
        {
            return new DockDto(
                instance.Id.AsGuid(),
                instance.Code,
                instance.PhysicalResourceCodes,
                instance.Location,
                instance.LengthM,
                instance.DepthM,
                instance.MaxDraftM,
                instance.Status,
                instance.AllowedVesselTypeIds
            );
        }
    }

}