using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Dock
{
    public static class DockFactory
    {
        public static Dock RegisterDock(RegisterDockDto dto)
        {
            var vtIds = dto.AllowedVesselTypeIds
                .Select(id => new VesselTypeId(new Guid(id)))
                .ToList();

            return new Dock(
                new DockCode(dto.Code),
                dto.Location,
                dto.LengthM,
                dto.DepthM,
                dto.MaxDraftM,
                vtIds
            );
        }

        public static DockDto RegisterDockDto(Dock instance)
        {
            return new DockDto(
                instance.Id.AsGuid(),
                instance.Code,
                instance.Location,
                instance.LengthM,
                instance.DepthM,
                instance.MaxDraftM,
                instance.AllowedVesselTypeIds
            );
        }
    }
}