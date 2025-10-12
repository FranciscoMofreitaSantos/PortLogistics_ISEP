using System;
using System.Text.RegularExpressions;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.StaffMembers
{
    public class MecanographicNumber : IValueObject
    {
        public string Value { get; private set; }
        public int Year { get; private set; }
        public int Number { get; private set; }  // incremental part

        public MecanographicNumber(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new BusinessRuleValidationException("Mecanographic number cannot be null or empty.");

            if (!Regex.IsMatch(value, @"^\d{7}$"))
                throw new BusinessRuleValidationException("Mecanographic number must be exactly 7 digits.");

            if (value[0] != '1')
                throw new BusinessRuleValidationException("Mecanographic number must start with '1'.");

            var yearPart = value.Substring(1, 2);
            if (!int.TryParse(yearPart, out int year))
                throw new BusinessRuleValidationException("Year part of mecanographic number is invalid.");

            var numberPart = value.Substring(3, 4);
            if (!int.TryParse(numberPart, out int number))
                throw new BusinessRuleValidationException("Number part of mecanographic number is invalid.");

            Year = year;
            Number = number;
            Value = value;
        }

        public override bool Equals(object? obj)
        {
            if (obj is MecanographicNumber other)
                return Value == other.Value;

            return false;
        }

        public override int GetHashCode() => Value.GetHashCode();

        public override string ToString() => Value;
    }
}