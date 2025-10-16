using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas;

namespace SEM5_PI_WEBAPI.Domain.CargoManifestEntries;

public class CargoManifestEntry : Entity<CargoManifestEntryId>
{
    public EntityContainer Container { get; set; }
    public StorageAreaId StorageAreaId { get; private set; }
    public int Bay { get; private set; }
    public int Row { get; private set; }
    public int Tier { get; private set; }

    protected CargoManifestEntry()
    {
    }

    public CargoManifestEntry(EntityContainer container, StorageAreaId storageAreaId, int bay, int row, int tier)
    {
        if (bay < 0)
            throw new BusinessRuleValidationException("Bay cannot be negative.");
        if (row < 0)
            throw new BusinessRuleValidationException("Row cannot be negative.");
        if (tier < 0)
            throw new BusinessRuleValidationException("Tier cannot be negative.");

        Id = new CargoManifestEntryId(Guid.NewGuid());
        Container = container;
        StorageAreaId = storageAreaId;
        Bay = bay;
        Row = row;
        Tier = tier;
    }

    public void UpdateBay(int bay)
    {
        if (bay < 0)
            throw new BusinessRuleValidationException("Bay cannot be negative.");
        Bay = bay;
    }

    public void UpdateRow(int row)
    {
        if (row < 0)
            throw new BusinessRuleValidationException("Row cannot be negative.");
        Row = row;
    }

    public void UpdateTier(int tier)
    {
        if (tier < 0)
            throw new BusinessRuleValidationException("Tier cannot be negative.");
        Tier = tier;
    }

    public override bool Equals(object? obj)
    {
        if (obj is CargoManifestEntry other)
            return Id == other.Id;
        return false;
    }

    public override int GetHashCode() => Id.GetHashCode();

    public override string ToString()
    {
        return $"CargoManifestEntry [Id={Id}, Container={Container?.ToString() ?? "null"}, StorageAreaId={StorageAreaId}, Bay={Bay}, Row={Row}, Tier={Tier}]";
    }
}
