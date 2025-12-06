namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

public class ShippingAgentRepresentativeExportDto
{
    public string SarId { get; set; }
    public string Name { get; set; }
    public string CitizenId { get; set; }     // ou mascarado se quiserem
    public string Nationality { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Status { get; set; }
    public string Sao { get; set; }

    public List<string> VvnCodes { get; set; }   // Notifs.Select(n => n.Code)
    
    
    public ShippingAgentRepresentativeExportDto(){}
}


