using SEM5_PI_WEBAPI.Domain.Containers;
using SEM5_PI_WEBAPI.Domain.CargoManifestEntries;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas;

namespace SEM5_PI_WEBAPI.Tests.Domain;

public class CargoManifestEntryTests
{
    private readonly EntityContainer _validContainer = new("MSCU6639870", "Test container", ContainerType.General, 1000);
    private readonly StorageAreaId _validStorageAreaId = new(Guid.NewGuid());

    [Fact]
    public void CreateCargoManifestEntry_ValidData_ShouldInitializeProperties()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);

        Assert.NotNull(entry.Id);
        Assert.Equal(_validContainer, entry.Container);
        Assert.Equal(_validStorageAreaId, entry.StorageAreaId);
        Assert.Equal(1, entry.Bay);
        Assert.Equal(2, entry.Row);
        Assert.Equal(3, entry.Tier);
    }

    [Theory]
    [InlineData(-1, 0, 0)]
    [InlineData(0, -1, 0)]
    [InlineData(0, 0, -1)]
    public void CreateCargoManifestEntry_NegativeBayRowTier_ShouldThrow(int bay, int row, int tier)
    {
        Assert.Throws<BusinessRuleValidationException>(() =>
            new CargoManifestEntry(_validContainer, _validStorageAreaId, bay, row, tier));
    }

    [Fact]
    public void UpdateBay_ValidValue_ShouldUpdate()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        entry.UpdateBay(5);
        Assert.Equal(5, entry.Bay);
    }

    [Fact]
    public void UpdateBay_NegativeValue_ShouldThrow()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        Assert.Throws<BusinessRuleValidationException>(() => entry.UpdateBay(-10));
    }

    [Fact]
    public void UpdateRow_ValidValue_ShouldUpdate()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        entry.UpdateRow(4);
        Assert.Equal(4, entry.Row);
    }

    [Fact]
    public void UpdateRow_NegativeValue_ShouldThrow()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        Assert.Throws<BusinessRuleValidationException>(() => entry.UpdateRow(-7));
    }

    [Fact]
    public void UpdateTier_ValidValue_ShouldUpdate()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        entry.UpdateTier(6);
        Assert.Equal(6, entry.Tier);
    }

    [Fact]
    public void UpdateTier_NegativeValue_ShouldThrow()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        Assert.Throws<BusinessRuleValidationException>(() => entry.UpdateTier(-3));
    }

    [Fact]
    public void Equals_SameId_ShouldReturnTrue()
    {
        var id = Guid.NewGuid();
        var entry1 = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        var entry2 = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        typeof(Entity<CargoManifestEntryId>)
            .GetProperty("Id", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic)!
            .SetValue(entry1, new CargoManifestEntryId(id));
        typeof(Entity<CargoManifestEntryId>)
            .GetProperty("Id", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic)!
            .SetValue(entry2, new CargoManifestEntryId(id));

        Assert.True(entry1.Equals(entry2));
    }

    [Fact]
    public void Equals_DifferentId_ShouldReturnFalse()
    {
        var entry1 = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        var entry2 = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);

        Assert.False(entry1.Equals(entry2));
    }

    [Fact]
    public void Equals_Null_ShouldReturnFalse()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);

        Assert.False(entry.Equals(null));
    }

    [Fact]
    public void ToString_ShouldContainProperties()
    {
        var entry = new CargoManifestEntry(_validContainer, _validStorageAreaId, 1, 2, 3);
        var str = entry.ToString();

        Assert.Contains("Bay=1", str);
        Assert.Contains("Row=2", str);
        Assert.Contains("Tier=3", str);
        Assert.Contains(_validStorageAreaId.ToString(), str);
    }
}