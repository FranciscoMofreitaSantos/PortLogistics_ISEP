using SEM5_PI_WEBAPI.Domain.Containers.DTOs;

namespace SEM5_PI_WEBAPI.Domain.Containers;

public interface IContainerService
{
    Task<ContainerDto> CreateAsync(CreatingContainerDto creatingContainerDto);
    Task<ContainerDto> GetByIdAsync(ContainerId id);
    Task<List<ContainerDto>> GetAllAsync();
    Task<ContainerDto> GetByIsoAsync(string id);
    Task<ContainerDto> PatchByIsoAsync(string iso, UpdatingContainerDto dto);
}