using SEM5_PI_WEBAPI.Domain.BusinessShared;
using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers;

public class StaffMemberDto
{
    public Guid Id { get; set; }
    public string ShortName { get; set; }
    public string MecanographicNumber { get; private set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public ScheduleDto Schedule { get; set; }
    public bool IsActive { get; set; }
    public List<string> QualificationCodes { get; }  

    public StaffMemberDto(
        Guid id,
        string shortName,
        string mecanographicNumber,
        string email,
        string phone,
        ScheduleDto schedule,
        bool isActive,
        List<string> qualificationCodes)
    {
        Id = id;
        ShortName = shortName;
        MecanographicNumber = mecanographicNumber;
        Email = email;
        Phone = phone;
        Schedule = schedule;
        IsActive = isActive;
        QualificationCodes = qualificationCodes;
    }
}