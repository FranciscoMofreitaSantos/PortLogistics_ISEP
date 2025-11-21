using SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations.DTOs;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations;

public class ShippingAgentOrganizationFactory
{
    public static ShippingAgentOrganizationDto CreateDto(ShippingAgentOrganization shippingAgentOrganization)
    {
        return new ShippingAgentOrganizationDto(shippingAgentOrganization.Id.AsGuid(),shippingAgentOrganization.ShippingOrganizationCode,shippingAgentOrganization.LegalName,
            shippingAgentOrganization.AltName, shippingAgentOrganization.Address, shippingAgentOrganization.Taxnumber);
    }

    public static ShippingAgentOrganization CreateEntity(ShippingOrganizationCode code,CreatingShippingAgentOrganizationDto dto)
    {
        return new ShippingAgentOrganization(
            code,
            dto.LegalName,
            dto.AltName,
            dto.Address,
            new TaxNumber(dto.Taxnumber)
        );
    }

}