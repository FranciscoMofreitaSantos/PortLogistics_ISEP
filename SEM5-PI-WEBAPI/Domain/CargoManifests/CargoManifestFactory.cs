using SEM5_PI_WEBAPI.Domain.CargoManifests.CargoManifestEntries;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.CargoManifests
{
    public static class CargoManifestFactory
    {
        public static CargoManifest Create(
            List<CargoManifestEntry> entries,
            string code,
            CargoManifestType type,
            DateTime createdAt,
            string submittedBy)
        {
            if (entries == null || entries.Count == 0)
                throw new BusinessRuleValidationException("CargoManifest must have at least one entry.");
            if (string.IsNullOrWhiteSpace(code))
                throw new BusinessRuleValidationException("Manifest code is required.");
            if (string.IsNullOrWhiteSpace(submittedBy))
                throw new BusinessRuleValidationException("SubmittedBy is required.");

            return new CargoManifest(entries, code, type, createdAt, submittedBy);
        }
    }
}