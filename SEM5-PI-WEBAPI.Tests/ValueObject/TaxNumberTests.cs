using SEM5_PI_WEBAPI.Domain.ValueObjects;
using Xunit;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class TaxNumberTests
    {
        [Theory]
        [InlineData("PT123456789")]
        [InlineData("pt 123 456 789")] // espaços e minúsculas
        [InlineData("DE123456789")]
        [InlineData("FRAB123456789")]
        [InlineData("ESX1234567A")] // formato espanhol
        public void Constructor_ShouldCreate_WhenValid(string input)
        {
            var tax = new TaxNumber(input);
            Assert.Equal(tax.Value, tax.ToString());
            Assert.Equal(input.Trim().Replace(" ", "").Replace("-", "").ToUpper(), tax.Value);
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Constructor_ShouldThrow_WhenEmpty(string? input)
        {
            var ex = Assert.Throws<ArgumentException>(() => new TaxNumber(input!));
            Assert.Contains("Tax number cannot be null or empty", ex.Message);
        }

        [Theory]
        [InlineData("ZZ123456789")]
        [InlineData("AA987654321")]
        [InlineData("1X123456789")]
        public void Constructor_ShouldThrow_WhenUnsupportedCountryCode(string input)
        {
            var ex = Assert.Throws<ArgumentException>(() => new TaxNumber(input));
            Assert.Contains("Unsupported country code", ex.Message);
        }

        [Theory]
        [InlineData("PT12345")]        // poucos dígitos
        [InlineData("PTABCDEFGHI")]    // letras em vez de dígitos
        [InlineData("DE12345X89")]     // caractere inválido
        public void Constructor_ShouldThrow_WhenInvalidFormat(string input)
        {
            var ex = Assert.Throws<ArgumentException>(() => new TaxNumber(input));
            Assert.Contains("Invalid", ex.Message);
        }

        [Fact]
        public void TryParse_ShouldReturnTrue_WhenValid()
        {
            var ok = TaxNumber.TryParse("PT123456789", out var tax);
            Assert.True(ok);
            Assert.NotNull(tax);
            Assert.Equal("PT123456789", tax!.Value);
        }

        [Fact]
        public void TryParse_ShouldReturnFalse_WhenInvalid()
        {
            var ok = TaxNumber.TryParse("XXINVALID123", out var tax);
            Assert.False(ok);
            Assert.Null(tax);
        }
    }
}
