using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

[Owned]
public class VvnCode : IValueObject
{
    private static readonly Regex Pattern = new(@"^\d{4}-[A-Z]{2,8}-\d{6}$", RegexOptions.Compiled);
    private const string PortCode = "THPA";
    private const int SequenceNumberLength = 6;
    private const int YearNumberLength = 4;

    public string Code { get; private set; }
    public int SequenceNumber { get; private set; }
    public int YearNumber { get; private set; }

    // EF Core requires a parameterless constructor
    private VvnCode() { }
    
    public VvnCode(string year, string nextSequence)
    {
        ValidateYear(year);
        ValidateSequence(nextSequence);

        string code = CreateCodeWithParts(year, nextSequence);

        if (!Pattern.IsMatch(code))
            throw new BusinessRuleValidationException(
                "Invalid VVN code. Expected format: {YEAR}-{PORT_CODE}-{SEQUENTIAL_NUMBER}.");

        Code = code;
        SequenceNumber = int.Parse(nextSequence);
        YearNumber = int.Parse(year);
    }
    
    public VvnCode(string fullCode)
    {
        if (string.IsNullOrWhiteSpace(fullCode))
            throw new BusinessRuleValidationException("VVN Code cannot be null or empty.");

        if (!Pattern.IsMatch(fullCode))
            throw new BusinessRuleValidationException(
                $"Invalid VVN code format: {fullCode}. Expected format: yyyy-PORTCODE-nnnnnn.");

        var parts = fullCode.Split('-');
        if (parts.Length != 3)
            throw new BusinessRuleValidationException($"Invalid VVN code structure: {fullCode}");

        string yearPart = parts[0];
        string sequencePart = parts[2];

        ValidateYear(yearPart);
        ValidateSequence(sequencePart);

        Code = fullCode.Trim();
        SequenceNumber = int.Parse(sequencePart);
        YearNumber = int.Parse(yearPart);
    }

    // ===== VALIDATIONS =====
    private void ValidateSequence(string nextSequence)
    {
        if (string.IsNullOrWhiteSpace(nextSequence))
            throw new BusinessRuleValidationException("Invalid SEQUENCE for VVN Code. Cannot be null or empty.");

        if (!nextSequence.All(char.IsDigit))
            throw new BusinessRuleValidationException("Invalid SEQUENCE for VVN Code. Must contain only digits.");

        if (nextSequence.Length != SequenceNumberLength)
            throw new BusinessRuleValidationException(
                $"Invalid SEQUENCE for VVN Code. Must contain {SequenceNumberLength} digits.");
    }

    private void ValidateYear(string year)
    {
        if (string.IsNullOrWhiteSpace(year))
            throw new BusinessRuleValidationException("Invalid YEAR for VVN Code. Cannot be null or empty.");

        if (!year.All(char.IsDigit))
            throw new BusinessRuleValidationException("Invalid YEAR for VVN Code. Must contain only digits.");

        if (year.Length != YearNumberLength)
            throw new BusinessRuleValidationException(
                $"Invalid YEAR for VVN Code. Must contain {YearNumberLength} digits.");

        if (int.Parse(year) < 2000 || int.Parse(year) > 2100)
            throw new BusinessRuleValidationException("Invalid YEAR for VVN Code. Must be between 2000 and 2100.");
    }

    private string CreateCodeWithParts(string year, string nextSequence)
    {
        return $"{year.Trim()}-{PortCode}-{nextSequence.Trim()}";
    }

    protected IEnumerable<object> GetEqualityComponents()
    {
        yield return Code;
    }

    public override bool Equals(object? obj)
    {
        if (obj is not VvnCode other)
            return false;
        return Code.Equals(other.Code, StringComparison.OrdinalIgnoreCase);
    }

    public override int GetHashCode() => Code.GetHashCode(StringComparison.OrdinalIgnoreCase);

    public override string ToString() => Code;
}
