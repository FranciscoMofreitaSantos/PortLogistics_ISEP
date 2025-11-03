using SEM5_PI_WEBAPI.Domain.Containers.DTOs;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;

namespace SEM5_PI_WEBAPI.Domain.StorageAreas;

public interface IStorageAreaService
{
    Task<List<StorageAreaDto>> GetAllAsync();
    Task<StorageAreaDto> GetByIdAsync(StorageAreaId id);
    Task<StorageAreaDto> GetByNameAsync(string name);
    Task<List<StorageAreaDockDistanceDto>> GetDistancesToDockAsync(string? name, StorageAreaId? id);
    Task<StorageAreaDto> CreateAsync(CreatingStorageAreaDto dto);
    Task<List<string>> GetPhysicalResourcesAsync(string? name, StorageAreaId? id);
    Task<StorageAreaGridDto> GetGridAsync(StorageAreaId id);
    Task<ContainerDto> GetContainerAsync(StorageAreaId id,int bay,int row, int tier);

}
