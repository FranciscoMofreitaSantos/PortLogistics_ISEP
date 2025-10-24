using SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers;

public class StaffMemberMapper
{
    public static StaffMemberDto ToDto(
        StaffMember staffMember,
        List<string> qualificationCodes)
    {
        var scheduleDto = new ScheduleDto(
            staffMember.Schedule.Shift,
            staffMember.Schedule.DaysToBinary()
        );

        return new StaffMemberDto(
            staffMember.Id.AsGuid(),
            staffMember.ShortName,
            staffMember.MecanographicNumber.ToString(),
            staffMember.Email.Address,
            staffMember.Phone.Number,
            scheduleDto,
            staffMember.IsActive,
            qualificationCodes
        );
    }

    public static List<StaffMemberDto> ToDtoList(
        List<StaffMember> staffMembers,
        Dictionary<Guid, List<string>> qualificationCodesByStaffId)
    {
        return staffMembers.Select(sm =>
        {
            var qualificationCodes = qualificationCodesByStaffId.TryGetValue(sm.Id.AsGuid(), out var codes)
                ? codes
                : new List<string>();

            return ToDto(sm, qualificationCodes);
        }).ToList();
    }
}