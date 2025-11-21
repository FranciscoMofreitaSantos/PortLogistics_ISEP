using System.Text;
using System.Text.RegularExpressions;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects
{
    public class ShippingOrganizationCode : IValueObject
    {
        public string Value { get; private set; }
        
        private static readonly Random _random = new Random();
        private const string _chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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



        public static ShippingOrganizationCode Generate()
        {
            int length = 10;
            if (length <= 0 || length > 10)
                throw new ArgumentException("Length must be between 1 and 10.");

            var sb = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                sb.Append(_chars[_random.Next(_chars.Length)]);
            }

            return new ShippingOrganizationCode(sb.ToString());
        }
    }
}
