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
}