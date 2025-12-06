using System.Text.Json;
using SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs;
using SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives;
using SEM5_PI_WEBAPI.Domain.Users;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests;

public class DataRightRequestService : IDataRightRequestService
{
    private readonly IDataRightRequestRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IShippingAgentRepresentativeRepository _representativeRepository;
    private readonly IConfirmationRepository _confirmationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DataRightRequestService(IDataRightRequestRepository repository, IUnitOfWork unitOfWork, IUserRepository userRepository, IShippingAgentRepresentativeRepository representativeRepository, IConfirmationRepository confirmationRepository)
    {
       this._repository = repository;
       this._userRepository = userRepository;
       this._representativeRepository = representativeRepository;
       this._confirmationRepository = confirmationRepository;
       this._unitOfWork = unitOfWork;
    }

    public async Task<DataRightsRequestDto> CreateDataRightRequest(DataRightsRequestDto dto)
    {
        var hasOneInProcess = await _repository.CheckIfUserHasANonFinishRequestByType(dto.UserEmail,dto.Type);

        if (hasOneInProcess != null) throw new BusinessRuleValidationException($"Request not created. User {dto.UserEmail} already has one request of type {dto.Type} being processed ({hasOneInProcess.Status})-> {hasOneInProcess.RequestId}.");

        var createdRequest = DataRightsRequestFactory.ConvertDtoToEntity(dto);
        
        await _repository.AddAsync(createdRequest);
        await _unitOfWork.CommitAsync();
        
        return DataRightsRequestMapper.CreateDataRightsRequestDto(createdRequest);
    }

    public async Task<List<DataRightsRequestDto>> GetAllDataRightsRequestsForUser(string userEmail)
    {
        var existUserInDb = await _userRepository.GetByEmailAsync(userEmail);

        if (existUserInDb == null) throw new BusinessRuleValidationException(
            $"User with email {userEmail} does not found in DB. Contact an 'admin'.");

        var listRequestByUser = await _repository.GetAllDataRightRequestsForUser(userEmail);
        
        return listRequestByUser.Select(r => DataRightsRequestMapper.CreateDataRightsRequestDto(r)).ToList();
    }


    // ---Admin
    public async Task<DataRightsRequestDto> AssignResponsibleToDataRightRequestAsync(string requestId, string responsibleEmail)
    {
        var existUserInDb = await _userRepository.GetByEmailAsync(responsibleEmail);

        if (existUserInDb == null)
            throw new BusinessRuleValidationException(
                $"Cannot associate responsible to request {requestId} because the specified responsible dont exist. Contact an 'admin'.");
        
        var existRequestInDb = await _repository.GetRequestByIdentifier(requestId);
        
        if (existRequestInDb == null) throw new BusinessRuleValidationException(
            $"Cannot associate responsible {existUserInDb.Name} to request {requestId} because the specified 'request id' does not exist. Contact an 'admin'.");

        existRequestInDb.AssignResponsibleToRequest(responsibleEmail);
        await _unitOfWork.CommitAsync();
        
        return  DataRightsRequestMapper.CreateDataRightsRequestDto(existRequestInDb);
    }

    public async Task<List<DataRightsRequestDto>> GetAllDataRightRequestsWithStatusWaitingForAssignment()
    {
        var listRequestWithStatusWaitingForAssignment =
            await _repository.GetAllDataRightRequestsWithStatusWaitingForAssignment();
        
        return listRequestWithStatusWaitingForAssignment.Select(r => DataRightsRequestMapper.CreateDataRightsRequestDto(r)).ToList();
    }

    public async Task<List<DataRightsRequestDto>> GetAllDataRightRequestsForResponsible(string responsibleEmail)
    {
        var existUserInDb = await _userRepository.GetByEmailAsync(responsibleEmail);

        if (existUserInDb == null)
            throw new BusinessRuleValidationException(
                $"Cannot get list of associate request to {responsibleEmail} because the specified responsible dont exist. Contact an 'admin'.");

        var listFromDb = await _repository.GetAllDataRightRequestsForResponsible(responsibleEmail);
        
        return listFromDb.Select(r => DataRightsRequestMapper.CreateDataRightsRequestDto(r)).ToList();
    }

    public async Task<DataRightsRequestDto> ResponseDataRightRequestTypeAccessAsync(string requestId)
    {
        var requestFromDb = await _repository.GetRequestById(requestId);

        if (requestFromDb == null)
            throw new BusinessRuleValidationException($"No request was found in DB, with id {requestId}");

        var userFromDb = await _userRepository.GetByEmailAsync(requestFromDb.UserEmail);
        if (userFromDb == null)
            throw new BusinessRuleValidationException(
                $"User with email {requestFromDb.UserEmail} does not exist in DB. Contact an 'admin'.");

        ShippingAgentRepresentative? sar = null;

        if (userFromDb.Role == Roles.ShippingAgentRepresentative)
        {
            sar = await _representativeRepository.GetByEmailAsync(new EmailAddress(userFromDb.Email));
            if (sar == null)
                throw new BusinessRuleValidationException(
                    $"User {userFromDb.Email} has SAR role but no SAR entity was found. Contact an 'admin'.");
        }

        var confirmationFromDb = await _confirmationRepository.FindByUserEmailAsync(userFromDb.Email);

        // Aqui tens 2 hipóteses:
        // 1) Obrigas a existir confirmação → se null, erro:
        if (confirmationFromDb == null)
            throw new BusinessRuleValidationException(
                $"No Privacy Policy confirmation found for user {userFromDb.Email}.");

        var userDataExportDto = DataRightsRequestFactory.PrepareResponseDto(userFromDb, sar, confirmationFromDb);

        var jsonString = JsonSerializer.Serialize(userDataExportDto);
        requestFromDb.AttachSystemGeneratedPayload(jsonString);
        requestFromDb.MarkAsCompleted();
        await _unitOfWork.CommitAsync();

        return DataRightsRequestMapper.CreateDataRightsRequestDto(requestFromDb);
    }

}