using SEM5_PI_WEBAPI.Domain.CargoManifestEntries;
using SEM5_PI_WEBAPI.Domain.StaffMembers;

namespace SEM5_PI_WEBAPI.Domain.CargoManifests;

public class CargoManifestFactory
{
    public static CargoManifest CreateCargoManifest(
        CreatingCargoManifestDto dto,
        List<CargoManifestEntry> entries,
        string code)
    {
        var email = new Email(dto.CreatedBy);
        var createdAt = DateTime.UtcNow;

        return new CargoManifest(
            entries,
            code,
            dto.Type,
            createdAt,
            email
        );
    }

    public static CargoManifestDto CreateCargoManifestDto(
        CargoManifest manifest,
        List<CargoManifestEntryDto> entryDtos)
    {
        return new CargoManifestDto(
            manifest.Id.AsGuid(),
            manifest.Code,
            manifest.Type,
            manifest.CreatedAt,
            manifest.SubmittedBy.Address,
            entryDtos
        );
    }

    public static List<CargoManifestDto> CreateCargoManifestDtoList(
        List<CargoManifest> manifests,
        Dictionary<Guid, List<CargoManifestEntryDto>> entriesByManifestId)
    {
        return manifests.Select(manifest =>
        {
            var entryDtos = entriesByManifestId.TryGetValue(manifest.Id.AsGuid(), out var entries)
                ? entries
                : new List<CargoManifestEntryDto>();

            return CreateCargoManifestDto(manifest, entryDtos);
        }).ToList();
    }
}