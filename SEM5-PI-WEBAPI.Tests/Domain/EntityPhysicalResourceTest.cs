using SEM5_PI_WEBAPI.Domain.PhysicalResources;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Tests.Domain
{
    public class EntityPhysicalResourceTests
    {
        private PhysicalResourceCode ValidCode => new PhysicalResourceCode("TRUCK-0001");
        private QualificationId ValidGlobalQualification => new QualificationId(Guid.NewGuid());

        [Fact]
        public void CreatePhysicalResource_WithValidData_ShouldInitializeCorrectly()
        {
            QualificationId ValidLocalQualification = new QualificationId(Guid.NewGuid());
            
            EntityPhysicalResource resource = new(
                ValidCode,
                "Dock Crane A",
                25.5,
                10,
                PhysicalResourceType.Truck,
                ValidLocalQualification
            );

            Assert.Equal("Dock Crane A", resource.Description);
            Assert.Equal(25.5, resource.OperationalCapacity);
            Assert.Equal(10, resource.SetupTime);
            Assert.Equal(PhysicalResourceType.Truck, resource.Type);
            Assert.Equal(PhysicalResourceStatus.Available, resource.Status);
            Assert.Equal(ValidLocalQualification, resource.QualificationID);
            Assert.NotEqual(Guid.Empty, resource.Id.AsGuid());

        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void CreatePhysicalResource_WithInvalidDescription_ShouldThrow(string? invalid)
        {
            Assert.Throws<BusinessRuleValidationException>(() =>
                new EntityPhysicalResource(ValidCode, invalid!, 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification));
        }

        [Fact]
        public void CreatePhysicalResource_WithTooLongDescription_ShouldThrow()
        {
            string longDesc = new string('A', 256);
            Assert.Throws<BusinessRuleValidationException>(() =>
                new EntityPhysicalResource(ValidCode, longDesc, 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification));
        }

        [Fact]
        public void CreatePhysicalResource_WithNegativeOperationalCapacity_ShouldThrow()
        {
            Assert.Throws<BusinessRuleValidationException>(() =>
                new EntityPhysicalResource(ValidCode, "Dock Crane A", -5, 10, PhysicalResourceType.Truck, ValidGlobalQualification));
        }

        [Fact]
        public void CreatePhysicalResource_WithNegativeSetupTime_ShouldThrow()
        {
            Assert.Throws<BusinessRuleValidationException>(() =>
                new EntityPhysicalResource(ValidCode, "Dock Crane A", 25, -2, PhysicalResourceType.Truck, ValidGlobalQualification));
        }

        [Fact]
        public void CreatePhysicalResource_WithInvalidType_ShouldThrow()
        {
            var invalidType = (PhysicalResourceType)999;
            Assert.Throws<BusinessRuleValidationException>(() =>
                new EntityPhysicalResource(ValidCode, "Crane", 25, 10, invalidType, ValidGlobalQualification));
        }

        [Fact]
        public void UpdateDescription_WithValidValue_ShouldChangeDescription()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Old Desc", 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification);

            resource.UpdateDescription("New Desc");

            Assert.Equal("New Desc", resource.Description);
        }

        [Fact]
        public void UpdateDescription_WithInvalidValue_ShouldThrow()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Valid Desc", 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification);

            Assert.Throws<BusinessRuleValidationException>(() => resource.UpdateDescription(""));
        }

        [Fact]
        public void UpdateOperationalCapacity_WithValidValue_ShouldChange()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Truck A", 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification);

            resource.UpdateOperationalCapacity(50);

            Assert.Equal(50, resource.OperationalCapacity);
        }

        [Fact]
        public void UpdateOperationalCapacity_WithNegativeValue_ShouldThrow()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Truck A", 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification);

            Assert.Throws<BusinessRuleValidationException>(() => resource.UpdateOperationalCapacity(-10));
        }

        [Fact]
        public void UpdateSetupTime_WithValidValue_ShouldChange()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Truck A", 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification);

            resource.UpdateSetupTime(5);

            Assert.Equal(5, resource.SetupTime);
        }

        [Fact]
        public void UpdateSetupTime_WithNegativeValue_ShouldThrow()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Truck A", 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification);

            Assert.Throws<BusinessRuleValidationException>(() => resource.UpdateSetupTime(-3));
        }

        [Fact]
        public void UpdateStatus_WithInvalidValue_ShouldThrow()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Truck A", 25, 10, PhysicalResourceType.Truck, ValidGlobalQualification);

            var invalidStatus = (PhysicalResourceStatus)999;

            Assert.Throws<BusinessRuleValidationException>(() => resource.UpdateStatus(invalidStatus));
        }

        [Fact]
        public void UpdateQualification_ShouldChangeQualificationId()
        {
            var resource = new EntityPhysicalResource(ValidCode, "Truck A", 25, 10, PhysicalResourceType.Truck, null);
            var newQual = new QualificationId(Guid.NewGuid());

            resource.UpdateQualification(newQual);

            Assert.Equal(newQual, resource.QualificationID);
        }
        
    }
}
