using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.ShippingAgentOrganizations;

public class ShippingAgentOrganizationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IShippingAgentOrganizationRepository _repo;

    public ShippingAgentOrganizationService(IUnitOfWork unitOfWork, IShippingAgentOrganizationRepository repo)
    {
        _unitOfWork = unitOfWork;
        _repo = repo;
    }

    public async Task<List<ShippingAgentOrganizationDto>> GetAllAsync()
    {
        var list = await this._repo.GetAllAsync();

        List<ShippingAgentOrganizationDto> listDto = list.ConvertAll<ShippingAgentOrganizationDto>(q =>
            new ShippingAgentOrganizationDto(q.Id.AsGuid(), q.ShippingOrganizationCode, q.LegalName,q.AltName,q.Address,q.Taxnumber));

        return listDto;
    }

    public async Task<ShippingAgentOrganizationDto> GetByIdAsync(ShippingAgentOrganizationId id)
    {
        var q = await this._repo.GetByIdAsync(id);

        if (q == null)
            return null;

        return new ShippingAgentOrganizationDto(q.Id.AsGuid(), q.ShippingOrganizationCode, q.LegalName,q.AltName,q.Address,q.Taxnumber);
    }
    
    public async Task<ShippingAgentOrganizationDto> GetByLegalNameAsync(string legalname)
    {
        var q = await this._repo.GetByLegalNameAsync(legalname);

        if (q == null)
            return null;

        return new ShippingAgentOrganizationDto(q.Id.AsGuid(), q.ShippingOrganizationCode, q.LegalName, q.AltName, q.Address, q.Taxnumber);
    }
    
    public async Task<ShippingAgentOrganizationDto> GetByCodeAsync(string shippingOrganizationCode)
    {
        ShippingOrganizationCode c = ShippingOrganizationCode.FromString(shippingOrganizationCode);
        var q = await this._repo.GetByCodeAsync(shippingOrganizationCode);

        if (q == null)
            return null;

        return new ShippingAgentOrganizationDto(q.Id.AsGuid(), q.ShippingOrganizationCode, q.LegalName, q.AltName, q.Address, q.Taxnumber);
    }

    public async Task<ShippingAgentOrganizationDto> GetByTaxNumberAsync(TaxNumber taxnumber)
    {
        var q = await this._repo.GetByTaxNumberAsync(taxnumber);

        if (q == null)
            return null;

        return new ShippingAgentOrganizationDto(q.Id.AsGuid(), q.ShippingOrganizationCode, q.LegalName, q.AltName, q.Address, q.Taxnumber);
    }

    public async Task<ShippingAgentOrganizationDto> AddAsync(CreatingShippingAgentOrganizationDto dto)
    {
        var saoInDb = await _repo.GetByTaxNumberAsync(new TaxNumber(dto.Taxnumber));
        if (saoInDb != null) throw new BusinessRuleValidationException($"Shipping agent organization with tax number {dto.Taxnumber} already exist.");

        var shippingAgentOrganization = ShippingAgentOrganizationFactory.CreateEntity(dto);
        await _repo.AddAsync(shippingAgentOrganization);
        await _unitOfWork.CommitAsync();
        return ShippingAgentOrganizationFactory.CreateDto(shippingAgentOrganization);
    }
}