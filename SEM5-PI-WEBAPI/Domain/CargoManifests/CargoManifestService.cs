using SEM5_PI_WEBAPI.Domain.CargoManifests.CargoManifestEntries;
using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.CargoManifests;

public class CargoManifestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICargoManifestRepository _repo;

    public CargoManifestService(IUnitOfWork unitOfWork, ICargoManifestRepository repo)
    {
        _unitOfWork = unitOfWork;
        _repo = repo;
    }

    public async Task<List<CargoManifestDto>> GetAllAsync()
    {
        var manifests = await _repo.GetAllAsync();
        return manifests.Select(MapToDto).ToList();
    }

    public async Task<CargoManifestDto> GetByIdAsync(CargoManifestId id)
    {
        var manifest = await _repo.GetByIdAsync(id);
        if (manifest == null)
            throw new BusinessRuleValidationException("CargoManifest not found.");
        return MapToDto(manifest);
    }

    public async Task<CargoManifestDto> AddAsync(CreatingCargoManifestDto dto)
    {
        
        var genCode = await GenerateNextCargoManifestCodeAsync();
        
        var entries = dto.Entries.Select(e =>
            new CargoManifestEntry(
                new EntityContainer(
                    e.Container.IsoCode.ToString(),
                    e.Container.Description,
                    e.Container.Type,
                    e.Container.WeightKg
                ),
                e.Bay,
                e.Row,
                e.Tier
            )
        ).ToList();

        var cargoManifest = CargoManifestFactory.Create(
            entries,
            genCode,
            dto.Type,
            DateTime.UtcNow,
            dto.CreatedBy
        );

        await _repo.AddAsync(cargoManifest);
        await _unitOfWork.CommitAsync();
        return MapToDto(cargoManifest);
    }


    private static CargoManifestDto MapToDto(CargoManifest cargo)
    {
        return new CargoManifestDto(
            cargo.Id.AsGuid(),
            cargo.Code,
            cargo.Type,
            cargo.CreatedAt,
            cargo.SubmittedBy,
            cargo.ContainerEntries.Select(entry =>
                new CargoManifestEntryDto(
                    entry.Id.AsGuid(),
                    entry.Bay,
                    entry.Row,
                    entry.Tier,
                    new ContainerDto(
                        entry.Container.Id.AsGuid(),
                        entry.Container.ISOId,
                        entry.Container.Description,
                        entry.Container.Type,
                        entry.Container.Status,
                        entry.Container.WeightKg
                    )
                )
            ).ToList()
        );
    }

    private async Task<string> GenerateNextCargoManifestCodeAsync()
    {
        var count = await _repo.CountAsync();
        int nextNumber = count + 1;
        return $"CGM-{nextNumber.ToString("D4")}";
    }
}