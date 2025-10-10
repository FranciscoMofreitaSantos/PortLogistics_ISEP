using SEM5_PI_WEBAPI.Domain.CrewMembers;

namespace SEM5_PI_WEBAPI.Domain.CrewManifests;

public class CreatingCrewManifestDto
{
    public int TotalCrew { get; set; }
    public string CaptainName { get; set; }
    public List<CreatingCrewMemberDto>? CrewMembers { get; set; }

    public CreatingCrewManifestDto(int totalCrew, string captainName, List<CreatingCrewMemberDto>? crewMembers)
    {
        TotalCrew = totalCrew;
        CaptainName = captainName;
        CrewMembers = crewMembers;
    }
}