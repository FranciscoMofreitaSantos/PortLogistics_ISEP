namespace SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives.DTOs;

public class CreatingShippingAgentRepresentativeDto
{
    public string Name { get; set; }
    public string CitizenId { get; set; }
    public string Nationality { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Status { get; set; }
    public string Sao { get; set; }
    
    public CreatingShippingAgentRepresentativeDto() { }
    
    public CreatingShippingAgentRepresentativeDto(string name, string citizenId, string nationality, string email, string phoneNumber, string status, string sao)
    {
        Name = name;
        CitizenId = citizenId;
        Nationality = nationality;
        Email = email;
        PhoneNumber = phoneNumber;
        Status = status;
        Sao = sao;
    }


}
