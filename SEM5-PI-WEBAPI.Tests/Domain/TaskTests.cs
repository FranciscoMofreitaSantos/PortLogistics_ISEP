using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.Tasks;
using TaskStatus = SEM5_PI_WEBAPI.Domain.Tasks.TaskStatus;

namespace SEM5_PI_WEBAPI.Tests.Domain;

public class TaskTests
{
    private readonly TaskCode _validCode = new (TaskType.ContainerHandling, 2);
    private readonly string _validDescription = "Valid task description.";
    private readonly TaskType _validType = TaskType.ContainerHandling;

    [Fact]
    public void CreateTask_WithValidData_ShouldInitialize()
    {
        var task = new EntityTask(_validCode, _validDescription, _validType);

        Assert.Equal(_validDescription, task.Description);
        Assert.Equal(TaskStatus.Pending, task.Status);
        Assert.Equal(_validType, task.Type);
        Assert.Equal(_validCode, task.Code);
        Assert.Null(task.StartTime);
        Assert.Null(task.EndTime);
    }

    [Fact]
    public void CreateTask_WithDescriptionTooLong_ShouldThrow()
    {
        var longDesc = new string('a', 256);
        Assert.Throws<BusinessRuleValidationException>(() =>
            new EntityTask(_validCode, longDesc, _validType));
    }

    [Fact]
    public void CreateTask_WithStartTime_ShouldInitializeInProgress()
    {
        var startTime = DateTime.UtcNow;
        var task = new EntityTask(_validCode, startTime, _validDescription, _validType);

        Assert.Equal(TaskStatus.InProgress, task.Status);
        Assert.Equal(startTime, task.StartTime);
        Assert.Equal(_validDescription, task.Description);
    }

    [Fact]
    public void SetEndTime_AfterStartTime_ShouldSetAndComplete()
    {
        var startTime = DateTime.UtcNow.AddHours(-1);
        var task = new EntityTask(_validCode, startTime, _validDescription, _validType);

        var endTime = DateTime.UtcNow;
        task.SetEndTime(endTime);

        Assert.Equal(endTime, task.EndTime);
        Assert.Equal(TaskStatus.Completed, task.Status);
    }

    [Fact]
    public void SetEndTime_BeforeStartTime_ShouldThrow()
    {
        var startTime = DateTime.UtcNow;
        var task = new EntityTask(_validCode, startTime, _validDescription, _validType);

        var invalidEndTime = startTime.AddMinutes(-1);
        Assert.Throws<BusinessRuleValidationException>(() => task.SetEndTime(invalidEndTime));
    }

    [Fact]
    public void Equals_SameCode_ShouldReturnTrue()
    {
        var task1 = new EntityTask(new TaskCode(TaskType.ContainerHandling, 1), _validDescription, _validType);
        var task2 = new EntityTask(new TaskCode(TaskType.ContainerHandling, 1), _validDescription, _validType);

        Assert.True(task1.Equals(task2));
        Assert.Equal(task1.GetHashCode(), task2.GetHashCode());
    }

    [Fact]
    public void Equals_DifferentCode_ShouldReturnFalse()
    {
        var task1 = new EntityTask(new TaskCode(TaskType.ContainerHandling, 1), _validDescription, _validType);
        var task2 = new EntityTask(new TaskCode(TaskType.ContainerHandling, 2), _validDescription, _validType);

        Assert.False(task1.Equals(task2));
    }

    [Fact]
    public void ToString_ShouldContainRelevantInformation()
    {
        var startTime = DateTime.UtcNow.AddHours(-2);
        var task = new EntityTask(_validCode, startTime, _validDescription, _validType);
        task.SetEndTime(DateTime.UtcNow);

        var str = task.ToString();
        Assert.Contains(_validCode.ToString(), str);
        Assert.Contains(TaskStatus.Completed.ToString(), str);
        Assert.Contains(startTime.ToString(), str);
        Assert.Contains(task.EndTime?.ToString() ?? "", str);
    }
}