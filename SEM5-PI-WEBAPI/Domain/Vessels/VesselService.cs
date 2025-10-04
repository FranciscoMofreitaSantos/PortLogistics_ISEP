using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Vessels;

public class VesselService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVesselRepository _vesselRepository;
    private readonly IVesselTypeRepository _vesselTypeRepository;
    private readonly ILogger<VesselTypeService> _logger;

    public VesselService(IUnitOfWork unitOfWork, IVesselRepository vesselRepository,IVesselTypeRepository vesselTypeRepository, ILogger<VesselTypeService> logger)
    {
        _unitOfWork = unitOfWork;
        _vesselRepository = vesselRepository;
        _vesselTypeRepository = vesselTypeRepository;
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


    public async Task<VesselDto> CreateAsync(CreatingVesselDto creatingVesselDto)
    {
        
        _logger.LogInformation("Business Domain: Request to add new Vessel with IMO Number = {IMO}", creatingVesselDto.ImoNumber);

        var imoexist = (await GetAllAsync()).Any(q=> string.Equals(q.ImoNumber.ToString(), creatingVesselDto.ImoNumber.ToString(),StringComparison.CurrentCultureIgnoreCase));
        
        if (imoexist) throw new BusinessRuleValidationException($"Vessel with IMO Number '{creatingVesselDto.ImoNumber}' already exists on DB.");
    
        var typeExist = (await _vesselTypeRepository.GetByIdAsync(creatingVesselDto.VesselTypeId)) == null;

        if (typeExist)
            throw new BusinessRuleValidationException(
                $"Vessel Type with ID '{creatingVesselDto.VesselTypeId.Value}' doesn't exists on DB.");
        
        Vessel createdVessel = VesselFactory.CreateVessel(creatingVesselDto);
            
        await _vesselRepository.AddAsync(createdVessel);
        await _unitOfWork.CommitAsync();

        _logger.LogInformation("Business Domain: Vessel Created Successfully with IMO Number [{IMO}] and System ID [{ID}].", createdVessel.ImoNumber,createdVessel.Id);

        return VesselFactory.CreateVesselDto(createdVessel);
    }

    public async Task<VesselDto> GetByIdAsync(VesselId vesselId)
    {
        _logger.LogInformation("Business Domain: Request to fetch Vessel with ID = {Id}", vesselId.Value);

        Vessel vesselInDb = await _vesselRepository.GetByIdAsync(vesselId);

        if (vesselInDb == null)
            throw new BusinessRuleValidationException($"No Vessel Found with ID : {vesselId.Value}");
       
        _logger.LogInformation("Business Domain: Vessel with ID = {Id} found successfully.", vesselId.Value);
    
        return VesselFactory.CreateVesselDto(vesselInDb);
    }
}