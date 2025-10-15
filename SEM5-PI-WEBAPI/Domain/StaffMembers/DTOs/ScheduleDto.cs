using SEM5_PI_WEBAPI.Domain.BusinessShared;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers.DTOs;

public class ScheduleDto
{
    public ShiftType Shift { get; set; }
    public string DaysOfWeek { get; set; }

    public ScheduleDto(ShiftType shift, string daysOfWeek)
    {
        Shift = shift;
        DaysOfWeek = daysOfWeek;
    }

    public Schedule ToDomain()
    {
        return new Schedule(Shift, ParseWeekDaysFromBinaryString(DaysOfWeek));
    }

    private static WeekDays ParseWeekDaysFromBinaryString(string binary)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(binary))
                return WeekDays.None;

            int value = Convert.ToInt32(binary, 2);
            return (WeekDays)value;
        }
        catch (FormatException)
        {
            throw new BusinessRuleValidationException($"Invalid binary format for DaysOfWeek: '{binary}'. " +
                                                      "Expected only 0s and 1s (e.g., '1010100').");
        }
        catch (OverflowException)
        {
            throw new BusinessRuleValidationException(
                $"The binary value '{binary}' is too large for conversion to WeekDays.");
        }
    }
}