namespace SEM5_PI_WEBAPI.Domain.Qualifications.DTOs;

public class QualificationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Code { get; set; }

    public QualificationDto(Guid id, string name, string code)
    {
        Id = id;
        Name = name;
        Code = code;
    }
}