using SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations.DTOs;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations;

public interface IShippingAgentOrganizationService
{
    Task<List<ShippingAgentOrganizationDto>> GetAllAsync();
    Task<ShippingAgentOrganizationDto> GetByIdAsync(ShippingAgentOrganizationId id);
    Task<ShippingAgentOrganizationDto> GetByLegalNameAsync(string legalname);
    Task<ShippingAgentOrganizationDto> GetByCodeAsync(ShippingOrganizationCode shippingOrganizationCode);
    Task<ShippingAgentOrganizationDto> GetByTaxNumberAsync(TaxNumber taxnumber);
    Task<ShippingAgentOrganizationDto> CreateAsync(CreatingShippingAgentOrganizationDto creatingshippingAgentOrganizationDto);
}