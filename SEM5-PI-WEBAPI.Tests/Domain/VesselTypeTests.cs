using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Tests.Domain
{
    public class VesselTypeTests
    {
        private const string ValidName = "Container Carrier";
        private const string ValidDescription = "Large vessel used for container transport";
        private const int ValidBays = 10;
        private const int ValidRows = 8;
        private const int ValidTiers = 6;

        private VesselType CreateValidVesselType() =>
            new VesselType(ValidName, ValidBays, ValidRows, ValidTiers, ValidDescription);
        

        [Fact]
        public void CreateVesselType_WithValidData_ShouldSucceed()
        {
            var vesselType = CreateValidVesselType();

            Assert.Equal(ValidName, vesselType.Name);
            Assert.Equal(ValidDescription, vesselType.Description);
            Assert.Equal(ValidBays, vesselType.MaxBays);
            Assert.Equal(ValidRows, vesselType.MaxRows);
            Assert.Equal(ValidTiers, vesselType.MaxTiers);
            Assert.Equal(ValidBays * ValidRows * ValidTiers, vesselType.Capacity);
            Assert.NotNull(vesselType.Id);
        }

        [Fact]
        public void CreateVesselType_WithNullDescription_ShouldUseDefault()
        {
            var vesselType = new VesselType(ValidName, ValidBays, ValidRows, ValidTiers, null);

            Assert.Equal("No description", vesselType.Description);
        }

        [Fact]
        public void CreateVesselType_WithEmptyName_ShouldThrow()
        {
            Assert.Throws<BusinessRuleValidationException>(() =>
                new VesselType("", ValidBays, ValidRows, ValidTiers, ValidDescription));
        }

        [Fact]
        public void CreateVesselType_WithTooLongName_ShouldThrow()
        {
            var longName = new string('A', 51);
            Assert.Throws<BusinessRuleValidationException>(() =>
                new VesselType(longName, ValidBays, ValidRows, ValidTiers, ValidDescription));
        }

        [Fact]
        public void CreateVesselType_WithTooShortDescription_ShouldThrow()
        {
            var shortDesc = "TooShort";
            Assert.Throws<BusinessRuleValidationException>(() =>
                new VesselType(ValidName, ValidBays, ValidRows, ValidTiers, shortDesc));
        }

        [Fact]
        public void CreateVesselType_WithTooLongDescription_ShouldThrow()
        {
            var longDesc = new string('A', 201);
            Assert.Throws<BusinessRuleValidationException>(() =>
                new VesselType(ValidName, ValidBays, ValidRows, ValidTiers, longDesc));
        }

        [Theory]
        [InlineData(0, 8, 6)]
        [InlineData(10, 0, 6)]
        [InlineData(10, 8, 0)]
        public void CreateVesselType_WithInvalidDimensions_ShouldThrow(int bays, int rows, int tiers)
        {
            Assert.Throws<BusinessRuleValidationException>(() =>
                new VesselType(ValidName, bays, rows, tiers, ValidDescription));
        }
        

        [Fact]
        public void ChangeName_ShouldUpdateName_WhenValid()
        {
            var vesselType = CreateValidVesselType();
            vesselType.ChangeName("Mega Carrier");
            Assert.Equal("Mega Carrier", vesselType.Name);
        }

        [Fact]
        public void ChangeName_ShouldThrow_WhenEmpty()
        {
            var vesselType = CreateValidVesselType();
            Assert.Throws<BusinessRuleValidationException>(() => vesselType.ChangeName(""));
        }

        [Fact]
        public void ChangeDescription_ShouldUpdateDescription_WhenValid()
        {
            var vesselType = CreateValidVesselType();
            vesselType.ChangeDescription("Updated vessel description for heavy cargo use");
            Assert.Contains("Updated vessel", vesselType.Description);
        }

        [Fact]
        public void ChangeDescription_ShouldRevertToDefault_WhenNull()
        {
            var vesselType = CreateValidVesselType();
            vesselType.ChangeDescription(null);
            Assert.Equal("No description", vesselType.Description);
        }

        [Fact]
        public void ChangeDimensions_ShouldRecalculateCapacity()
        {
            var vesselType = CreateValidVesselType();
            vesselType.ChangeDimensions(12, 10, 8);

            Assert.Equal(12, vesselType.MaxBays);
            Assert.Equal(10, vesselType.MaxRows);
            Assert.Equal(8, vesselType.MaxTiers);
            Assert.Equal(12 * 10 * 8, vesselType.Capacity);
        }

        [Fact]
        public void ChangeDimensions_ShouldThrow_WhenInvalid()
        {
            var vesselType = CreateValidVesselType();
            Assert.Throws<BusinessRuleValidationException>(() =>
                vesselType.ChangeDimensions(0, 10, 10));
        }

        [Fact]
        public void ChangeMaxBays_ShouldUpdateValue()
        {
            var vesselType = CreateValidVesselType();
            vesselType.ChangeMaxBays(15);
            Assert.Equal(15, vesselType.MaxBays);
        }

        [Fact]
        public void ChangeMaxRows_ShouldUpdateValue()
        {
            var vesselType = CreateValidVesselType();
            vesselType.ChangeMaxRows(20);
            Assert.Equal(20, vesselType.MaxRows);
        }

        [Fact]
        public void ChangeMaxTiers_ShouldUpdateValue()
        {
            var vesselType = CreateValidVesselType();
            vesselType.ChangeMaxTiers(25);
            Assert.Equal(25, vesselType.MaxTiers);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-5)]
        public void ChangeMaxBays_ShouldThrow_WhenInvalid(int invalidValue)
        {
            var vesselType = CreateValidVesselType();
            Assert.Throws<BusinessRuleValidationException>(() => vesselType.ChangeMaxBays(invalidValue));
        }
        

        [Fact]
        public void Equals_ShouldReturnTrue_ForSameId()
        {
            var v1 = CreateValidVesselType();
            var v2 = v1;
            Assert.True(v1.Equals(v2));
        }

        [Fact]
        public void Equals_ShouldReturnFalse_ForDifferentId()
        {
            var v1 = CreateValidVesselType();
            var v2 = CreateValidVesselType();
            Assert.False(v1.Equals(v2));
        }

        [Fact]
        public void ToString_ShouldContainKeyAttributes()
        {
            var vesselType = CreateValidVesselType();
            var str = vesselType.ToString();
            Assert.Contains(vesselType.Name, str);
            Assert.Contains(vesselType.Capacity.ToString(), str);
        }
    }
}
