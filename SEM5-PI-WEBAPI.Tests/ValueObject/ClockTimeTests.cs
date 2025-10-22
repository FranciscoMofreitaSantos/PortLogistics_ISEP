using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.ValueObject
{
    public class ClockTimeTests
    {

        [Fact]
        public void Constructor_ShouldSetValue_WhenValidYear()
        {
            // Arrange
            var date = new DateTime(2025, 10, 12, 14, 30, 0);

            // Act
            var clockTime = new ClockTime(date);

            // Assert
            Assert.Equal(date, clockTime.Value);
            Assert.Equal("2025-10-12 14:30:00 UTC", clockTime.ToString());
        }

        [Theory]
        [InlineData(2101, 1, 1, 0, 0, 0)]
        public void Constructor_ShouldThrow_WhenYearIsOutsideAllowedRange(int year, int month, int day, int hour, int minute, int second)
        {
            // Arrange
            var invalidDate = new DateTime(year, month, day, hour, minute, second);

            // Act & Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ClockTime(invalidDate));
            Assert.Equal("Invalid year for VVN time: 2101", ex.Message);
        }
        
        [Theory]
        [InlineData(1999, 12, 31, 23, 59, 0)]
        public void Constructor_ShouldThrow_WhenYearIsOutsideAllowedRangee(int year, int month, int day, int hour, int minute, int second)
        {
            // Arrange
            var invalidDate = new DateTime(year, month, day, hour, minute, second);

            // Act & Assert
            var ex = Assert.Throws<BusinessRuleValidationException>(() => new ClockTime(invalidDate));
            Assert.Equal("Invalid year for VVN time: 1999", ex.Message);
        }
        [Fact]
        public void ClockTimes_WithSameValue_ShouldBeEqual()
        {
            // Arrange
            var date = new DateTime(2025, 10, 12, 15, 0, 0);
            var t1 = new ClockTime(date);
            var t2 = new ClockTime(date);

            // Act & Assert
            Assert.Equal(t1.Value, t2.Value);
            Assert.Equal(t1.ToString(), t2.ToString());
        }

        [Fact]
        public void ClockTimes_WithDifferentValues_ShouldNotBeEqual()
        {
            // Arrange
            var t1 = new ClockTime(new DateTime(2025, 10, 12, 10, 0, 0));
            var t2 = new ClockTime(new DateTime(2025, 10, 13, 10, 0, 0));

            // Act & Assert
            Assert.NotEqual(t1.Value, t2.Value);
        }
        

        [Fact]
        public void ToString_ShouldReturnFormattedDate()
        {
            // Arrange
            var date = new DateTime(2025, 1, 5, 8, 45, 0);
            var clockTime = new ClockTime(date);

            // Act
            var formatted = clockTime.ToString();

            // Assert
            Assert.Equal("2025-01-05 08:45:00 UTC", formatted);
        }
    }
}
