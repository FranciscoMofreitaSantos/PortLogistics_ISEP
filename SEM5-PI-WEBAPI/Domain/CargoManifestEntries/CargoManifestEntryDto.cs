using SEM5_PI_WEBAPI.Domain.Containers;

namespace SEM5_PI_WEBAPI.Domain.CargoManifestEntries;

public class CargoManifestEntryDto
{
    public Guid Id { get; set; }
    public int Bay { get; set; }
    public int Row { get; set; }
    public int Tier { get; set; }
    public ContainerDto Container { get; set; }
    public string StorageAreaName { get; set; }

    public CargoManifestEntryDto(Guid id, int bay, int row, int tier,  string storageAreaName, ContainerDto container)
    {
        Id = id;
        Bay = bay;
        Row = row;
        Tier = tier;
        Container = container;
        StorageAreaName = storageAreaName;
    }
}