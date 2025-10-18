using SEM5_PI_WEBAPI.Domain.PhysicalResources.DTOs;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.PhysicalResources;

public class PhysicalResourceService : IPhysicalResourceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPhysicalResourceRepository _repo;
    private readonly IQualificationRepository _qualificationRepository;
    private readonly ILogger<PhysicalResourceService> _logger;

    public PhysicalResourceService(
        IUnitOfWork unitOfWork,
        IPhysicalResourceRepository repo,
        IQualificationRepository qualificationRepository,
        ILogger<PhysicalResourceService> logger)
    {
        _unitOfWork = unitOfWork;
        _repo = repo;
        _qualificationRepository = qualificationRepository;
        _logger = logger;
    }

    public async Task<List<PhysicalResourceDTO>> GetAllAsync()
    {
        _logger.LogInformation("Business Domain: Request to fetch all Physical Resources.");

        var list = await _repo.GetAllAsync();
        var dtos = list.ConvertAll(MapToDto);

        _logger.LogInformation("Business Domain: Returning [{Count}] Physical Resources.", dtos.Count);
        return dtos;
    }

    public async Task<PhysicalResourceDTO> GetByIdAsync(PhysicalResourceId id)
    {
        _logger.LogInformation("Business Domain: Request to fetch Physical Resource with ID = {Id}", id.Value);

        var physicalResource = await _repo.GetByIdAsync(id);

        if (physicalResource == null)
        {
            _logger.LogWarning("Business Domain: No Physical Resource found with ID = {Id}", id.Value);
            throw new BusinessRuleValidationException($"No physical resource found with ID: {id.Value}.");
        }

        _logger.LogInformation("Business Domain: Physical Resource with ID = {Id} found.", id.Value);
        return MapToDto(physicalResource);
    }

    public async Task<PhysicalResourceDTO> GetByCodeAsync(PhysicalResourceCode code)
    {
        _logger.LogInformation("Business Domain: Request to fetch Physical Resource with Code = {Code}", code.Value);

        var physicalResource = await _repo.GetByCodeAsync(code);
        if (physicalResource == null)
        {
            _logger.LogWarning("Business Domain: No Physical Resource found with Code = {Code}", code.Value);
            throw new BusinessRuleValidationException($"No physical resource found with code: {code.Value}.");
        }

        _logger.LogInformation("Business Domain: Physical Resource with Code = {Code} found.", code.Value);
        return MapToDto(physicalResource);
    }

    public async Task<List<PhysicalResourceDTO>> GetByDescriptionAsync(string description)
    {
        _logger.LogInformation("Business Domain: Request to fetch Physical Resources with Description = {Description}", description);

        var physicalResources = await _repo.GetByDescriptionAsync(description);
        if (physicalResources == null || !physicalResources.Any())
        {
            _logger.LogWarning("Business Domain: No Physical Resources found with Description = {Description}", description);
            throw new BusinessRuleValidationException($"No physical resource found with description: {description}.");
        }

        _logger.LogInformation("Business Domain: Returning [{Count}] Physical Resources with Description = {Description}.",
            physicalResources.Count, description);
        return physicalResources.ConvertAll(MapToDto);
    }

    public async Task<List<PhysicalResourceDTO>> GetByQualificationAsync(QualificationId qualification)
    {
        _logger.LogInformation("Business Domain: Request to fetch Physical Resources by Qualification ID = {Qualification}", qualification.Value);

        var exists = await _qualificationRepository.ExistQualificationID(qualification);
        if (!exists)
        {
            _logger.LogWarning("Business Domain: Qualification with ID = {Qualification} does not exist.", qualification.Value);
            throw new BusinessRuleValidationException($"Qualification {qualification.Value} not found.");
        }

        var physicalResources = await _repo.GetByQualificationAsync(qualification);
        if (physicalResources == null || !physicalResources.Any())
        {
            _logger.LogWarning("Business Domain: No Physical Resources found with Qualification ID = {Qualification}", qualification.Value);
            throw new BusinessRuleValidationException($"No physical resources found with qualification {qualification.Value}.");
        }

        _logger.LogInformation("Business Domain: Returning [{Count}] Physical Resources for Qualification ID = {Qualification}.",
            physicalResources.Count, qualification.Value);
        return physicalResources.ConvertAll(MapToDto);
    }

    public async Task<List<PhysicalResourceDTO>> GetByTypeAsync(PhysicalResourceType type)
    {
        _logger.LogInformation("Business Domain: Request to fetch Physical Resources with Type = {Type}", type);

        var resources = await _repo.GetByTypeAsync(type);
        if (resources == null || !resources.Any())
        {
            _logger.LogWarning("Business Domain: No Physical Resources found with Type = {Type}", type);
            throw new BusinessRuleValidationException($"No physical resources found with type: {type}.");
        }

        _logger.LogInformation("Business Domain: Returning [{Count}] Physical Resources of Type = {Type}.", resources.Count, type);
        return resources.ConvertAll(MapToDto);
    }

    public async Task<List<PhysicalResourceDTO>> GetByStatusAsync(PhysicalResourceStatus status)
    {
        _logger.LogInformation("Business Domain: Request to fetch Physical Resources with Status = {Status}", status);

        var resources = await _repo.GetByStatusAsync(status);
        if (resources == null || !resources.Any())
        {
            _logger.LogWarning("Business Domain: No Physical Resources found with Status = {Status}", status);
            throw new BusinessRuleValidationException($"No physical resources found with status: {status}.");
        }

        _logger.LogInformation("Business Domain: Returning [{Count}] Physical Resources with Status = {Status}.", resources.Count, status);
        return resources.ConvertAll(MapToDto);
    }

    public async Task<PhysicalResourceDTO> AddAsync(CreatingPhysicalResourceDto dto)
    {
        _logger.LogInformation("Business Domain: Request to add new Physical Resource with Description = {Description}", dto.Description);

        QualificationId? qualificationId = null;
        if (dto.QualificationCode is not null)
        {
            qualificationId = await CheckQualificationIdAsync(dto.QualificationCode);
            _logger.LogInformation("Business Domain: Qualification Code = {Code} validated successfully.", dto.QualificationCode);
        }

        var code = await GenerateCodeAsync(dto.PhysicalResourceType);

        var resource = new EntityPhysicalResource(
            code,
            dto.Description,
            dto.OperationalCapacity,
            dto.SetupTime,
            dto.PhysicalResourceType,
            qualificationId
        );

        await _repo.AddAsync(resource);
        await _unitOfWork.CommitAsync();

        _logger.LogInformation("Business Domain: Physical Resource created successfully with Code = {Code}", code.Value);

        return MapToDto(resource);
    }

    public async Task<PhysicalResourceDTO> UpdateAsync(PhysicalResourceId id, UpdatingPhysicalResource dto)
    {
        _logger.LogInformation("Business Domain: Request to update Physical Resource with ID = {Id}", id.Value);

        var resource = await _repo.GetByIdAsync(id);
        if (resource == null)
        {
            _logger.LogWarning("Business Domain: Physical Resource not found for ID = {Id}", id.Value);
            return null;
        }

        if (dto.Description != null)
            resource.UpdateDescription(dto.Description);

        if (dto.OperationalCapacity != null)
            resource.UpdateOperationalCapacity(dto.OperationalCapacity.Value);

        if (dto.SetupTime != null)
            resource.UpdateSetupTime(dto.SetupTime.Value);

        if (dto.QualificationId is not null)
        {
            var qid = new QualificationId(dto.QualificationId.Value);
            var exists = await _qualificationRepository.ExistQualificationID(qid);
            if (!exists)
            {
                _logger.LogWarning("Business Domain: Invalid Qualification ID = {Qid}", dto.QualificationId);
                throw new BusinessRuleValidationException("Qualification ID not found.");
            }

            resource.UpdateQualification(qid);
        }

        await _unitOfWork.CommitAsync();

        _logger.LogInformation("Business Domain: Physical Resource with ID = {Id} updated successfully.", id.Value);
        return MapToDto(resource);
    }

    public async Task<PhysicalResourceDTO> DeactivationAsync(PhysicalResourceId id)
    {
        _logger.LogInformation("Business Domain: Request to deactivate Physical Resource with ID = {Id}", id.Value);

        var resource = await _repo.GetByIdAsync(id);
        if (resource == null)
        {
            _logger.LogWarning("Business Domain: Physical Resource not found with ID = {Id}", id.Value);
            return null;
        }

        if (resource.Status == PhysicalResourceStatus.Unavailable)
        {
            _logger.LogWarning("Business Domain: Physical Resource with ID = {Id} is already deactivated.", id.Value);
            throw new BusinessRuleValidationException("The physical resource is already deactivated.");
        }

        resource.UpdateStatus(PhysicalResourceStatus.Unavailable);
        await _unitOfWork.CommitAsync();

        _logger.LogInformation("Business Domain: Physical Resource with ID = {Id} deactivated successfully.", id.Value);
        return MapToDto(resource);
    }

    public async Task<PhysicalResourceDTO> ReactivationAsync(PhysicalResourceId id)
    {
        _logger.LogInformation("Business Domain: Request to reactivate Physical Resource with ID = {Id}", id.Value);

        var resource = await _repo.GetByIdAsync(id);
        if (resource == null)
        {
            _logger.LogWarning("Business Domain: Physical Resource not found with ID = {Id}", id.Value);
            return null;
        }

        if (resource.Status == PhysicalResourceStatus.Available)
        {
            _logger.LogWarning("Business Domain: Physical Resource with ID = {Id} is already active.", id.Value);
            throw new BusinessRuleValidationException("The physical resource is already active.");
        }

        resource.UpdateStatus(PhysicalResourceStatus.Available);
        await _unitOfWork.CommitAsync();

        _logger.LogInformation("Business Domain: Physical Resource with ID = {Id} reactivated successfully.", id.Value);
        return MapToDto(resource);
    }

    // --- AUXILIARY METHODS ---
    private async Task<QualificationId> CheckQualificationIdAsync(string qfCode)
    {
        var exist = await _qualificationRepository.GetQualificationByCodeAsync(qfCode);
        if (exist == null)
        {
            _logger.LogWarning("Business Domain: Qualification Code {Code} not found in database.", qfCode);
            throw new BusinessRuleValidationException($"Qualification Code {qfCode} does not exist in DB.");
        }

        return exist.Id;
    }

    private static PhysicalResourceDTO MapToDto(EntityPhysicalResource entity)
    {
        return new PhysicalResourceDTO(
            entity.Id.AsGuid(),
            entity.Code,
            entity.Description,
            entity.OperationalCapacity,
            entity.SetupTime,
            entity.Type,
            entity.Status,
            entity.QualificationID?.AsGuid());
    }

    private async Task<PhysicalResourceCode> GenerateCodeAsync(PhysicalResourceType type)
    {
        var count = await _repo.CountByTypeAsync(type);
        var prefix = type.ToString().Length > 5 ? type.ToString().Substring(0, 5).ToUpper() : type.ToString().ToUpper();
        var code = $"{prefix}-{(count + 1):D4}";

        _logger.LogInformation("Business Domain: Generated Code for Type = {Type} → {Code}", type, code);
        return new PhysicalResourceCode(code);
    }
}
