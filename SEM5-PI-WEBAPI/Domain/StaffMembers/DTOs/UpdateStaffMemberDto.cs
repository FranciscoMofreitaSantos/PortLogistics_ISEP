namespace SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

public class UpdateStaffMemberDto
{
    public string MecNumber { get; set; }
    public string? ShortName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public ScheduleDto? Schedule { get; set; }
    public bool? IsActive { get; set; }
    public List<string>? QualificationCodes { get; set; }
    public bool? AddQualifications { get; set; }

    public UpdateStaffMemberDto()
    {
    }

    public UpdateStaffMemberDto(string mecNumber, string? shortName, string? email, string? phone, ScheduleDto? schedule, bool? isActive,
        List<string>? qualificationCodes, bool? addQualifications)
    {
        MecNumber = mecNumber;
        ShortName = shortName;
        Email = email;
        Phone = phone;
        Schedule = schedule;
        IsActive = isActive;
        QualificationCodes = qualificationCodes;
        AddQualifications = addQualifications;
    }
}