using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

[Owned]
public class VvnCode : IValueObject
{
    private static readonly Regex Pattern = 
        new(@"^\d{4}-[A-Z]{2,8}-\d{6}$", RegexOptions.Compiled);

    public string Code { get; private set; }

    private VvnCode() { }

    public VvnCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code) || !Pattern.IsMatch(code))
            throw new BusinessRuleValidationException("Invalid VVN code. Expected format: {YEAR}-{PORT_CODE}-{SEQUENTIAL_NUMBER}, e.g. 2025-PTLEI-000001.");
        
        Code = code;
    }

    protected IEnumerable<object> GetEqualityComponents()
    {
        yield return Code;
    }

    public override string ToString() => Code;
}