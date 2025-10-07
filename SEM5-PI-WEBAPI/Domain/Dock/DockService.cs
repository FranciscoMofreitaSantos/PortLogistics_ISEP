using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Dock
{
    public class DockService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDockRepository _dockRepository;
        private readonly IVesselTypeRepository _vesselTypeRepository;
        private readonly ILogger<DockService> _logger;

        public DockService(
            IUnitOfWork unitOfWork,
            IDockRepository dockRepository,
            IVesselTypeRepository vesselTypeRepository,
            ILogger<DockService> logger)
        {
            _unitOfWork = unitOfWork;
            _dockRepository = dockRepository;
            _vesselTypeRepository = vesselTypeRepository;
            _logger = logger;
        }

        public async Task<List<DockDto>> GetAllAsync()
        {
            _logger.LogInformation("Fetch all docks");
            var docks = await _dockRepository.GetAllAsync();
            if (docks.Count == 0) throw new BusinessRuleValidationException("No docks found.");
            return docks.Select(DockFactory.RegisterDockDto).ToList();
        }

        public async Task<DockDto> CreateAsync(RegisterDockDto dto)
        {
            _logger.LogInformation("Create dock {Code}", dto.Code);

            var code = new DockCode(dto.Code);
            var existing = await _dockRepository.GetByCodeAsync(code);
            if (existing is not null)
                throw new BusinessRuleValidationException($"Dock with code '{code.Value}' already exists.");

            foreach (var raw in dto.AllowedVesselTypeIds)
            {
                if (!Guid.TryParse(raw, out var g) || g == Guid.Empty)
                    throw new BusinessRuleValidationException("Invalid VesselTypeId.");

                try
                {
                    await _vesselTypeRepository.GetByIdAsync(new VesselTypeId(g));
                }
                catch
                {
                    throw new BusinessRuleValidationException($"VesselType '{g}' does not exist.");
                }
            }

            var dock = DockFactory.RegisterDock(dto);
            await _dockRepository.AddAsync(dock);
            await _unitOfWork.CommitAsync();

            return DockFactory.RegisterDockDto(dock);
        }

        public async Task<DockDto> GetByIdAsync(DockId id)
        {
            _logger.LogInformation("Get dock by Id {Id}", id.Value);
            var dock = await _dockRepository.GetByIdAsync(id)
                       ?? throw new BusinessRuleValidationException($"No dock found with Id {id.Value}");
            return DockFactory.RegisterDockDto(dock);
        }

        public async Task<DockDto> GetByCodeAsync(string codeString)
        {
            var code = new DockCode(codeString);
            _logger.LogInformation("Get dock by Code {Code}", code.Value);
            var dock = await _dockRepository.GetByCodeAsync(code)
                       ?? throw new BusinessRuleValidationException($"No dock found with Code {code.Value}");
            return DockFactory.RegisterDockDto(dock);
        }

        public async Task<List<DockDto>> GetByVesselTypeAsync(string vesselTypeId)
        {
            if (!Guid.TryParse(vesselTypeId, out var g) || g == Guid.Empty)
                throw new BusinessRuleValidationException("Invalid VesselTypeId.");

            var docks = await _dockRepository.GetByVesselTypeAsync(new VesselTypeId(g));
            if (docks.Count == 0) throw new BusinessRuleValidationException("No docks found for that vessel type.");
            return docks.Select(DockFactory.RegisterDockDto).ToList();
        }

        public async Task<List<DockDto>> GetFilterAsync(
            string? code,
            string? vesselTypeId,
            string? location,
            string? query)
        {
            DockCode? dockCode = null;
            if (!string.IsNullOrWhiteSpace(code))
                dockCode = new DockCode(code);

            VesselTypeId? vtId = null;
            if (!string.IsNullOrWhiteSpace(vesselTypeId))
            {
                if (!Guid.TryParse(vesselTypeId, out var g) || g == Guid.Empty)
                    throw new BusinessRuleValidationException("Invalid VesselTypeId.");
                vtId = new VesselTypeId(g);
            }

            var docks = await _dockRepository.GetFilterAsync(
                dockCode,
                vtId,
                location,
                query
            );

            if (docks.Count == 0) throw new BusinessRuleValidationException("No docks match the provided filters.");
            return docks.Select(DockFactory.RegisterDockDto).ToList();
        }

        public async Task<List<DockDto>> GetByLocationAsync(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
                throw new BusinessRuleValidationException("location is required.");

            _logger.LogInformation("Get docks by location: {Loc}", location);

            var docks = await _dockRepository.GetByLocationAsync(location);
            if (docks.Count == 0)
                throw new BusinessRuleValidationException("No docks found for the given location.");

            return docks.Select(DockFactory.RegisterDockDto).ToList();
        }

        public async Task<DockDto> PatchByCodeAsync(string codeString, UpdateDockDto dto)
        {
            var code = new DockCode(codeString);

            var dock = await _dockRepository.GetByCodeAsync(code)
                       ?? throw new BusinessRuleValidationException($"No dock found with Code {code.Value}");

            if (!string.IsNullOrWhiteSpace(dto.Code))
            {
                var newCode = new DockCode(dto.Code);
                var duplicate = await _dockRepository.GetByCodeAsync(newCode);
                if (duplicate is not null && duplicate.Id.AsGuid() != dock.Id.AsGuid())
                    throw new BusinessRuleValidationException($"Dock with code '{newCode.Value}' already exists.");
                dock.SetCode(newCode);
            }

            if (!string.IsNullOrWhiteSpace(dto.Location))
                dock.SetLocation(dto.Location);

            if (dto.LengthM.HasValue)   dock.SetLength(dto.LengthM.Value);
            if (dto.DepthM.HasValue)    dock.SetDepth(dto.DepthM.Value);
            if (dto.MaxDraftM.HasValue) dock.SetMaxDraft(dto.MaxDraftM.Value);

            if (dto.AllowedVesselTypeIds is not null)
            {
                var ids = new List<VesselTypeId>();
                foreach (var raw in dto.AllowedVesselTypeIds)
                {
                    if (!Guid.TryParse(raw, out var g) || g == Guid.Empty)
                        throw new BusinessRuleValidationException("Invalid VesselTypeId in update.");

                    try
                    {
                        await _vesselTypeRepository.GetByIdAsync(new VesselTypeId(g));
                    }
                    catch
                    {
                        throw new BusinessRuleValidationException($"Vessel Type '{g}' doesn't exist.");
                    }

                    ids.Add(new VesselTypeId(g));
                }

                dock.ReplaceAllowedVesselTypes(ids);
            }

            dock.EnsureHasAllowedVesselTypes();

            await _unitOfWork.CommitAsync();
            return DockFactory.RegisterDockDto(dock);
        }
    }
}
