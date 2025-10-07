using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.StorageAreas.DTOs;
using SEM5_PI_WEBAPI.Domain.Vessels;

namespace SEM5_PI_WEBAPI.Domain.StorageAreas;

public class StorageAreaService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<VesselService> _logger;
    private readonly IStorageAreaRepository _storageAreaRepository;

    public StorageAreaService(IUnitOfWork unitOfWork, ILogger<VesselService> logger, IStorageAreaRepository storageAreaRepository)
    {
        this._unitOfWork = unitOfWork;
        this._logger = logger;
        this._storageAreaRepository = storageAreaRepository;
    }

    public async Task<List<StorageAreaDto>> GetAllAsync()
    {
        var listStorageAreasInDb = await _storageAreaRepository.GetAllAsync();

        if (listStorageAreasInDb.Count <= 0)
            throw new BusinessRuleValidationException("");
        
        var listStorageAreasDto = listStorageAreasInDb.Select(s => StorageAreaFactory.CreateStorageAreaDto(s)).ToList();

        return listStorageAreasDto;
    }
}