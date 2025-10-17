using SEM5_PI_WEBAPI.Domain.Qualifications.DTOs;

namespace SEM5_PI_WEBAPI.Domain.Qualifications;

public class QualificationFactory
{
    public static Qualification CreateQualification(CreatingQualificationDto dto)
    {

        var qualification = new Qualification(dto.Name);

        if (!string.IsNullOrWhiteSpace(dto.Code))
        {
            qualification.UpdateCode(dto.Code);
        }

        return qualification;
    }

    public static QualificationDto CreateQualificationDto(Qualification qualification)
    {
        return new QualificationDto(
            qualification.Id.AsGuid(),
            qualification.Name,
            qualification.Code
        );
    }

    public static List<QualificationDto> CreateQualificationDtoList(List<Qualification> qualifications)
    {
        return qualifications
            .Select(CreateQualificationDto)
            .ToList();
    }
}