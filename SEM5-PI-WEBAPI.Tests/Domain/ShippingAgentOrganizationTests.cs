using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using Xunit;

namespace SEM5_PI_WEBAPI.Tests.Domain
{
    public class ShippingAgentOrganizationTests
    {
        private ShippingOrganizationCode ValidOrgCode => new ShippingOrganizationCode("AB12XYZ9");
        private TaxNumber ValidTaxNumber => new TaxNumber("PT123456789");

        [Fact]
        public void CreateShippingAgentOrganization_WithValidData_ShouldInitializeCorrectly()
        {
            var org = new ShippingAgentOrganization(
                ValidOrgCode,
                "Evergreen Marine Portugal",
                "Evergreen Shipping",
                "Rua da Ria 45, Porto, Portugal",
                ValidTaxNumber);

            Assert.NotNull(org.Id);
            Assert.Equal(ValidOrgCode, org.ShippingOrganizationCode);
            Assert.Equal("Evergreen Marine Portugal", org.LegalName);
            Assert.Equal("Evergreen Shipping", org.AltName);
            Assert.Equal("Rua da Ria 45, Porto, Portugal", org.Address);
            Assert.Equal(ValidTaxNumber.Value, org.Taxnumber.Value);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void CreateShippingAgentOrganization_WithInvalidCode_ShouldThrow(string? invalidCode)
        {
            var taxNumber = new TaxNumber("PT123456789");

            Assert.Throws<BusinessRuleValidationException>(() =>
                new ShippingAgentOrganization(
                    new ShippingOrganizationCode(invalidCode!),
                    "Evergreen Marine Portugal",
                    "Evergreen Shipping",
                    "Rua da Ria 45, Porto, Portugal",
                    taxNumber)
            );
        }

        [Fact]
        public void CreateShippingAgentOrganization_WithTooLongCode_ShouldThrow()
        {
            Assert.Throws<BusinessRuleValidationException>(() =>
                new ShippingAgentOrganization(
                    new ShippingOrganizationCode("ABCDEFGHIJK"), // 11 chars
                    "Evergreen",
                    "EG",
                    "Porto",
                    ValidTaxNumber)
            );
        }

        [Fact]
        public void CreateShippingAgentOrganization_WithInvalidCharacters_ShouldThrow()
        {
            Assert.Throws<BusinessRuleValidationException>(() =>
                new ShippingAgentOrganization(
                    new ShippingOrganizationCode("CODE!123"), // invalid symbol
                    "Evergreen",
                    "EG",
                    "Porto",
                    ValidTaxNumber)
            );
        }

        [Fact]
        public void Equals_ShouldReturnTrue_ForSameId()
        {
            var org1 = new ShippingAgentOrganization(ValidOrgCode, "Evergreen", "EG", "Porto", ValidTaxNumber);
            var org2 = new ShippingAgentOrganization(ValidOrgCode, "Evergreen", "EG", "Porto", ValidTaxNumber);

            typeof(Entity<ShippingAgentOrganizationId>)
                .GetProperty("Id")!
                .SetValue(org2, org1.Id);

            Assert.True(org1.Equals(org2));
        }

        [Fact]
        public void GetHashCode_ShouldReturnSameValue_ForSameId()
        {
            var org1 = new ShippingAgentOrganization(ValidOrgCode, "Evergreen", "EG", "Porto", ValidTaxNumber);
            var org2 = new ShippingAgentOrganization(ValidOrgCode, "Evergreen", "EG", "Porto", ValidTaxNumber);

            typeof(Entity<ShippingAgentOrganizationId>)
                .GetProperty("Id")!
                .SetValue(org2, org1.Id);

            Assert.Equal(org1.GetHashCode(), org2.GetHashCode());
        }

        [Fact]
        public void ToString_ShouldIncludeKeyDetails()
        {
            var org = new ShippingAgentOrganization(
                ValidOrgCode,
                "Evergreen Marine Portugal",
                "Evergreen Shipping",
                "Rua da Ria 45, Porto, Portugal",
                ValidTaxNumber);

            var result = org.ToString();

            Assert.Contains("Evergreen Marine Portugal", result);
            Assert.Contains("Rua da Ria 45", result);
            Assert.Contains("PT123456789", result);
        }
    }
}