namespace SEM5_PI_WEBAPI.Domain.Qualifications;

public class CreatingQualificationDto
{
    public string? Name { get; set; }
    public string? Code { get; set; }

    public CreatingQualificationDto() { }

    public CreatingQualificationDto(string? name, string? code)
    {
        Name = name;
        Code = code;
    }
}

