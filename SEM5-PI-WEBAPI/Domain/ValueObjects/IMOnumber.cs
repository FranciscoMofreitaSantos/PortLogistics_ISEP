using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

[Owned]
public class ImoNumber : IValueObject
{
    private const string ImoPrefix = "IMO";
    private const int ImoNumberLength = 7;
    
    public int Value { get; private set; }
    
    protected ImoNumber() { }

    public ImoNumber(string imoNumber)
    {
        string normalizedImoNumber = imoNumber.ToUpper().Trim();
        this.Value = ValidateFormatImoNumber(normalizedImoNumber);
    }

    private int ValidateFormatImoNumber(string imoNumber)
    {
        if (string.IsNullOrWhiteSpace(imoNumber)) 
            throw new BusinessRuleValidationException("IMO Number can't be empty. Must follow format: IMO ####### or #######");

        if (imoNumber.StartsWith(ImoPrefix))
        {
            string[] parts = imoNumber.Split(" ", StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length == 2 && parts[0] == ImoPrefix)
            {
                return ValidateImoNumber(parts[1]);
            }
            else 
                throw new BusinessRuleValidationException("IMO Number format is invalid. Use 'IMO #######'");
        }
        else
        {
            return ValidateImoNumber(imoNumber);
        }
    }

    private int ValidateImoNumber(string imoNumberString)
    {
        if (imoNumberString.Length != ImoNumberLength)
            throw new BusinessRuleValidationException("IMO Number must have exactly 7 digits (6 base digits + 1 check digit).");

        if (!imoNumberString.All(char.IsDigit))
            throw new BusinessRuleValidationException("IMO Number can only contain digits.");

        int[] digits = imoNumberString.Select(c => int.Parse(c.ToString())).ToArray();

        int checkDigit = digits[^1];
        int calculatedCheckDigit = (digits[0] * 7 + digits[1] * 6 + digits[2] * 5 + digits[3] * 4 + digits[4] * 3 + digits[5] * 2) % 10;

        if (checkDigit != calculatedCheckDigit)
            throw new BusinessRuleValidationException("Invalid IMO Number: check digit does not match.");

        return int.Parse(imoNumberString);
    }

    public override string ToString() => $"{ImoPrefix} {Value:D7}";
}
