using SEM5_PI_WEBAPI.Domain.Containers;

namespace SEM5_PI_WEBAPI.Domain.CargoManifestEntries;

public class CargoManifestEntryMapper
{
    public static CargoManifestEntryDto ToDto(
        CargoManifestEntry entry,
        string storageAreaName)
    {
        var containerDto = ContainerMapper.ToDto(entry.Container);

        return new CargoManifestEntryDto(
            entry.Id.AsGuid(),
            entry.Bay,
            entry.Row,
            entry.Tier,
            storageAreaName,
            containerDto
        );
    }

    public static List<CargoManifestEntryDto> ToDtoList(
        List<CargoManifestEntry> entries,
        Dictionary<Guid, string> storageAreaNamesById)
    {
        return entries.Select(entry =>
        {
            var storageAreaName = storageAreaNamesById.TryGetValue(entry.StorageAreaId.AsGuid(), out var name)
                ? name
                : string.Empty;

            return ToDto(entry, storageAreaName);
        }).ToList();
    }
}