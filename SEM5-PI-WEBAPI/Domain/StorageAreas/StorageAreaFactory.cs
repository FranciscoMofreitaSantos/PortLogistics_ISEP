using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.StorageAreas;

public class StorageAreaFactory
{
    public static StorageArea CreateStorageArea(CreatingStorageAreaDto dto)
    {
        var duplicateDock = dto.DistancesToDocks
            .GroupBy(d => d.DockCode)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .FirstOrDefault();

        if (duplicateDock != null)
            throw new BusinessRuleValidationException($"Duplicate DockCode '{duplicateDock}' detected in distances list.");

        if (dto.DistancesToDocks.Any(d => d.DistanceKm <= 0))
            throw new BusinessRuleValidationException("All dock distances must be positive values and greater than zero.");
        
        var dockDistances = dto.DistancesToDocks
            .Select(d => new StorageAreaDockDistance(new DockCode(d.DockCode), d.DistanceKm))
            .ToList();

        var prCodes = dto.PhysicalResources
            .Select(pr => new PhysicalResourceCode(pr))
            .ToList();

        return new StorageArea(
            dto.Name,
            dto.Description,
            dto.Type,
            dto.MaxBays,
            dto.MaxRows,
            dto.MaxTiers,
            dockDistances,
            prCodes
        );
    }

    public static StorageAreaDto CreateStorageAreaDto(StorageArea storageArea)
    {
        var dockDtos = storageArea.DistancesToDocks
            .Select(d => new StorageAreaDockDistanceDto(d.Dock.Value, d.Distance))
            .ToList();
        
        var physicalResources = storageArea.PhysicalResources.
            Select(p => p.Value)
            .ToList();
        
        return new StorageAreaDto(
            storageArea.Id.AsGuid(),
            storageArea.Name,
            storageArea.Description ?? "No description.",
            storageArea.Type,
            storageArea.MaxBays,
            storageArea.MaxRows,
            storageArea.MaxTiers,
            storageArea.MaxCapacityTeu,
            storageArea.CurrentCapacityTeu,
            dockDtos,
            physicalResources
        );
    }
}