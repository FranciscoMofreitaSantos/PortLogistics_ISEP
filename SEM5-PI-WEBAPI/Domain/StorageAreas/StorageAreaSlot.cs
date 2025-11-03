using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.StorageAreas;

public class StorageAreaSlot : Entity<StorageAreaSlotId>
{
    public StorageAreaId StorageAreaId { get; private set; }

    public int Bay { get; private set; }
    public int Row { get; private set; }
    public int Tier { get; private set; }

    public string? ContainerIsoCode { get; private set; }

    protected StorageAreaSlot() {}

    public StorageAreaSlot(StorageAreaId storageAreaId, int bay, int row, int tier)
    {
        Id = new  StorageAreaSlotId(Guid.NewGuid());
        StorageAreaId = storageAreaId;
        Bay = bay;
        Row = row;
        Tier = tier;
        ContainerIsoCode = null;
    }

    public void AssignContainer(Iso6346Code code)
    {
        ContainerIsoCode = code.Value;
    }

    public void RemoveContainer()
    {
        ContainerIsoCode = null;
    }

    public bool IsEmpty() => ContainerIsoCode is null;
}