using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.CargoManifests;

public class CargoManifestEntry : IValueObject
{
    public Iso6346Code ContainerId { get; set; } 
    public int Bay { get; set; }
    public int Row { get; set; }
    public int Tier { get; set; }

    public CargoManifestEntry(Iso6346Code containerId, int bay, int row, int tier)
    {
        ContainerId = containerId;
        Bay = bay;
        Row = row;
        Tier = tier;
    }
}