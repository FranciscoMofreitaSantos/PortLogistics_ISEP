using SEM5_PI_WEBAPI.Domain.BusinessShared;
using SEM5_PI_WEBAPI.Domain.Qualifications;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

public class CreatingStaffMemberDto
{
    public string ShortName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public ScheduleDto Schedule { get; set; }
    public bool IsActive { get; set; }
    public List<string>? QualificationCodes { get; set; }

    public CreatingStaffMemberDto(string shortName, string email, string phone, ScheduleDto schedule, bool isActive, List<string>? qualificationCodes)
    {
        ShortName = shortName;
        Email = email;
        Phone = phone;
        Schedule = schedule;
        IsActive = isActive;
        QualificationCodes = qualificationCodes;
    }
}