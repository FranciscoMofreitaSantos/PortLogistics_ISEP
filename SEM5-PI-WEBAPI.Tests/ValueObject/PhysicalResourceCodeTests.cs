using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class PhysicalResourceCodeTests
    {
        [Theory]
        [InlineData("GEN-0001")]
        [InlineData("GENEQ-1234")]
        [InlineData("DOCKA-5678")]
        [InlineData("CRANE-9999")]
        [InlineData("WAREH-0000")]
        public void Constructor_ShouldCreate_WhenValid(string input)
        {
            var code = new PhysicalResourceCode(input);

            Assert.Equal(input, code.Value);
            Assert.Equal(input, code.ToString());
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Constructor_ShouldThrow_WhenEmpty(string? input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new PhysicalResourceCode(input!));
            Assert.Equal("Code cannot be empty.", ex.Message);
        }

        [Theory]
        [InlineData("gen-0001")]       // minúsculas
        [InlineData("G-0001")]         // prefixo demasiado curto
        [InlineData("GENERATOR-0001")] // prefixo demasiado longo
        [InlineData("GEN-01")]         // menos de 4 dígitos
        [InlineData("GEN-00001")]      // mais de 4 dígitos
        [InlineData("GEN0001")]        // sem hífen
        [InlineData("GEN_0001")]       // sublinhado em vez de hífen
        [InlineData("123-0001")]       // prefixo numérico
        public void Constructor_ShouldThrow_WhenInvalidFormat(string input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new PhysicalResourceCode(input));
            Assert.Equal("Invalid code format. Expected: PREFIX-0001.", ex.Message);
        }
    }
}