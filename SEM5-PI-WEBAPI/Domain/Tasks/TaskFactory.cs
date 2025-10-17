using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.Tasks;

public class TaskFactory
{
    public static EntityTask CreateTask(CreatingTaskDto dto, TaskCode taskCode)
    {
        if (!string.IsNullOrWhiteSpace(dto.StartTime))
        {
            if (!DateTime.TryParse(dto.StartTime, out var startTime))
                throw new BusinessRuleValidationException($"Invalid StartTime format: {dto.StartTime}");

            return new EntityTask(taskCode, startTime, dto.Description, dto.Type);
        }

        return new EntityTask(taskCode, dto.Description, dto.Type);
    }

    public static TaskDto CreateTaskDto(EntityTask task)
    {
        return new TaskDto(
            task.Id.AsGuid(),
            task.Code.Value,
            task.StartTime,
            task.EndTime,
            task.Description,
            task.Type,
            task.Status
        );
    }

    public static List<TaskDto> CreateTaskDtoList(IReadOnlyCollection<EntityTask> tasks)
    {
        return tasks
            .Select(CreateTaskDto)
            .ToList();
    }
}