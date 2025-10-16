using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.Containers.DTOs;
using SEM5_PI_WEBAPI.Domain.StorageAreas;

namespace SEM5_PI_WEBAPI.Domain.CargoManifestEntries;

public class CreatingCargoManifestEntryDto
{
    public int Bay { get; set; }
    public int Row { get; set; }
    public int Tier { get; set; }
    public CreatingContainerDto Container { get; set; }
    public string StorageAreaName { get; set; }

    public CreatingCargoManifestEntryDto(int bay, int row, int tier, CreatingContainerDto container,
        string storageAreaName)
    {
        Bay = bay;
        Row = row;
        Tier = tier;
        Container = container;
        StorageAreaName = storageAreaName;
    }
}