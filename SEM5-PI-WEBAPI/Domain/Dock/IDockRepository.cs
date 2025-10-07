using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Dock
{
    public interface IDockRepository : IRepository<Dock, DockId>
    {
        Task<Dock?> GetByCodeAsync(DockCode code);
        Task<List<Dock>> GetByVesselTypeAsync(VesselTypeId vesselTypeId);
        Task<List<Dock>> GetByLocationAsync(string location);
        Task<List<Dock>> GetFilterAsync(DockCode? code, VesselTypeId? vesselTypeId, string? location, string? query);
    }
}