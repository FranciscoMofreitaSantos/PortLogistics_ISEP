using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

[Owned]
public class ClockTime : IValueObject
{
    public DateTime Value { get; private set; }

    private ClockTime() { }

    public ClockTime(DateTime value)
    {
        if (value.Year < 2000 || value.Year > 2100)
            throw new BusinessRuleValidationException("Invalid year for VVN time.");
        Value = value;
    }

    protected IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value.ToString("yyyy-MM-dd HH:mm");
}