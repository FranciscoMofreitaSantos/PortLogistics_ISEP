using SEM5_PI_WEBAPI.Domain.Containers.DTOs;

namespace SEM5_PI_WEBAPI.Domain.Containers;

public class ContainerFactory
{
    public static EntityContainer CreateEntityContainer(CreatingContainerDto dto)
    {
        var newContainer = new EntityContainer(
            dto.IsoCode, 
            dto.Description, 
            dto.Type, 
            dto.WeightKg
        );
        
        return newContainer;
    }
}