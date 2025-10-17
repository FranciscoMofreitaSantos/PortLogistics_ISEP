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

    public PhysicalResourceService(IUnitOfWork unitOfWork, IPhysicalResourceRepository repo,
        IQualificationRepository repoQualification)
    {
        _unitOfWork = unitOfWork;
        _repo = repo;
        _qualificationRepository = repoQualification;
    }

    public async Task<List<PhysicalResourceDTO>> GetAllAsync()
    {
        var list = await _repo.GetAllAsync();
        return list.ConvertAll(MapToDto);
    }

    public async Task<PhysicalResourceDTO> GetByIdAsync(PhysicalResourceId id)
    {
        var physicalResource = await _repo.GetByIdAsync(id);

        if (physicalResource == null)
            throw new BusinessRuleValidationException($"No physical resource found with the specified ID: {id.Value}.");

        return MapToDto(physicalResource);
    }

    public async Task<PhysicalResourceDTO> GetByCodeAsync(PhysicalResourceCode code)
    {
        var physicalResource = await _repo.GetByCodeAsync(code);
        
        if (physicalResource == null)
            throw new BusinessRuleValidationException($"No physical resource found with the specified code: {code.Value}.");
        
        return MapToDto(physicalResource);
    }

    public async Task<List<PhysicalResourceDTO>> GetByDescriptionAsync(string description)
    {
        var physicalResource = await _repo.GetByDescriptionAsync(description);
        
        if (physicalResource == null)
            throw new BusinessRuleValidationException($"No physical resource found with the specified description: {description}.");
        
        return physicalResource.ConvertAll(MapToDto);
    }

    public async Task<List<PhysicalResourceDTO>> GetByQualificationAsync(QualificationId qualification)
    {
        var exist = await _qualificationRepository.ExistQualificationID(qualification);

        if (!exist)
            throw new BusinessRuleValidationException($"No qualification found: {qualification.Value}.");
        
        var physicalResource = await _repo.GetByQualificationAsync(qualification);

        if (physicalResource == null)
        {
            var qualyName = await _qualificationRepository.GetByIdAsync(qualification);
            throw new BusinessRuleValidationException($"No physical resource found with the specified qualification: {qualyName.Name}.");
        }
            
        return physicalResource.ConvertAll(MapToDto);
    }

    public async Task<List<PhysicalResourceDTO>> GetByTypeAsync(PhysicalResourceType type)
    {
        var physicalResource = await _repo.GetByTypeAsync(type);
        
        if (physicalResource == null)
            throw new BusinessRuleValidationException($"No physical resource found with the specified type: {type.ToString()}.");
        
        return physicalResource.ConvertAll(MapToDto);
    }

    public async Task<List<PhysicalResourceDTO>> GetByStatusAsync(PhysicalResourceStatus status)
    {
        var physicalResource = await _repo.GetByStatusAsync(status);

        if (physicalResource == null)
            throw new BusinessRuleValidationException(
                $"No physical resource found with the specified status: {status.ToString()}.");
        
        return physicalResource.ConvertAll(MapToDto);
    }

    public async Task<PhysicalResourceDTO> AddAsync(CreatingPhysicalResourceDto dto)
    {
        QualificationId? qualificationId = null;
        if (dto.QualificationCode is not null)
        {
            qualificationId = await CheckQualificationIdAsync(dto.QualificationCode);
        }
        
        var code = await GenerateCodeAsync(dto.PhysicalResourceType);

        var physicalResource = new EntityPhysicalResource(
            code,
            dto.Description,
            dto.OperationalCapacity,
            dto.SetupTime,
            dto.PhysicalResourceType,
            qualificationId
        );

        await _repo.AddAsync(physicalResource);
        await _unitOfWork.CommitAsync();

        return MapToDto(physicalResource);
    }

    public async Task<PhysicalResourceDTO> UpdateAsync(PhysicalResourceId id, UpdatingPhysicalResource dto)
    {
        var physicalResource = await _repo.GetByIdAsync(id);
        
        if (physicalResource == null)
            return null;
        
        if (dto.Description != null)
            physicalResource.UpdateDescription(dto.Description);
        
        if (dto.OperationalCapacity != null)
            physicalResource.UpdateOperationalCapacity(dto.OperationalCapacity.Value);
        
        if (dto.SetupTime != null)
            physicalResource.UpdateSetupTime(dto.SetupTime.Value);

        if (dto.QualificationId is not null)
        {
            var quaID = new QualificationId(dto.QualificationId.Value);
            var exist = await _qualificationRepository.ExistQualificationID(quaID);

            if (!exist)
                throw new BusinessRuleValidationException("Qualification ID not found.");

            physicalResource.UpdateQualification(quaID);
        }

        
        await _unitOfWork.CommitAsync();
        return MapToDto(physicalResource);
    }

    public async Task<PhysicalResourceDTO> DeactivationAsync(PhysicalResourceId id)
    {
        var physicalResource = await _repo.GetByIdAsync(id);
        if (physicalResource == null)
            return null;

        if (physicalResource.Status == PhysicalResourceStatus.Unavailable)
            throw new BusinessRuleValidationException("The physical resource is already deactivated.");
        
        physicalResource.UpdateStatus(PhysicalResourceStatus.Unavailable);
        
        await _unitOfWork.CommitAsync();
        return MapToDto(physicalResource);
    }
    
    public async Task<PhysicalResourceDTO> ReactivationAsync(PhysicalResourceId id)
    {
        var physicalResource = await _repo.GetByIdAsync(id);
        if (physicalResource == null)
            return null;

        if (physicalResource.Status == PhysicalResourceStatus.Available)
            throw new BusinessRuleValidationException("The physical resource is already activated.");
        
        physicalResource.UpdateStatus(PhysicalResourceStatus.Available);
        
        await _unitOfWork.CommitAsync();
        return MapToDto(physicalResource);
    }
    

    private async Task<QualificationId> CheckQualificationIdAsync(string qfCode)
    {
        var exist = await _qualificationRepository.GetQualificationByCodeAsync(qfCode);

        if (exist == null)
            throw new BusinessRuleValidationException($"Qualification Code {qfCode} does not exist on DB.");
        
        return exist.Id;
    }

    private static PhysicalResourceDTO MapToDto(EntityPhysicalResource entityPhysicalResource)
    {
        return new PhysicalResourceDTO(
            entityPhysicalResource.Id.AsGuid(),
            entityPhysicalResource.Code,
            entityPhysicalResource.Description,
            entityPhysicalResource.OperationalCapacity,
            entityPhysicalResource.SetupTime,
            entityPhysicalResource.Type,
            entityPhysicalResource.Status,
            entityPhysicalResource.QualificationID?.AsGuid());
    }

    private async Task<PhysicalResourceCode> GenerateCodeAsync(PhysicalResourceType type)
    {

        int count = await _repo.CountByTypeAsync(type);

        string prefix = type.ToString().Length > 5
            ? type.ToString().Substring(0, 5).ToUpper()
            : type.ToString().ToUpper();

        string generatedCode = $"{prefix}-{(count + 1).ToString("D4")}";
        
        return new PhysicalResourceCode(generatedCode);
    }
}