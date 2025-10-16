using SEM5_PI_WEBAPI.Domain.BusinessShared;
using SEM5_PI_WEBAPI.Domain.Shared;
namespace SEM5_PI_WEBAPI.Tests.ValueObject;

public class ScheduleTests
{
    [Theory]
    [InlineData(WeekDays.None, "0000000")]
    [InlineData(WeekDays.Monday, "0000001")]
    [InlineData(WeekDays.Tuesday, "0000010")]
    [InlineData(WeekDays.Wednesday, "0000100")]
    [InlineData(WeekDays.Thursday, "0001000")]
    [InlineData(WeekDays.Friday, "0010000")]
    [InlineData(WeekDays.Saturday, "0100000")]
    [InlineData(WeekDays.Sunday, "1000000")]
    [InlineData(WeekDays.AllWeek, "1111111")]
    public void DaysToBinary_ShouldReturnCorrectBinaryString(WeekDays days, string expectedBinary)
    {
        var schedule = new Schedule(ShiftType.Morning, days);

        string binary = schedule.DaysToBinary();

        Assert.Equal(expectedBinary, binary);
    }

    [Theory]
    [InlineData("0000000", WeekDays.None)]
    [InlineData("0000001", WeekDays.Monday)]
    [InlineData("0000010", WeekDays.Tuesday)]
    [InlineData("0000100", WeekDays.Wednesday)]
    [InlineData("0001000", WeekDays.Thursday)]
    [InlineData("0010000", WeekDays.Friday)]
    [InlineData("0100000", WeekDays.Saturday)]
    [InlineData("1000000", WeekDays.Sunday)]
    [InlineData("1111111", WeekDays.AllWeek)]
    [InlineData(null, WeekDays.None)]
    [InlineData("", WeekDays.None)]
    [InlineData("   ", WeekDays.None)]
    public void ParseDaysFromBinary_ShouldReturnCorrectWeekDays(string binary, WeekDays expectedDays)
    {
        WeekDays days = Schedule.ParseDaysFromBinary(binary);

        Assert.Equal(expectedDays, days);
    }

    [Theory]
    [InlineData("abcdefgh")]  
    [InlineData("11111111")]  
    [InlineData("10000000")]  
    public void ParseDaysFromBinary_InvalidBinary_ShouldThrow(string invalidBinary)
    {
        Assert.Throws<BusinessRuleValidationException>(() => Schedule.ParseDaysFromBinary(invalidBinary));
    }
}