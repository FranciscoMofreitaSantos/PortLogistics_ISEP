using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class ShippingOrganizationCodeTests
    {
        [Fact]
        public void Constructor_ShouldCreateValidCode_WhenUpTo10AlphanumericCharacters()
        {
            // Arrange
            var codeValue = "A12345Z9"; // 8 characters, alphanumeric

            // Act
            var code = new ShippingOrganizationCode(codeValue);

            // Assert
            Assert.NotNull(code);
            Assert.Equal(codeValue.ToUpper(), code.Value);
        }

        [Fact]
        public void Constructor_ShouldTrimAndNormalizeInput()
        {
            // Arrange
            var codeValue = "   ab123cd456   ";

            // Act
            var code = new ShippingOrganizationCode(codeValue);

            // Assert
            Assert.Equal("AB123CD456", code.Value);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("     ")]
        public void Constructor_ShouldThrow_WhenNullOrEmpty(string? value)
        {
            // Act + Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ShippingOrganizationCode(value!));
            Assert.Equal("ShippingOrganizationCode can't be empty. Must be at most 10 alphanumeric characters.", ex.Message);
        }

        [Theory]
        [InlineData("12345678901")] // 11 chars
        [InlineData("ABCDEFGHIJK")] // 11 chars
        public void Constructor_ShouldThrow_WhenLongerThan10Chars(string value)
        {
            // Act + Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ShippingOrganizationCode(value));
            Assert.Equal("ShippingOrganizationCode must have at most 10 alphanumeric characters.", ex.Message);
        }

        [Theory]
        [InlineData("1234-6789")]  // dash
        [InlineData("CODE!1234")]  // symbol
        [InlineData("ABC@1234")]   // special char
        public void Constructor_ShouldThrow_WhenContainsInvalidCharacters(string value)
        {
            // Act + Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ShippingOrganizationCode(value));
            Assert.Equal("ShippingOrganizationCode can only contain letters and digits.", ex.Message);
        }

        [Fact]
        public void Equals_ShouldReturnTrue_ForSameValue()
        {
            var a = new ShippingOrganizationCode("ABC123");
            var b = new ShippingOrganizationCode("ABC123");

            Assert.True(a.Equals(b));
            Assert.Equal(a.GetHashCode(), b.GetHashCode());
        }

        [Fact]
        public void Equals_ShouldReturnFalse_ForDifferentValue()
        {
            var a = new ShippingOrganizationCode("ABC123");
            var b = new ShippingOrganizationCode("XYZ789");

            Assert.False(a.Equals(b));
        }

        [Fact]
        public void ToString_ShouldReturnValue()
        {
            var code = new ShippingOrganizationCode("ABCD1234");
            Assert.Equal("ABCD1234", code.ToString());
        }

        [Fact]
        public void FromString_ShouldReturnEquivalentObject()
        {
            var value = "XYZ001";
            var code = ShippingOrganizationCode.FromString(value);

            Assert.NotNull(code);
            Assert.Equal("XYZ001", code.Value);
        }
    }
}
