using SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs;
using SEM5_PI_WEBAPI.Domain.PrivacyPolicies.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.PrivacyPolicies;

public class PrivacyPolicyService : IPrivacyPolicyService
{
    private readonly IPrivacyPolicyRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfirmationRepository _confirmationRepository;

    public PrivacyPolicyService(IPrivacyPolicyRepository repository, IUnitOfWork unitOfWork, IConfirmationRepository confirmationRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _confirmationRepository = confirmationRepository;
    }
    
    public async Task<List<PrivacyPolicyDto>> GetAllPrivacyPolicies()
    {
        await SyncCurrentFlagsAsync();

        var listPrivacyPoliciesFromDb = await _repository.GetAllAsync();
        return listPrivacyPoliciesFromDb
            .Select(policy => PrivacyPolicyMappers.ProduceDto(policy))
            .ToList();
    }

    public async Task<PrivacyPolicyDto> CreatePrivacyPolicy(CreatePrivacyPolicyDto createPrivacyPolicyDto)
    {
        if (createPrivacyPolicyDto == null)
            throw new BusinessRuleValidationException("Privacy Policy DTO is null");

        var pp = PrivacyPolicyFactory.Create(createPrivacyPolicyDto);

        var exist = await _repository.GetPrivacyPolicyByVersion(pp.Version);
        if (exist != null)
            throw new BusinessRuleValidationException("Privacy Policy with this version already exist.");

        await _repository.AddAsync(pp);
        await _unitOfWork.CommitAsync();
        await SyncCurrentFlagsAsync();

        return PrivacyPolicyMappers.ProduceDto(pp);
    }
    
    public async Task<PrivacyPolicyDto?> GetCurrentPrivacyPolicy()
    {
        await SyncCurrentFlagsAsync();

        var ppFromDb = await _repository.GetCurrentByStatusPrivacyPolicy();
        if (ppFromDb == null)
            return null;

        return PrivacyPolicyMappers.ProduceDto(ppFromDb);
    }

    
    public async Task SyncCurrentFlagsAsync()
    {

        var all = await _repository.GetAllTrackedAsync();

        var newCurrent = await _repository.GetCurrentByTimePrivacyPolicy();
        var oldCurrent = await _repository.GetCurrentByStatusPrivacyPolicy();
        
        // Se ainda não há política “por tempo”, limpa o flag e sai
        if (newCurrent == null)
        {
            foreach (var pp in all)
                pp.IsCurrent = false;

            await _unitOfWork.CommitAsync();
            return;
        }

        // Se não há “oldCurrent”, simplesmente marca a newCurrent como atual
        if (oldCurrent == null)
        {
            foreach (var pp in all)
                pp.IsCurrent = pp.Id.Value.Equals(newCurrent.Id.Value);

            // talvez aqui ainda não queiras mexer nas confirmações
            await _unitOfWork.CommitAsync();
            return;
        }

        
        if (newCurrent.Version.Equals(oldCurrent.Version)) return;

        
        foreach (var pp in all)
        {
            var shouldBeCurrent = newCurrent != null && pp.Id.Value.Equals(newCurrent.Id.Value);
            pp.IsCurrent = shouldBeCurrent;
        }
        
        
        var listConfirmationsUpdated = await _confirmationRepository.GetAllAsync();

        foreach (var confirmation in listConfirmationsUpdated)
        {
            confirmation.Reset(newCurrent.Version);
        }
        
        await _unitOfWork.CommitAsync();
    }

}