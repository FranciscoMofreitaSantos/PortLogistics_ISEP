namespace SEM5_PI_WEBAPI.Tests.ValueObject;


using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.Tasks;
using Xunit;

public class TaskCodeTests
{
    [Theory]
    [InlineData(TaskType.ContainerHandling, 1, "CH-0001")]
    [InlineData(TaskType.YardTransport, 42, "YT-0042")]
    [InlineData(TaskType.StoragePlacement, 1234, "SP-1234")]
    public void CreateTaskCode_ValidInput_ShouldGenerateCorrectCode(TaskType type, int number, string expectedCode)
    {
        var taskCode = new TaskCode(type, number);

        Assert.Equal(expectedCode, taskCode.Value);
        Assert.Equal(type, taskCode.Type);
        Assert.Equal(expectedCode, taskCode.ToString());
    }

    [Fact]
    public void CreateTaskCode_NegativeNumber_ShouldThrow()
    {
        Assert.Throws<BusinessRuleValidationException>(() => new TaskCode(TaskType.ContainerHandling, 0));
        Assert.Throws<BusinessRuleValidationException>(() => new TaskCode(TaskType.ContainerHandling, -5));
    }

    [Fact]
    public void CreateTaskCode_InvalidType_ShouldThrow()
    {
        var invalidType = (TaskType)999;

        Assert.Throws<BusinessRuleValidationException>(() => new TaskCode(invalidType, 1));
    }

    [Fact]
    public void Equals_SameValueAndType_ShouldReturnTrue()
    {
        var code1 = new TaskCode(TaskType.YardTransport, 5);
        var code2 = new TaskCode(TaskType.YardTransport, 5);

        Assert.True(code1.Equals(code2));
        Assert.Equal(code1.GetHashCode(), code2.GetHashCode());
    }

    [Fact]
    public void Equals_DifferentValueOrType_ShouldReturnFalse()
    {
        var code1 = new TaskCode(TaskType.YardTransport, 5);
        var code2 = new TaskCode(TaskType.ContainerHandling, 5);
        var code3 = new TaskCode(TaskType.YardTransport, 6);

        Assert.False(code1.Equals(code2));
        Assert.False(code1.Equals(code3));
    }
}
