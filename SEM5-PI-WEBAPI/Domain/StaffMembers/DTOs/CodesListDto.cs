namespace SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

public class CodesListDto
{
    public List<String> QualificationsCodes { get; set; }


    public CodesListDto(List<string> qualificationsCodes)
    {
        QualificationsCodes = qualificationsCodes;
    }
}