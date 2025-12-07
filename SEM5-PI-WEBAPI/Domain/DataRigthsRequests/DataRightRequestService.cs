using System.Text.Json;
using SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs;
using SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives;
using SEM5_PI_WEBAPI.Domain.Users;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.utils;
using SEM5_PI_WEBAPI.utils.EmailTemplates;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests;

public class DataRightRequestService : IDataRightRequestService
{
    private readonly IDataRightRequestRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IShippingAgentRepresentativeRepository _representativeRepository;
    private readonly IConfirmationRepository _confirmationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailSender _emailSender;

    public DataRightRequestService(
        IDataRightRequestRepository repository,
        IEmailSender emailSender,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        IShippingAgentRepresentativeRepository representativeRepository,
        IConfirmationRepository confirmationRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
        _representativeRepository = representativeRepository;
        _confirmationRepository = confirmationRepository;
        _unitOfWork = unitOfWork;
        _emailSender = emailSender;
    }

    public async Task<DataRightsRequestDto> CreateDataRightRequest(CreatingDataRigthsRequestDto dto)
    {
        var hasOneInProcess = await _repository.CheckIfUserHasANonFinishRequestByType(dto.UserEmail, dto.Type);

        if (hasOneInProcess != null)
            throw new BusinessRuleValidationException(
                $"Request not created. User {dto.UserEmail} already has one request of type {dto.Type} being processed ({hasOneInProcess.Status})-> {hasOneInProcess.RequestId}.");

        if (dto.Type == RequestType.Rectification)
        {
            if (string.IsNullOrWhiteSpace(dto.Payload))
                throw new BusinessRuleValidationException("Rectification request must have a payload.");

            try
            {
                _ = JsonSerializer.Deserialize<RectificationPayloadDto>(dto.Payload);
            }
            catch (Exception)
            {
                throw new BusinessRuleValidationException("Rectification payload is not in a valid format.");
            }
        }

        var userFromDb = await _userRepository.GetByEmailAsync(dto.UserEmail);
        if (userFromDb == null)
            throw new BusinessRuleValidationException("User not found.");

        var createdRequest = DataRightsRequestFactory.ConvertDtoToEntity(dto, userFromDb.Auth0UserId);

        await _repository.AddAsync(createdRequest);
        await _unitOfWork.CommitAsync();

        return DataRightsRequestMapper.CreateDataRightsRequestDto(createdRequest);
    }

    public async Task<List<DataRightsRequestDto>> GetAllDataRightsRequestsForUser(string userEmail)
    {
        var existUserInDb = await _userRepository.GetByEmailAsync(userEmail);

        if (existUserInDb == null)
            throw new BusinessRuleValidationException(
                $"User with email {userEmail} does not found in DB. Contact an 'admin'.");

        var listRequestByUser = await _repository.GetAllDataRightRequestsForUser(userEmail);

        return listRequestByUser.Select(DataRightsRequestMapper.CreateDataRightsRequestDto).ToList();
    }

    // ---Admin

    public async Task<DataRightsRequestDto> AssignResponsibleToDataRightRequestAsync(
        string requestId,
        string responsibleEmail)
    {
        var existUserInDb = await _userRepository.GetByEmailAsync(responsibleEmail);

        if (existUserInDb == null)
            throw new BusinessRuleValidationException(
                $"Cannot associate responsible to request {requestId} because the specified responsible dont exist. Contact an 'admin'.");

        var existRequestInDb = await _repository.GetRequestByIdentifier(requestId);

        if (existRequestInDb == null)
            throw new BusinessRuleValidationException(
                $"Cannot associate responsible {existUserInDb.Name} to request {requestId} because the specified 'request id' does not exist. Contact an 'admin'.");

        existRequestInDb.AssignResponsibleToRequest(responsibleEmail);
        await _unitOfWork.CommitAsync();

        return DataRightsRequestMapper.CreateDataRightsRequestDto(existRequestInDb);
    }

