namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

public class RectificationApplyDto
{
    public string RequestId { get; set; } = null!;

    // Se o admin decidir rejeitar TUDO
    public bool RejectEntireRequest { get; set; }
    public string? GlobalReason { get; set; }

    // CAMPOS DE USER
    public string? FinalName { get; set; }
    public string? FinalNameReason { get; set; }

    public string? FinalEmail { get; set; }
    public string? FinalEmailReason { get; set; }

    public string? FinalPicture { get; set; }
    public string? FinalPictureReason { get; set; }

    public bool? FinalIsActive { get; set; }
    public string? FinalIsActiveReason { get; set; }

    // CAMPOS DE SAR (se aplicável)
    public string? FinalPhoneNumber { get; set; }
    public string? FinalPhoneNumberReason { get; set; }

    public string? FinalNationality { get; set; }
    public string? FinalNationalityReason { get; set; }

    public string? FinalCitizenId { get; set; }
    public string? FinalCitizenIdReason { get; set; }

    // Comentário geral opcional
    public string? AdminGeneralComment { get; set; }
}
