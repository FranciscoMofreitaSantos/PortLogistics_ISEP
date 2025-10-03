using SEM5_PI_WEBAPI.Domain.Vessels;
using SEM5_PI_WEBAPI.Infraestructure.Shared;

namespace SEM5_PI_WEBAPI.Infraestructure.Vessels;

public class VesselRepository : BaseRepository<Vessel,VesselId> , IVesselRepository
{
    private readonly DddSample1DbContext _context;
    
    public VesselRepository(DddSample1DbContext context) : base(context.Vessel)
    {
        _context = context;
    }
    
}