using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class StorageAreaDockDistanceTests
    {
        [Fact]
        public void Constructor_ShouldCreate_WhenValid()
        {
            var dock = new DockCode("DK-0001");
            var distance = 120.5f;

            var obj = new StorageAreaDockDistance(dock, distance);

            Assert.Equal(dock, obj.Dock);
            Assert.Equal(distance, obj.Distance);
        }

        [Fact]
        public void Constructor_ShouldThrow_WhenDockIsNull()
        {
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new StorageAreaDockDistance(null!, 50));
            Assert.Equal("Dock cannot be null", ex.Message);
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(-0.1)]
        public void Constructor_ShouldThrow_WhenDistanceIsNegative(float distance)
        {
            var dock = new DockCode("DK-0001");
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new StorageAreaDockDistance(dock, distance));
            Assert.Equal("Distance cannot be negative.", ex.Message);
        }

        [Fact]
        public void Constructor_ShouldAllowZeroDistance()
        {
            var dock = new DockCode("DK-0002");
            var obj = new StorageAreaDockDistance(dock, 0);
            Assert.Equal(0, obj.Distance);
        }
    }
}