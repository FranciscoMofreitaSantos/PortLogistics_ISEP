using System.Text.RegularExpressions;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects
{
    public class ShippingOrganizationCode : IValueObject
    {
        public string Value { get; private set; }

        public ShippingOrganizationCode(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new BusinessRuleValidationException(
                    "ShippingOrganizationCode can't be empty. Must be at most 10 alphanumeric characters."
                );

            value = value.Trim().ToUpper();

            if (value.Length > 10)
                throw new BusinessRuleValidationException(
                    "ShippingOrganizationCode must have at most 10 alphanumeric characters."
                );

            if (!Regex.IsMatch(value, "^[A-Z0-9]+$"))
                throw new BusinessRuleValidationException(
                    "ShippingOrganizationCode can only contain letters and digits."
                );

            Value = value;
        }

        public static ShippingOrganizationCode FromString(string value)
        {
            return new ShippingOrganizationCode(value);
        }

        public override string ToString() => Value;

        public override bool Equals(object? obj)
        {
            if (obj is not ShippingOrganizationCode other) return false;
            return Value.Equals(other.Value, StringComparison.OrdinalIgnoreCase);
        }

        public override int GetHashCode() => Value.GetHashCode(StringComparison.OrdinalIgnoreCase);
    }
}
