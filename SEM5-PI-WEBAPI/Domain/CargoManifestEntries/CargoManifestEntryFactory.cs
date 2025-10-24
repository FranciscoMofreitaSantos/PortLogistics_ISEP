using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.StorageAreas;

namespace SEM5_PI_WEBAPI.Domain.CargoManifestEntries;

public class CargoManifestEntryFactory
{
    public static CargoManifestEntry CreateCargoManifestEntry(
        CreatingCargoManifestEntryDto dto,
        EntityContainer container,
        StorageAreaId storageAreaId)
    {
        return new CargoManifestEntry(
            container,
            storageAreaId,
            dto.Bay,
            dto.Row,
            dto.Tier
        );
    }
}