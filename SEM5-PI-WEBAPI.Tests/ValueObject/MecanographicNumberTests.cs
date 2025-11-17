namespace SEM5_PI_WEBAPI.Tests.ValueObject;

using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StaffMembers;
using Xunit;

public class MecanographicNumberTests
{
    [Fact]
    public void Create_ValidValue_ShouldInitializeProperties()
    {
        string value = "1234567";
        var mecanographicNumber = new MecanographicNumber(value);

        Assert.Equal(value, mecanographicNumber.Value);
        Assert.Equal(23, mecanographicNumber.Year); 
        Assert.Equal(4567, mecanographicNumber.Number); 
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("       ")]
    public void Create_NullOrEmptyValue_ShouldThrow(string invalidValue)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new MecanographicNumber(invalidValue!));
    }

    [Theory]
    [InlineData("123456")]      
    [InlineData("12345678")]  
    [InlineData("abcdefg")]     
    public void Create_InvalidLengthOrNonDigits_ShouldThrow(string invalidValue)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new MecanographicNumber(invalidValue));
    }

    [Theory]
    [InlineData("2234567")]
    [InlineData("3234567")]
    public void Create_StartingCharNotOne_ShouldThrow(string invalidValue)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new MecanographicNumber(invalidValue));
    }

    [Theory]
    [InlineData("1ab4567")] 
    [InlineData("1a34567")]
    public void Create_InvalidYearPart_ShouldThrow(string invalidValue)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new MecanographicNumber(invalidValue));
    }

    [Theory]
    [InlineData("1234abc")] 
    [InlineData("12345bc")]
    public void Create_InvalidNumberPart_ShouldThrow(string invalidValue)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new MecanographicNumber(invalidValue));
    }

    [Fact]
    public void Equals_SameValue_ShouldReturnTrue()
    {
        var num1 = new MecanographicNumber("1234567");
        var num2 = new MecanographicNumber("1234567");

        Assert.True(num1.Equals(num2));
        Assert.Equal(num1.GetHashCode(), num2.GetHashCode());
    }

    [Fact]
    public void Equals_DifferentValue_ShouldReturnFalse()
    {
        var num1 = new MecanographicNumber("1234567");
        var num2 = new MecanographicNumber("1234568");

        Assert.False(num1.Equals(num2));
    }

    [Fact]
    public void ToString_ShouldReturnValue()
    {
        var num = new MecanographicNumber("1234567");

        Assert.Equal("1234567", num.ToString());
    }
}
