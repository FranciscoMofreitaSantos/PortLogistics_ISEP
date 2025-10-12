using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class VvnCodeTests
    {
        [Fact]
        public void Constructor_Parts_ShouldCreate_WhenValid()
        {
            var vvn = new VvnCode("2025", "000123");

            Assert.Equal("2025-THPA-000123", vvn.Code);
            Assert.Equal(2025, vvn.YearNumber);
            Assert.Equal(123, vvn.SequenceNumber);
            Assert.Equal("2025-THPA-000123", vvn.ToString());
        }

        [Theory]
        [InlineData("1999", "000001")]
        [InlineData("2101", "000001")]
        public void Constructor_Parts_ShouldThrow_WhenYearOutOfRange(string year, string seq)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new VvnCode(year, seq));
            Assert.Equal("Invalid YEAR for VVN Code. Must be between 2000 and 2100.", ex.Message);
        }

        [Theory]
        [InlineData("", "000001")]
        [InlineData("abcd", "000001")]
        [InlineData("202", "000001")]
        public void Constructor_Parts_ShouldThrow_WhenInvalidYear(string year, string seq)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new VvnCode(year, seq));
            Assert.StartsWith("Invalid YEAR", ex.Message);
        }

        [Theory]
        [InlineData("2025", "")]
        [InlineData("2025", "abc")]
        [InlineData("2025", "12345")]   // apenas 5 dígitos
        [InlineData("2025", "1234567")] // 7 dígitos
        public void Constructor_Parts_ShouldThrow_WhenInvalidSequence(string year, string seq)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new VvnCode(year, seq));
            Assert.StartsWith("Invalid SEQUENCE", ex.Message);
        }

        [Fact]
        public void Constructor_FullCode_ShouldCreate_WhenValid()
        {
            var vvn = new VvnCode("2025-THPA-000777");

            Assert.Equal("2025-THPA-000777", vvn.Code);
            Assert.Equal(2025, vvn.YearNumber);
            Assert.Equal(777, vvn.SequenceNumber);
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Constructor_FullCode_ShouldThrow_WhenEmpty(string? input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new VvnCode(input!));
            Assert.Equal("VVN Code cannot be null or empty.", ex.Message);
        }

        [Theory]
        [InlineData("2025-THPA-12345")]   // 5 dígitos
        [InlineData("2025-THPA-1234567")] // 7 dígitos
        [InlineData("20A5-THPA-123456")]  // ano inválido
        [InlineData("2025-TPHA-XXXXXX")]  // sequência inválida
        [InlineData("2025THPA123456")]    // sem hífens
        public void Constructor_FullCode_ShouldThrow_WhenInvalidFormat(string input)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new VvnCode(input));
            Assert.StartsWith("Invalid VVN code format", ex.Message);
        }

        [Fact]
        public void Equals_ShouldReturnTrue_WhenCodesMatch()
        {
            var a = new VvnCode("2025-THPA-000001");
            var b = new VvnCode("2025-THPA-000001");

            Assert.True(a.Equals(b));
            Assert.Equal(a.GetHashCode(), b.GetHashCode());
        }

        [Fact]
        public void Equals_ShouldReturnFalse_WhenCodesDiffer()
        {
            var a = new VvnCode("2025-THPA-000001");
            var b = new VvnCode("2025-THPA-000002");

            Assert.False(a.Equals(b));
        }
    }
}
