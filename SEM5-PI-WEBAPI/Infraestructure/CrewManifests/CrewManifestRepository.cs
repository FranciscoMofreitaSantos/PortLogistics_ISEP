using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.CrewManifests;
using SEM5_PI_WEBAPI.Infraestructure.Shared;

namespace SEM5_PI_WEBAPI.Infraestructure.CrewManifests;

public class CrewManifestRepository : BaseRepository<CrewManifest, CrewManifestId>, ICrewManifestRepository
{
    private readonly DbSet<CrewManifest> _crewManifests;

    public CrewManifestRepository(DddSample1DbContext context) : base(context.CrewManifests)
    {
        _crewManifests = context.CrewManifests;
    }
}