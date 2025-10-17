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

    public static CrewManifestDto CreateCrewManifestDto(CrewManifest crewManifest)
    {
        var crewMemberDtos = crewManifest.CrewMembers != null
            ? CrewMemberFactory.CreateCrewMemberDtoList(crewManifest.CrewMembers)
            : null;

        return new CrewManifestDto(
            crewManifest.Id.AsGuid(),
            crewManifest.TotalCrew,
            crewManifest.CaptainName,
            crewMemberDtos
        );
    }

    public static List<CrewManifestDto> CreateCrewManifestDtoList(List<CrewManifest> crewManifests)
    {
        return crewManifests
            .Select(CreateCrewManifestDto)
            .ToList();
    }
}