    public async Task<List<DataRightsRequestDto>> GetAllDataRightRequestsWithStatusWaitingForAssignment()
    {
        var listRequestWithStatusWaitingForAssignment =
            await _repository.GetAllDataRightRequestsWithStatusWaitingForAssignment();

        return listRequestWithStatusWaitingForAssignment
            .Select(DataRightsRequestMapper.CreateDataRightsRequestDto)
            .ToList();
    }

    public async Task<List<DataRightsRequestDto>> GetAllDataRightRequestsForResponsible(string responsibleEmail)
    {
        var existUserInDb = await _userRepository.GetByEmailAsync(responsibleEmail);

        if (existUserInDb == null)
            throw new BusinessRuleValidationException(
                $"Cannot get list of associate request to {responsibleEmail} because the specified responsible dont exist. Contact an 'admin'.");

        var listFromDb = await _repository.GetAllDataRightRequestsForResponsible(responsibleEmail);

        return listFromDb.Select(DataRightsRequestMapper.CreateDataRightsRequestDto).ToList();
    }

    public async Task<DataRightsRequestDto> ResponseDataRightRequestTypeAccessAsync(string requestId)
    {
        var requestFromDb = await _repository.GetRequestById(requestId);

        if (requestFromDb == null)
            throw new BusinessRuleValidationException($"No request was found in DB, with id {requestId}");

        if (requestFromDb.Type != RequestType.Access)
            throw new BusinessRuleValidationException($"Request {requestId} is not of type Access.");

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

    public async Task<bool> DeleteDataRightRequestAsync(string requestId)
    {
        var requestFromDb = await _repository.GetRequestByIdentifier(requestId);

        if (requestFromDb == null)
            throw new BusinessRuleValidationException(
                $"The request {requestId} cannot be deleted because it was not found in DB.");

        if (requestFromDb.Type != RequestType.Deletion)
            throw new BusinessRuleValidationException(
                $"The request {requestId} is not of type Deletion.");

        var userFromDb = await _userRepository.GetByEmailAsync(requestFromDb.UserEmail);
        if (userFromDb == null)
            throw new BusinessRuleValidationException(
                $"The request {requestId} cannot be deleted because no user with email {requestFromDb.UserEmail} was found in DB.");

        ShippingAgentRepresentative? sar = null;
        if (userFromDb.Role == Roles.ShippingAgentRepresentative)
        {
            sar = await _representativeRepository.GetByEmailAsync(new EmailAddress(requestFromDb.UserEmail));
        }

        var confirmation = await _confirmationRepository.FindByUserEmailAsync(requestFromDb.UserEmail);

        // 1) Tirar snapshot dos dados ANTES de apagar (mesmo que não haja confirmação)
        var exportDto = DataRightsRequestFactory.PrepareResponseDto(userFromDb, sar, confirmation);
        var html = UpcomingDeletionDetailedEmailTemplate.Build(exportDto, requestFromDb.RequestId);

        // 2) Enviar email a avisar o que vai ser apagado
        await _emailSender.SendEmailAsync(
            userFromDb.Email,
            "Aviso de eliminação de dados pessoais / Personal data deletion notice",
            html
        );

        // 3) Agora sim, eliminar/anonimizar os dados na BD
        if (confirmation != null)
        {
            _confirmationRepository.Remove(confirmation);
        }

        if (sar != null)
        {
            _representativeRepository.Remove(sar);
        }

        _userRepository.Remove(userFromDb);
        _repository.Remove(requestFromDb);

        await _unitOfWork.CommitAsync();

        return true;
    }

    public async Task<DataRightsRequestDto> ResponseDataRightRequestTypeRectificationAsync(
        RectificationApplyDto dto)
    {
        var requestFromDb = await _repository.GetRequestByIdentifier(dto.RequestId);

        if (requestFromDb == null)
            throw new BusinessRuleValidationException($"No request was found in DB, with id {dto.RequestId}");

        if (requestFromDb.Type != RequestType.Rectification)
            throw new BusinessRuleValidationException($"Request {dto.RequestId} is not of type Rectification.");

        if (requestFromDb.IsCompleted() || requestFromDb.IsRejected())
            throw new BusinessRuleValidationException($"Request {dto.RequestId} is already closed.");

        if (requestFromDb.ProcessedBy == null)
            throw new BusinessRuleValidationException(
                $"Request {dto.RequestId} must have a responsible assigned before applying changes.");

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

        var confirmation = await _confirmationRepository.FindByUserEmailAsync(requestFromDb.UserEmail);

        // Payload original pedido pelo user
        var requestedPayload = JsonSerializer.Deserialize<RectificationPayloadDto>(requestFromDb.Payload!)
                               ?? new RectificationPayloadDto();

        if (dto.RejectEntireRequest)
        {
            requestFromDb.MarkAsRejected();
            await _unitOfWork.CommitAsync();

            var htmlRejected = RectificationResultEmailTemplate.Build(
                userFromDb.Name,
                userFromDb.Email,
                requestFromDb.RequestId,
                requestedPayload,
                dto
            );

            await _emailSender.SendEmailAsync(
                userFromDb.Email,
                "Resultado do pedido de retificação de dados / Data rectification request result",
                htmlRejected
            );

            return DataRightsRequestMapper.CreateDataRightsRequestDto(requestFromDb);
        }

        // ===== APLICAR ALTERAÇÕES =====

        // USER
        if (!string.IsNullOrWhiteSpace(dto.FinalName))
        {
            userFromDb.Name = dto.FinalName;
            if (sar != null)
                sar.Name = dto.FinalName;
        }

        if (!string.IsNullOrWhiteSpace(dto.FinalEmail) && dto.FinalEmail != userFromDb.Email)
        {
            userFromDb.Email = dto.FinalEmail;
            if (sar != null)
                sar.Email = new EmailAddress(userFromDb.Email);
            requestFromDb.UserEmail = userFromDb.Email;
            if (confirmation != null)
                confirmation.UserEmail = userFromDb.Email;
        }

        if (!string.IsNullOrWhiteSpace(dto.FinalPicture))
        {
            userFromDb.Picture = Convert.FromBase64String(dto.FinalPicture);
        }

        if (dto.FinalIsActive.HasValue)
        {
            userFromDb.IsActive = dto.FinalIsActive.Value;
        }

        // SAR
        if (sar != null)
        {
            if (!string.IsNullOrWhiteSpace(dto.FinalPhoneNumber))
            {
                sar.PhoneNumber = new PhoneNumber(dto.FinalPhoneNumber);
            }

            if (!string.IsNullOrWhiteSpace(dto.FinalNationality))
            {
                if (!Enum.TryParse<Nationality>(dto.FinalNationality, out var parsedNationality))
                    throw new BusinessRuleValidationException(
                        $"Invalid nationality '{dto.FinalNationality}'.");

                sar.Nationality = parsedNationality;
            }

            if (!string.IsNullOrWhiteSpace(dto.FinalCitizenId))
            {
                sar.CitizenId = new CitizenId(dto.FinalCitizenId);
            }
        }

        // Marca o pedido como concluído
        requestFromDb.MarkAsCompleted();
        await _unitOfWork.CommitAsync();

        // ===== Enviar email com tabela pedido vs aplicado =====
        var html = RectificationResultEmailTemplate.Build(
            userFromDb.Name,
            userFromDb.Email,
            requestFromDb.RequestId,
            requestedPayload,
            dto
        );

        await _emailSender.SendEmailAsync(
            userFromDb.Email,
            "Resultado do pedido de retificação de dados / Data rectification request result",
            html
        );

        return DataRightsRequestMapper.CreateDataRightsRequestDto(requestFromDb);
    }
}
