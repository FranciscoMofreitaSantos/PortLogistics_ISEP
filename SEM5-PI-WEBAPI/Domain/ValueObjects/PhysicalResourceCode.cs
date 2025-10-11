using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects
{
    [Owned]
    public class PhysicalResourceCode : IValueObject
    {
        public string Value { get; private set; }

        protected PhysicalResourceCode() { } 

        public PhysicalResourceCode(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new BusinessRuleValidationException("Code cannot be empty.");

            if (!Regex.IsMatch(value, @"^[A-Z]{3,6}-\d{4}$"))
                throw new BusinessRuleValidationException("Invalid code format. Expected: PREFIX-0001.");


            Value = value;
        }

        public override string ToString() => Value;
    }
}