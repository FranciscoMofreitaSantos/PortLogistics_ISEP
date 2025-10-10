using System.Text.RegularExpressions;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

public class DockCode : IValueObject
{
    public string Value { get; }

    private static readonly Regex Pattern = new(@"^DK-\d{4}$", RegexOptions.Compiled);

    public DockCode(){}
    
    public DockCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new BusinessRuleValidationException("Dock code cannot be empty.");
        if (!Pattern.IsMatch(value))
            throw new BusinessRuleValidationException("Invalid Dock code. Expected format: DK-0000.");

        Value = value;
    }

    public override string ToString() => Value;
}