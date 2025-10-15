using System;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.BusinessShared;

public class Schedule : IValueObject
{
    public ShiftType Shift { get; set; }
    public WeekDays Days { get; set; }

    public Schedule(ShiftType shift, WeekDays days)
    {
        Shift = shift;
        Days = days;
    }
    
    public string DaysToBinary()
    {
        int intValue = (int)Days & 0b1111111;
        return Convert.ToString(intValue, 2).PadLeft(7, '0');
    }
    
    public static WeekDays ParseDaysFromBinary(string binary)
    {
        if (string.IsNullOrWhiteSpace(binary))
        {
            return WeekDays.None;
        }

        if (binary.Length > 7)
            throw new BusinessRuleValidationException($"Binary value '{binary}' too large for Days");

        try
        {
            int intValue = Convert.ToInt32(binary, 2);
            return (WeekDays)intValue;
        }
        catch (FormatException)
        {
            throw new BusinessRuleValidationException($"Invalid binary format for Days: '{binary}'");
        }
    }
}