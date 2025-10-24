using SEM5_PI_WEBAPI.Domain.Qualifications.DTOs;

namespace SEM5_PI_WEBAPI.Domain.Qualifications;

public class QualificationMapper
{
    public static QualificationDto ToDto(Qualification qualification)
    {
        return new QualificationDto(
            qualification.Id.AsGuid(),
            qualification.Name,
            qualification.Code
        );
    }
    
    public static List<QualificationDto> ToDtoList(List<Qualification> qualifications)
    {
        return qualifications
            .Select(ToDto)
            .ToList();
    }
    
  
    public static Qualification ToDomain(CreatingQualificationDto dto)
    {
        return QualificationFactory.CreateQualification(dto);
    }
}