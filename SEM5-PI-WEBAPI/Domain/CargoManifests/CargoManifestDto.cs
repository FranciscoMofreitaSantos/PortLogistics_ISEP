using SEM5_PI_WEBAPI.Domain.Containers;

namespace SEM5_PI_WEBAPI.Domain.CargoManifests;

public class CargoManifestDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public CargoManifestType Type { get; set; } 
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
    public List<CargoManifestEntryDto> Entries { get; set; }

    public CargoManifestDto(Guid id, string code, CargoManifestType type, DateTime createdAt, string createdBy, List<CargoManifestEntryDto> entries)
    {
        Id = id;
        Code = code;
        Type = type;
        CreatedAt = createdAt;
        CreatedBy = createdBy;
        Entries = entries;
    }
}

public class CargoManifestEntryDto
{
    public Guid Id { get; set; }
    public int Bay { get; set; }
    public int Row { get; set; }
    public int Tier { get; set; }
    public ContainerDto Container { get; set; }

    public CargoManifestEntryDto(Guid id, int bay, int row, int tier, ContainerDto container)
    {
        Id = id;
        Bay = bay;
        Row = row;
        Tier = tier;
        Container = container;
    }
}