using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.StorageAreas;
using System.Collections.Generic;
using System.Linq;

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

    public static CargoManifestEntryDto CreateCargoManifestEntryDto(
        CargoManifestEntry entry,
        string storageAreaName)
    {
        var containerDto = ContainerFactory.CreateContainerDto(entry.Container);

        return new CargoManifestEntryDto(
            entry.Id.AsGuid(),
            entry.Bay,
            entry.Row,
            entry.Tier,
            storageAreaName,
            containerDto
        );
    }

    public static List<CargoManifestEntryDto> CreateCargoManifestEntryDtoList(
        List<CargoManifestEntry> entries,
        Dictionary<Guid, string> storageAreaNamesById)
    {
        return entries.Select(entry =>
        {
            var storageAreaName = storageAreaNamesById.TryGetValue(entry.StorageAreaId.AsGuid(), out var name)
                ? name
                : string.Empty;

            return CreateCargoManifestEntryDto(entry, storageAreaName);
        }).ToList();
    }
}