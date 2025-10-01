namespace SEM5_PI_WEBAPI.Domain.Qualifications;

public class CreatingQualificationDto
{
    public string Name { get; set; }

    public CreatingQualificationDto(string name)
    {
        Name = name;
    }
}
