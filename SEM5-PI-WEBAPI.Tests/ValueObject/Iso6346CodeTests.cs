using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class Iso6346CodeTests
    {
        [Theory]
        [InlineData("MSCU6639870")] // exemplo real válido
        [InlineData("CSQU3054383")]
        [InlineData("MSCU 6639870")] // com espaço
        [InlineData("mscu6639870")] // minúsculas
        public void Constructor_ShouldCreate_WhenValid(string code)
        {
            var iso = new Iso6346Code(code);
            Assert.Equal(code.Replace(" ", "").ToUpper(), iso.Value);
            Assert.Equal(code.Replace(" ", "").ToUpper(), iso.ToString());
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Constructor_ShouldThrow_WhenEmpty(string? input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new Iso6346Code(input!));
            Assert.Equal("ISO 6346 code can't be empty.", ex.Message);
        }

        [Theory]
        [InlineData("MSC6639870")]    // só 3 letras
        [InlineData("MSCU663987")]    // só 6 dígitos
        [InlineData("MSC12345678")]   // só 3 letras e dígitos a mais
        [InlineData("MSCU12345A1")]   // contém letra nos dígitos
        [InlineData("12345678901")]   // começa com dígitos
        public void Constructor_ShouldThrow_WhenInvalidFormat(string input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new Iso6346Code(input));
            Assert.Equal("Invalid ISO 6346 format. Must be 4 letters + 7 digits.", ex.Message);
        }

        [Theory]
        [InlineData("MSCU6639871")] // o correto é 0
        [InlineData("CSQU3054381")] // o correto é 3
        [InlineData("TGHU5170935")] // o correto é 7
        public void Constructor_ShouldThrow_WhenCheckDigitInvalid(string input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new Iso6346Code(input));
            Assert.Equal("Invalid ISO 6346 code: check digit does not match.", ex.Message);
        }
    }
}
