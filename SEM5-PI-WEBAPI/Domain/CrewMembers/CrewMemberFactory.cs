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
}