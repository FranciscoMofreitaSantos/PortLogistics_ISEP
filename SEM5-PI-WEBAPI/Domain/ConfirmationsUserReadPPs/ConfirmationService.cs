using SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs;

public class ConfirmationService : IConfirmationService
{
    private readonly IConfirmationRepository _confirmationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ConfirmationService(IConfirmationRepository confirmationRepository, IUnitOfWork unitOfWork)
    {
        _confirmationRepository = confirmationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ConfirmationDto> GetConfirmationByUserEmailAsync(string email)
    {
        var confirmationFromDb = await _confirmationRepository.FindByUserEmailAsync(email);

        if (confirmationFromDb == null)
            throw new BusinessRuleValidationException($"No user with email {email} found in the confirmations PPs table.");
        
        return ConfirmationMapper.MapConfirmationToDto(confirmationFromDb);
    }

    public async Task<ConfirmationDto> AcceptConfirmationAsync(string email)
    {
        var confirmationFromDb = await _confirmationRepository.FindByUserEmailAsync(email);
        if (confirmationFromDb == null) throw new BusinessRuleValidationException("No user with email " + email + " found in the confirmations PPs table.");

        confirmationFromDb.Accept(confirmationFromDb.VersionPrivacyPolicy);
        await _unitOfWork.CommitAsync();
        
        return ConfirmationMapper.MapConfirmationToDto(confirmationFromDb);
    }

    public async Task<ConfirmationDto> RejectConfirmationAsync(string email)
    {
        var confirmationFromDb =  await _confirmationRepository.FindByUserEmailAsync(email);
        if (confirmationFromDb == null) throw new BusinessRuleValidationException("No user with email " + email + " found in the confirmations PPs table.");

        confirmationFromDb.Decline(confirmationFromDb.VersionPrivacyPolicy);
        await _unitOfWork.CommitAsync();
        return ConfirmationMapper.MapConfirmationToDto(confirmationFromDb);
    }
}