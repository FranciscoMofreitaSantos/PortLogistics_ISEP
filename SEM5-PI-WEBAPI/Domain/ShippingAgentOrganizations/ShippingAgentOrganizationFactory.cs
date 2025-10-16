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

    public static ShippingAgentOrganization CreateEntity(CreatingShippingAgentOrganizationDto dto)
    {
        return new ShippingAgentOrganization(
            new ShippingOrganizationCode(dto.ShippingOrganizationCode),
            dto.LegalName,
            dto.AltName,
            dto.Address,
            new TaxNumber(dto.Taxnumber)
        );
    }

}