using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class DockCodeTests
    {

        [Fact]
        public void Constructor_ShouldCreateDockCode_WhenValidFormat()
        {
            var code = "DK-0123";

            var dockCode = new DockCode(code);

            Assert.Equal(code, dockCode.Value);
            Assert.Equal("DK-0123", dockCode.ToString());
        }

        [Theory]
        [InlineData("DK-0000")]
        [InlineData("DK-9999")]
        [InlineData("DK-1234")]
        public void Constructor_ShouldAcceptValidFormats(string code)
        {
            var dockCode = new DockCode(code);

            Assert.Equal(code, dockCode.Value);
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Constructor_ShouldThrow_WhenEmptyOrNull(string? code)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new DockCode(code!));
            Assert.Equal("Dock code cannot be empty.", ex.Message);
        }

        [Theory]
        [InlineData("DK1234")]
        [InlineData("dk-1234")] 
        [InlineData("DK-12A4")] 
        [InlineData("PX-1234")] 
        [InlineData("DK-12345")] 
        [InlineData("DK-12")]
        public void Constructor_ShouldThrow_WhenInvalidFormat(string code)
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new DockCode(code));
            Assert.Equal("Invalid Dock code. Expected format: DK-0000.", ex.Message);
        }
        

        [Fact]
        public void ToString_ShouldReturnValue()
        {
            var code = "DK-0456";
            var dockCode = new DockCode(code);

            var result = dockCode.ToString();

            Assert.Equal(code, result);
        }

        [Fact]
        public void DockCodes_WithSameValue_ShouldBeEqual()
        {
            var d1 = new DockCode("DK-1234");
            var d2 = new DockCode("DK-1234");

            Assert.Equal(d1.Value, d2.Value);
        }

        [Fact]
        public void DockCodes_WithDifferentValue_ShouldNotBeEqual()
        {
            var d1 = new DockCode("DK-0001");
            var d2 = new DockCode("DK-0002");

            Assert.NotEqual(d1.Value, d2.Value);
        }
    }
}
