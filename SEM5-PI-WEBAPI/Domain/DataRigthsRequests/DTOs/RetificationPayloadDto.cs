namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;


public class RectificationPayloadDto
{
    // Campos que o utilizador PODE pedir para alterar
    public string? NewName { get; set; }
    public string? NewEmail { get; set; }
    public string? NewPicture { get; set; }
    public bool? IsActive { get; set; }

    // Se quiseres, campos SAR também:
    public string? NewPhoneNumber { get; set; }
    public string? NewNationality { get; set; }
    public string? NewCitizenId { get; set; }
    
    public string? Reason { get; set; }  // "Porquê" do pedido
}
