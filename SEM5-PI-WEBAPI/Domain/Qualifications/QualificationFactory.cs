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
    
}