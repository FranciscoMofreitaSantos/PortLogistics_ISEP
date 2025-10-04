using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

[Owned]
public class ImoNumber : IValueObject
{
    private const string ImoPrefix = "IMO";
    private const int ImoNumberLength = 7;

    public string Value { get; private set; }

    protected ImoNumber() { }

    public ImoNumber(string imoNumber)
    {
        string normalized = imoNumber.ToUpper().Trim();
        this.Value = ValidateFormatImoNumber(normalized);
    }

    private string ValidateFormatImoNumber(string imoNumber)
    {
        if (string.IsNullOrWhiteSpace(imoNumber))
            throw new BusinessRuleValidationException("IMO Number can't be empty. Must follow format: IMO ####### or #######");

        if (imoNumber.StartsWith(ImoPrefix))
        {
            string[] parts = imoNumber.Split(" ", StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 2 && parts[0] == ImoPrefix)
                return ValidateImoNumber(parts[1]);
            else
                throw new BusinessRuleValidationException("IMO Number format is invalid. Use 'IMO #######'");
        }

        return ValidateImoNumber(imoNumber);
    }

    private string ValidateImoNumber(string imoNumberString)
    {
        if (imoNumberString.Length != ImoNumberLength)
            throw new BusinessRuleValidationException("IMO Number must have exactly 7 digits (6 base digits + 1 check digit).");

        if (!imoNumberString.All(char.IsDigit))
            throw new BusinessRuleValidationException("IMO Number can only contain digits.");

        int[] digits = imoNumberString.Select(c => int.Parse(c.ToString())).ToArray();
        int checkDigit = digits[^1];
        int calculatedCheckDigit =
            (digits[0] * 7 + digits[1] * 6 + digits[2] * 5 + digits[3] * 4 + digits[4] * 3 + digits[5] * 2) % 10;

        if (checkDigit != calculatedCheckDigit)
            throw new BusinessRuleValidationException($"Invalid IMO Number: Check Digit doesn't match -> Maybe [{calculatedCheckDigit}].");

        return imoNumberString;
    }

    public override string ToString() => $"{ImoPrefix} {Value}";
}
