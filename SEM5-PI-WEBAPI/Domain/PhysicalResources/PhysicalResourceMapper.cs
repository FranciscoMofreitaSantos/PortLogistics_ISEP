using SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.PhysicalResources
{
    public static class PhysicalResourceMapper
    {
        public static PhysicalResourceDTO ToDto(EntityPhysicalResource resource)
        {
            return new PhysicalResourceDTO(
                resource.Id.AsGuid(),
                resource.Code,
                resource.Description,
                resource.OperationalCapacity,
                resource.SetupTime,
                resource.Type,
                resource.Status,
                resource.QualificationID?.AsGuid()
            );
        }
        
        public static List<PhysicalResourceDTO> ToDtoList(List<EntityPhysicalResource> resources)
        {
            return resources.Select(ToDto).ToList();
        }
    }
}