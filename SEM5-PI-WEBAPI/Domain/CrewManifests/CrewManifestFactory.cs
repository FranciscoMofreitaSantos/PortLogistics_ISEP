using SEM5_PI_WEBAPI.Domain.CrewMembers;

namespace SEM5_PI_WEBAPI.Domain.CrewManifests;

public class CrewManifestFactory
{
    public static CrewManifest CreateCrewManifest(CreatingCrewManifestDto dto)
    {
        var crewMembers = dto.CrewMembers?
            .Select(cm => CrewMemberFactory.CreateCrewMember(cm))
            .ToList();

        return new CrewManifest(
            dto.TotalCrew,
            dto.CaptainName,
            crewMembers
        );
    }
}