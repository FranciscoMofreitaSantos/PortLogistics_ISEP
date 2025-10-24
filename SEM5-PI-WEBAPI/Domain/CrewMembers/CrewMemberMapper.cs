namespace SEM5_PI_WEBAPI.Domain.CrewMembers;

public class CrewMemberMapper
{
    public static CrewMemberDto ToDto(CrewMember crewMember)
    {
        return new CrewMemberDto(
            crewMember.Id.AsGuid(),
            crewMember.Name,
            crewMember.Role,
            crewMember.Nationality,
            crewMember.CitizenId.ToString()
        );
    }

    public static List<CrewMemberDto> ToDtoList(List<CrewMember> crewMembers)
    {
        return crewMembers?
            .Select(ToDto)
            .ToList() ?? new List<CrewMemberDto>();
    }
}