using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

[Owned]
public class Iso6346Code : IValueObject
{
    public string Value { get; private set; }

    protected Iso6346Code() {}

    public Iso6346Code(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new BusinessRuleValidationException("ISO 6346 code can't be empty.");

        var normalized = code.Replace(" ", "").ToUpper();

        if (!System.Text.RegularExpressions.Regex.IsMatch(normalized, @"^[A-Z]{4}\d{7}$"))
            throw new BusinessRuleValidationException("Invalid ISO 6346 format. Must be 4 letters + 7 digits.");

        if (!ValidateCheckDigit(normalized))
            throw new BusinessRuleValidationException("Invalid ISO 6346 code: check digit does not match.");

        Value = normalized;
    }

    
    
    private bool ValidateCheckDigit(string code)
    {
        var letterMapping = new Dictionary<char, int>
        {
            {'A',10}, {'B',12}, {'C',13}, {'D',14}, {'E',15}, {'F',16}, {'G',17}, {'H',18}, {'I',19},
            {'J',20}, {'K',21}, {'L',23}, {'M',24}, {'N',25}, {'O',26}, {'P',27}, {'Q',28}, {'R',29},
            {'S',30}, {'T',31}, {'U',32}, {'V',34}, {'W',35}, {'X',36}, {'Y',37}, {'Z',38}
        };

        int sum = 0;
        int factor = 1;

        for (int i = 0; i < 10; i++)
        {
            char c = code[i];
            int value = char.IsLetter(c) ? letterMapping[c] : c - '0';
            sum += value * factor;
            factor *= 2;
        }

        int checkDigit = sum % 11;
        if (checkDigit == 10) checkDigit = 0;

        return checkDigit == (code[10] - '0');
    }




    public override string ToString() => Value;
}