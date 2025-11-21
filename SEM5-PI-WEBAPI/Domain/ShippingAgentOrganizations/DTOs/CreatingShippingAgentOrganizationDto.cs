namespace SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations.DTOs;

public class CreatingShippingAgentOrganizationDto
{
    public string LegalName { get; set; }
    public string AltName { get; set; }
    public string Address { get; set; }
    public string Taxnumber { get; set; }
    
    public CreatingShippingAgentOrganizationDto(string legalName,string altName, string address, string taxNumber)
    {
        LegalName = legalName;
        Address = address;
        Taxnumber = taxNumber;
        AltName = altName;
    }
}
