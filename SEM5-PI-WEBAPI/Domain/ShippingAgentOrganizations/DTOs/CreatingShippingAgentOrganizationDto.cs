namespace SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations.DTOs;

public class CreatingShippingAgentOrganizationDto
{
    public string ShippingOrganizationCode { get; set; }
    public string LegalName { get; set; }
    public string AltName { get; set; }
    public string Address { get; set; }
    public string Taxnumber { get; set; }
    
    public CreatingShippingAgentOrganizationDto(string shippingOrganizationCode,string legalName,string altName, string address, string taxNumber)
    {
        ShippingOrganizationCode = shippingOrganizationCode;
        LegalName = legalName;
        Address = address;
        Taxnumber = taxNumber;
        AltName = altName;
    }
}
