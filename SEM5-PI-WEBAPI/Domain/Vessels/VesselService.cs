using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Vessels;

public class VesselService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVesselRepository _vesselRepository;
    private readonly ILogger<VesselTypeService> _logger;

    public VesselService(IUnitOfWork unitOfWork, IVesselRepository vesselRepository, ILogger<VesselTypeService> logger)
    {
        _unitOfWork = unitOfWork;
        _vesselRepository = vesselRepository;
        _logger = logger;
    }
    
    public async Task<List<VesselDto>> GetAllAsync()
    {
        _logger.LogInformation("Business Domain: Request to fetch all Vessels.");
            
        var listVesselsInDb = await _vesselRepository.GetAllAsync();
            
        if (listVesselsInDb.Count > 0) 
            _logger.LogInformation("Business Domain: Found [{Count}] Vessel in database.", listVesselsInDb.Count);
        else
        {
            _logger.LogWarning("Business Domain: No Vessels were found in database.");
        }

        var listVesselsDto = listVesselsInDb
            .Select(instance => VesselFactory.CreateVesselDto(instance))
            .ToList();
            
        _logger.LogInformation("Business Domain: Returning [{Count}] Vessels DTOs.", listVesselsDto.Count);

        return listVesselsDto;
    }
}