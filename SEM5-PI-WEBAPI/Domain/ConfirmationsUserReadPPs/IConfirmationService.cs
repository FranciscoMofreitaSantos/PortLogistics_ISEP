using SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs.DTOs;

namespace SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs;

public interface IConfirmationService
{
    Task<ConfirmationDto> GetConfirmationByUserEmailAsync(string email);
    Task<ConfirmationDto> AcceptConfirmationAsync(string email);
    Task<ConfirmationDto> RejectConfirmationAsync(string email);
}