using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ValueObjects;

[Owned]
public class ShippingOrganizationCode : IValueObject
{
    private const int ShippingOrganizationCodeLength = 10;

    public string Value { get; private set; }

    protected ShippingOrganizationCode() { }

    public ShippingOrganizationCode(string shippingOrganizationCode)
    {
        if (shippingOrganizationCode is null)
            throw new BusinessRuleValidationException("ShippingOrganizationCode can't be empty. Must be 10 digits.");
        
        string normalized = shippingOrganizationCode.ToUpper().Trim();
        this.Value = ValidateFormatShippingOrganizationCode(normalized);
    }

    private string ValidateFormatShippingOrganizationCode(string shippingOrganizationCode)
    {
        if (string.IsNullOrWhiteSpace(shippingOrganizationCode))
            throw new BusinessRuleValidationException("ShippingOrganizationCode can't be empty. Must be 10 digits.");

        if (shippingOrganizationCode.Length != ShippingOrganizationCodeLength)
            throw new BusinessRuleValidationException($"ShippingOrganizationCode must have exactly {ShippingOrganizationCodeLength} digits.");

        if (!shippingOrganizationCode.All(char.IsDigit))
            throw new BusinessRuleValidationException("ShippingOrganizationCode can only contain digits.");

        return shippingOrganizationCode;
    }

    public static ShippingOrganizationCode FromString(string value)
    {
        return new ShippingOrganizationCode(value);
    }

    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType())
            return false;
        
        var other = (ShippingOrganizationCode)obj;
        return Value == other.Value;
    }

    public override int GetHashCode() => Value.GetHashCode();

    public override string ToString() => Value;
}