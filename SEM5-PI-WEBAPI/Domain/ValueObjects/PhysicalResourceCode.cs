using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;



[Owned]
public class PhysicalResourceCode : IValueObject
{
    public string Value { get; set; }
    private static readonly Regex Pattern = new(@"^(DC|YC|MC|T|F|CS|C|TB|O)-\d{4}$", RegexOptions.Compiled);


    public PhysicalResourceCode()
    { }

    public PhysicalResourceCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new BusinessRuleValidationException("PR code cannot be empty.");
        if (!Pattern.IsMatch(value))
            throw new BusinessRuleValidationException("Invalid PR code. Expected format: [DC|YC|MC|T|F|CS|C|TB|O]-0000.");

        Value = value;
    }
    
    
    public override string ToString() => Value;

}