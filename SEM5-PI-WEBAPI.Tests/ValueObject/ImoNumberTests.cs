using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class ImoNumberTests
    {
        [Fact]
        public void Constructor_ShouldCreateValidImo_WhenFormatIsCorrect()
        {
            var imo = new ImoNumber("IMO 9074729");
            Assert.Equal("9074729", imo.Value);
            Assert.Equal("IMO 9074729", imo.ToString());
        }

        [Fact]
        public void Constructor_ShouldAcceptLowercaseAndSpaces()
        {
            var imo = new ImoNumber(" imo 9074729 ");
            Assert.Equal("9074729", imo.Value);
            Assert.Equal("IMO 9074729", imo.ToString());
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Constructor_ShouldThrow_WhenEmpty(string? input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ImoNumber(input!));
            Assert.Equal("IMO Number can't be empty. Must follow format: IMO ####### or #######", ex.Message);
        }
        

        [Theory]
        [InlineData("IMO 90747A9")]
        [InlineData("90747A9")]
        public void Constructor_ShouldThrow_WhenContainsLetters(string input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ImoNumber(input));
            Assert.Equal("IMO Number can only contain digits.", ex.Message);
        }

        [Theory]
        [InlineData("IMO 907472")]
        [InlineData("907472")]
        [InlineData("IMO 90747291")]
        public void Constructor_ShouldThrow_WhenInvalidLength(string input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ImoNumber(input));
            Assert.Equal("IMO Number must have exactly 7 digits (6 base digits + 1 check digit).", ex.Message);
        }

        [Theory]
        [InlineData("IMO 9074728")]
        [InlineData("9074728")]
        public void Constructor_ShouldThrow_WhenInvalidCheckDigit(string input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ImoNumber(input));
            Assert.Contains("Invalid IMO Number: Check Digit doesn't match", ex.Message);
        }

        [Fact]
        public void ToString_ShouldReturnNormalizedValue()
        {
            var imo = new ImoNumber("9074729");
            Assert.Equal("IMO 9074729", imo.ToString());
        }

        [Fact]
        public void ImoNumbers_WithSameValue_ShouldBeEqual()
        {
            var i1 = new ImoNumber("IMO 9074729");
            var i2 = new ImoNumber("9074729");
            Assert.Equal(i1.Value, i2.Value);
        }

        [Fact]
        public void ImoNumbers_WithDifferentValue_ShouldNotBeEqual()
        {
            var i1 = new ImoNumber("IMO 9074729");
            var i2 = new ImoNumber("IMO 8814275");
            Assert.NotEqual(i1.Value, i2.Value);
        }
    }
}
