using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.CrewManifests;
using SEM5_PI_WEBAPI.Domain.CrewMembers;
using SEM5_PI_WEBAPI.Infraestructure.Shared;

namespace SEM5_PI_WEBAPI.Infraestructure.CrewMembers;

public class CrewMemberRepository : BaseRepository<CrewMember, CrewMemberId>, ICrewMemberRepository
{
    private readonly DbSet<CrewMember> _crewMembers;

    public CrewMemberRepository(DddSample1DbContext context) : base(context.CrewMembers)
    {
        _crewMembers = context.CrewMembers;
    }
    
}