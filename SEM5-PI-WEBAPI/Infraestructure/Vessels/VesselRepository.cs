using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
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


    public async Task<Vessel?> GetByImoNumberAsync(ImoNumber imoNumber)
    {
        return await _context.Vessel
            .FirstOrDefaultAsync(v => v.ImoNumber.Value == imoNumber.Value);
    }

    public async Task<List<Vessel>> GetByNameAsync(string name)
    {
        return await _context.Vessel
            .Where(v => v.Name.Trim().ToLower() == name.Trim().ToLower()).ToListAsync<Vessel>();
    }

    public async Task<List<Vessel>> GetByOwnerAsync(string ownerName)
    {
        return await _context.Vessel
            .Where(v => v.Owner.Trim().ToLower() == ownerName.Trim().ToLower()).ToListAsync<Vessel>();
    }
    
}