using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.CrewMembers;

public class CrewMemberFactory
{
    public static CrewMember CreateCrewMember(CreatingCrewMemberDto dto)
    {
        var citizenId = new CitizenId(dto.CitizenId);

        return new CrewMember(
            dto.Name,
            dto.Role,
            dto.Nationality,
            citizenId
        );
    }

    public static CrewMemberDto CreateCrewMemberDto(CrewMember crewMember)
    {
        return new CrewMemberDto(
            crewMember.Id.AsGuid(),
            crewMember.Name,
            crewMember.Role,
            crewMember.Nationality,
            crewMember.CitizenId.ToString()
        );
    }

    public static List<CrewMemberDto> CreateCrewMemberDtoList(List<CrewMember> crewMembers)
    {
        return crewMembers?
            .Select(CreateCrewMemberDto)
            .ToList() ?? new List<CrewMemberDto>();
    }
}