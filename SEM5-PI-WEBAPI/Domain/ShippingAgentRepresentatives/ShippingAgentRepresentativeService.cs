using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives;

public class ShippingAgentRepresentativeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IShippingAgentRepresentativeRepository _repo;

    public ShippingAgentRepresentativeService(IUnitOfWork unitOfWork, IShippingAgentRepresentativeRepository repo)
    {
        _unitOfWork = unitOfWork;
        _repo = repo;
    }

    public async Task<List<ShippingAgentRepresentativeDto>> GetAllAsync()
    {
        var list = await this._repo.GetAllAsync();

        List<ShippingAgentRepresentativeDto> listDto = list.ConvertAll<ShippingAgentRepresentativeDto>(q =>
            new ShippingAgentRepresentativeDto(q.Id.AsGuid(), q.Name, q.CitizenId, q.Nationality,q.Email,q.PhoneNumber,q.Status,q.SAO,q.Notifs));

        return listDto;
    }

    public async Task<ShippingAgentRepresentativeDto> GetByIdAsync(ShippingAgentRepresentativeId id)
    {
        var q = await this._repo.GetByIdAsync(id);

        if (q == null)
            return null;

        return new ShippingAgentRepresentativeDto(q.Id.AsGuid(), q.Name, q.CitizenId, q.Nationality,q.Email,q.PhoneNumber,q.Status,q.SAO,q.Notifs);
    }
    
    public async Task<ShippingAgentRepresentativeDto> GetByNameAsync(string Name)
    {
        var q = await this._repo.GetByNameAsync(Name);

        if (q == null)
            return null;

        return new ShippingAgentRepresentativeDto(q.Id.AsGuid(), q.Name, q.CitizenId, q.Nationality,q.Email,q.PhoneNumber,q.Status,q.SAO,q.Notifs);   
    }

    public async Task<ShippingAgentRepresentativeDto> GetByEmailAsync(string Email)
    {
        var q = await this._repo.GetByEmailAsync(Email);

        if (q == null)
            return null;

        return new ShippingAgentRepresentativeDto(q.Id.AsGuid(), q.Name, q.CitizenId, q.Nationality,q.Email,q.PhoneNumber,q.Status,q.SAO,q.Notifs);   
    }

    public async Task<ShippingAgentRepresentativeDto> GetByStatusAsync(Status Status)
    {
        var q = await this._repo.GetByStatusAsync(Status);

        if (q == null)
            return null;

        return new ShippingAgentRepresentativeDto(q.Id.AsGuid(), q.Name, q.CitizenId, q.Nationality,q.Email,q.PhoneNumber,q.Status,q.SAO,q.Notifs);   
    }

    public async Task<ShippingAgentRepresentative> AddAsync(CreatingShippingAgentRepresentativeDto dto)
    {

        var shippingAgentRepresentative = new ShippingAgentRepresentative(dto.Name, dto.CitizenId, dto.Nationality, dto.Email, dto.PhoneNumber, dto.Status, dto.SAO,dto.Notifs);
        await _repo.AddAsync(shippingAgentRepresentative);
        await _unitOfWork.CommitAsync();
        return shippingAgentRepresentative;
    }

     public async Task<ShippingAgentRepresentativeDto> PatchByNameAsync(string name, UpdatingShippingAgentRepresentativeDto dto)
    {

        var representative = await _repo.GetByNameAsync(name);

        if (representative == null)
            throw new BusinessRuleValidationException($"No representative found with name {name}.");

        if (!string.IsNullOrWhiteSpace(dto.Email))
            representative.UpdateEmail(dto.Email);

        if (dto.Status != null)
            representative.UpdateStatus(dto.Status.ToString());
    
        if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
            representative.UpdatePhoneNumber(dto.PhoneNumber);

        await _unitOfWork.CommitAsync();

        return new ShippingAgentRepresentativeDto(representative.Name,representative.CitizenId,representative.Nationality,representative.Email,representative.PhoneNumber,representative.Status,representative.SAO,representative.Notifs);
    }
}