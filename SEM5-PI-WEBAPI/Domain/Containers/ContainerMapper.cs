using SEM5_PI_WEBAPI.Domain.Containers.DTOs;

namespace SEM5_PI_WEBAPI.Domain.Containers;

public class ContainerMapper
{
    public static ContainerDto ToDto(EntityContainer container)
    {
        return new ContainerDto(
            container.Id.AsGuid(),
            container.ISOId,
            container.Description,
            container.Type,
            container.Status,
            container.WeightKg
        );
    }
}