using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects
{
    public class ClockTime : IValueObject
    {
        public DateTime? Value { get; private set; }

        protected ClockTime() { }

        public ClockTime(DateTime? value)
        {
            if (!value.HasValue)
            {
                Value = null;
                return;
            }

            var v = value.Value;

            if (v.Kind == DateTimeKind.Unspecified)
                v = DateTime.SpecifyKind(v, DateTimeKind.Utc);
            else if (v.Kind == DateTimeKind.Local)
                v = v.ToUniversalTime();

            if (v.Year < 2000 || v.Year > 2100)
                throw new BusinessRuleValidationException($"Invalid year for VVN time: {v.Year}");

            Value = v;
        }
        

        public bool IsWithinHoursOf(ClockTime other, double hours)
        {
            if (Value == null || other?.Value == null) return false;
            return Math.Abs((Value.Value - other.Value.Value).TotalHours) <= hours;
        }

        public bool IsAfter(ClockTime other) =>
            Value != null && other?.Value != null && Value.Value > other.Value.Value;

        public bool IsBefore(ClockTime other) =>
            Value != null && other?.Value != null && Value.Value < other.Value.Value;

        protected IEnumerable<object> GetEqualityComponents()
        {
            yield return Value ?? default;
        }

        public override bool Equals(object? obj)
        {
            if (obj is not ClockTime other)
                return false;
            return Nullable.Equals(Value, other.Value);
        }

        public override int GetHashCode() => Value?.GetHashCode() ?? 0;

        public override string ToString() =>
            Value?.ToString("yyyy-MM-dd HH:mm:ss 'UTC'") ?? "N/A";
    }
}
