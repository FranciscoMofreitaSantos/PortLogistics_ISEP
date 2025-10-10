using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.Shared;
using Xunit;

namespace SEM5_PI_WEBAPI.Tests.Domain;

public class EntityContainerTests
{
    private const string ValidIsoCode = "MSCU6639870"; // válido ISO6346
    private const string ValidDescription = "Container used for transporting electronics";
    private const double ValidWeight = 1000.0;

    // ---------- CREATION ----------
    [Fact]
    public void CreateContainer_WithValidData_ShouldInitializeCorrectly()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        Assert.NotNull(container.Id);
        Assert.Equal(ValidIsoCode, container.ISOId.Value);
        Assert.Equal(ValidDescription, container.Description);
        Assert.Equal(ContainerType.General, container.Type);
        Assert.Equal(ContainerStatus.Empty, container.Status); // default
        Assert.Equal(ValidWeight, container.WeightKg);
    }

    [Fact]
    public void CreateContainer_WithNegativeWeight_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, -1));
    }

    [Fact]
    public void CreateContainer_WithZeroWeight_ShouldBeValid()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, 0);
        Assert.Equal(0, container.WeightKg);
    }

    [Fact]
    public void CreateContainer_WithTooShortDescription_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new EntityContainer(ValidIsoCode, "short", ContainerType.Reefer, ValidWeight));
    }

    [Fact]
    public void CreateContainer_WithTooLongDescription_ShouldThrow()
    {
        var longDesc = new string('a', 200);
        Assert.Throws<BusinessRuleValidationException>(() =>
            new EntityContainer(ValidIsoCode, longDesc, ContainerType.Reefer, ValidWeight));
    }

    [Fact]
    public void CreateContainer_WithWhitespaceDescription_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new EntityContainer(ValidIsoCode, "    ", ContainerType.Reefer, ValidWeight));
    }

    [Fact]
    public void CreateContainer_WithNullDescription_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new EntityContainer(ValidIsoCode, null!, ContainerType.Reefer, ValidWeight));
    }

    // ---------- UPDATE ----------
    [Fact]
    public void UpdateStatus_ShouldChangeContainerStatus()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        container.UpdateStatus(ContainerStatus.Full);

        Assert.Equal(ContainerStatus.Full, container.Status);
    }

    [Fact]
    public void UpdateType_ShouldChangeContainerType()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        container.UpdateType(ContainerType.Reefer);

        Assert.Equal(ContainerType.Reefer, container.Type);
    }

    [Fact]
    public void UpdateWeight_WithNegativeValue_ShouldThrow()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        Assert.Throws<BusinessRuleValidationException>(() => container.UpdateWeightKg(-50));
    }

    [Fact]
    public void UpdateWeight_WithValidValue_ShouldUpdate()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        container.UpdateWeightKg(500);

        Assert.Equal(500, container.WeightKg);
    }

    [Fact]
    public void UpdateDescription_WithValidValue_ShouldUpdateCorrectly()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);
        var newDesc = "Updated description for container goods";

        container.UpdateDescription(newDesc);

        Assert.Equal(newDesc, container.Description);
    }

    [Fact]
    public void UpdateDescription_WithInvalidValue_ShouldThrow()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        Assert.Throws<BusinessRuleValidationException>(() => container.UpdateDescription("bad"));
    }

    [Fact]
    public void UpdateDescription_WithTooLongValue_ShouldThrow()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);
        var longDesc = new string('x', 200);

        Assert.Throws<BusinessRuleValidationException>(() => container.UpdateDescription(longDesc));
    }

    // ---------- EQUALITY ----------
    [Fact]
    public void Equals_ShouldReturnFalse_ForDifferentIdOrIso()
    {
        var container1 = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);
        var container2 = new EntityContainer("APZU7654321", ValidDescription, ContainerType.General, ValidWeight);

        Assert.False(container1.Equals(container2));
    }

    [Fact]
    public void Equals_ShouldReturnFalse_WhenComparingWithNull()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        Assert.False(container.Equals(null));
    }

    // ---------- TO STRING ----------
    [Fact]
    public void ToString_ShouldContainIsoDescriptionAndStatus()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.General, ValidWeight);

        var result = container.ToString();

        Assert.Contains(ValidIsoCode, result);
        Assert.Contains(ValidDescription, result);
        Assert.Contains(ContainerStatus.Empty.ToString(), result);
    }

    [Fact]
    public void ToString_ShouldIncludeWeightAndType()
    {
        var container = new EntityContainer(ValidIsoCode, ValidDescription, ContainerType.Reefer, 200);

        var result = container.ToString();

        Assert.Contains("200", result);
        Assert.Contains(ContainerType.Reefer.ToString(), result);
    }
}
