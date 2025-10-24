using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers;

public class StaffMemberFactory
{
    public static StaffMember CreateStaffMember(
        CreatingStaffMemberDto dto,
        MecanographicNumber mecanographicNumber,
        IEnumerable<QualificationId> qualificationIds)
    {
        var email = new Email(dto.Email);
        var phone = new PhoneNumber(dto.Phone);
        var schedule = dto.Schedule.ToDomain();

        return new StaffMember(
            dto.ShortName,
            mecanographicNumber,
            email,
            phone,
            schedule,
            qualificationIds
        );
    }
}