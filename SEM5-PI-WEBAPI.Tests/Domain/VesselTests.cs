using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.Vessels;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Tests.Domain;

public class VesselTests
{
    private VesselTypeId ValidVesselTypeId => new VesselTypeId(Guid.NewGuid());

    [Fact]
    public void CreateVessel_WithValidData_ShouldInitializeCorrectly()
    {
        var vesselTypeId = new VesselTypeId(Guid.NewGuid());

        var vessel = new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", vesselTypeId);

        Assert.Equal("Ever Given", vessel.Name);
        Assert.Equal("Evergreen Marine", vessel.Owner);
        Assert.Equal("9706906", vessel.ImoNumber.Value);
        Assert.Equal(vesselTypeId, vessel.VesselTypeId);
        Assert.NotEmpty(vessel.Id.Value);
    }


    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateVessel_WithInvalidName_ShouldThrow(string? invalidName)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new Vessel("IMO 9706906", invalidName!, "Evergreen Marine", ValidVesselTypeId));
    }

    [Fact]
    public void CreateVessel_WithTooShortName_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new Vessel("IMO 9706906", "Ship", "Evergreen Marine", ValidVesselTypeId));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateVessel_WithInvalidOwner_ShouldThrow(string? invalidOwner)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new Vessel("IMO 9706906", "Ever Given", invalidOwner!, ValidVesselTypeId));
    }

    [Fact]
    public void CreateVessel_WithTooShortOwner_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new Vessel("IMO 9706906", "Ever Given", "Abcd", ValidVesselTypeId));
    }

    [Fact]
    public void CreateVessel_WithEmptyVesselTypeId_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", new VesselTypeId(Guid.Empty)));
    }

    [Fact]
    public void UpdateName_WithValidName_ShouldChangeName()
    {
        var vessel = new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", ValidVesselTypeId);

        vessel.UpdateName("Ever Glory");

        Assert.Equal("Ever Glory", vessel.Name);
    }

    [Fact]
    public void UpdateName_WithInvalidName_ShouldThrow()
    {
        var vessel = new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", ValidVesselTypeId);

        Assert.Throws<BusinessRuleValidationException>(() => vessel.UpdateName("Abc"));
    }

    [Fact]
    public void UpdateOwner_WithValidOwner_ShouldChangeOwner()
    {
        var vessel = new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", ValidVesselTypeId);

        vessel.UpdateOwner("Maersk Line");

        Assert.Equal("Maersk Line", vessel.Owner);
    }

    [Fact]
    public void UpdateOwner_WithInvalidOwner_ShouldThrow()
    {
        var vessel = new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", ValidVesselTypeId);

        Assert.Throws<BusinessRuleValidationException>(() => vessel.UpdateOwner("Abc"));
    }

    [Fact]
    public void Equals_ShouldReturnTrue_ForSameIdAndImo()
    {
        var id = new VesselId(Guid.NewGuid());
        var vessel1 = new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", ValidVesselTypeId);
        var vessel2 = new Vessel("IMO 9706906", "Another Ship", "Other Owner", ValidVesselTypeId);

        typeof(Entity<VesselId>)
            .GetProperty("Id")!
            .SetValue(vessel2, vessel1.Id);

        Assert.True(vessel1.Equals(vessel2));
    }

    [Fact]
    public void GetHashCode_ShouldBeBasedOnId()
    {
        var vessel = new Vessel("IMO 9706906", "Ever Given", "Evergreen Marine", ValidVesselTypeId);

        var hash = vessel.GetHashCode();

        Assert.Equal(vessel.ImoNumber.GetHashCode(), hash);
    }
    
}
