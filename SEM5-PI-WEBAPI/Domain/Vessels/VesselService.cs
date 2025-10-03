using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Vessels;

public class VesselService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVesselTypeRepository _vesselTypeRepository;
    private readonly ILogger<VesselTypeService> _logger;

    public VesselService(IUnitOfWork unitOfWork, IVesselTypeRepository vesselTypeRepository, ILogger<VesselTypeService> logger)
    {
        _unitOfWork = unitOfWork;
        _vesselTypeRepository = vesselTypeRepository;
        _logger = logger;
    }
}