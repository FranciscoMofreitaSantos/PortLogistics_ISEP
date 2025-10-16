using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class ShippingOrganizationCodeTests
    {
        [Fact]
        public void Constructor_ShouldCreateValidCode_When10Digits()
        {
            // Arrange
            var codeValue = "1234567890";

            // Act
            var code = new ShippingOrganizationCode(codeValue);

            // Assert
            Assert.NotNull(code);
            Assert.Equal(codeValue, code.Value);
        }

        [Fact]
        public void Constructor_ShouldTrimAndNormalizeInput()
        {
            // Arrange
            var codeValue = "   1234567890   ";

            // Act
            var code = new ShippingOrganizationCode(codeValue);

            // Assert
            Assert.Equal("1234567890", code.Value);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("     ")]
        public void Constructor_ShouldThrow_WhenNullOrEmpty(string? value)
        {
            // Act + Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ShippingOrganizationCode(value!));
            Assert.Equal("ShippingOrganizationCode can't be empty. Must be 10 digits.", ex.Message);
        }

        [Theory]
        [InlineData("12345")]            // too short
        [InlineData("1234567890123")]    // too long
        public void Constructor_ShouldThrow_WhenInvalidLength(string value)
        {
            // Act + Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ShippingOrganizationCode(value));
            Assert.Equal("ShippingOrganizationCode must have exactly 10 digits.", ex.Message);
        }

        [Theory]
        [InlineData("ABCDEFGHIJ")]
        [InlineData("12345ABCDE")]
        [InlineData("1234-67890")]
        [InlineData("12345678A1")]
        public void Constructor_ShouldThrow_WhenContainsNonDigits(string value)
        {
            // Act + Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ShippingOrganizationCode(value));
            Assert.Equal("ShippingOrganizationCode can only contain digits.", ex.Message);
        }

        [Fact]
        public void Equals_ShouldReturnTrue_ForSameValue()
        {
            // Arrange
            var a = new ShippingOrganizationCode("1234567890");
            var b = new ShippingOrganizationCode("1234567890");

            // Act + Assert
            Assert.True(a.Equals(b));
            Assert.True(a.Equals((object)b));
            Assert.Equal(a.GetHashCode(), b.GetHashCode());
        }

        [Fact]
        public void Equals_ShouldReturnFalse_ForDifferentValue()
        {
            var a = new ShippingOrganizationCode("1234567890");
            var b = new ShippingOrganizationCode("0987654321");

            Assert.False(a.Equals(b));
        }

        [Fact]
        public void ToString_ShouldReturnValue()
        {
            var code = new ShippingOrganizationCode("1234567890");

            Assert.Equal("1234567890", code.ToString());
        }

        [Fact]
        public void FromString_ShouldReturnEquivalentObject()
        {
            var value = "1112223334";

            var code = ShippingOrganizationCode.FromString(value);

            Assert.NotNull(code);
            Assert.Equal(value, code.Value);
        }
    }
}
