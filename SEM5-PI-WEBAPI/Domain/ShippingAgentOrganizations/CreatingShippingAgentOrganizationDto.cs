namespace SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

public class CreatingShippingAgentOrganizationDto
{
    public ShippingOrganizationCode ShippingOrganizationCode { get; set; }
    public string LegalName { get; private set; }
    public string AltName { get; set; }
    public string Address { get; set; }
    public TaxNumber Taxnumber { get; set; }

    public CreatingShippingAgentOrganizationDto() { }

    public CreatingShippingAgentOrganizationDto(ShippingOrganizationCode shippingOrganizationCode,string legalName,string altName, string address, TaxNumber taxNumber)
    {
        ShippingOrganizationCode = shippingOrganizationCode;
        LegalName = legalName;
        Address = address;
        Taxnumber = taxNumber;
        AltName = altName;
    }
}
