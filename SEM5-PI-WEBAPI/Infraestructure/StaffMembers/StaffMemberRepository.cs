using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.StaffMembers;
using SEM5_PI_WEBAPI.Infraestructure.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Infraestructure.StaffMembers;

public class StaffMemberRepository : BaseRepository<StaffMember, StaffMemberId>, IStaffMemberRepository
{
    private readonly DbSet<StaffMember> _staffMembers;
    private readonly DddSample1DbContext _context;

    public StaffMemberRepository(DddSample1DbContext context) : base(context.StaffMember)
    {
        _staffMembers = context.StaffMember;
        _context = context;
    }

    public async Task<List<StaffMember>> GetAllAsync()
    {
        return await _staffMembers.ToListAsync();
    }

    public async Task<StaffMember?> GetByIdAsync(StaffMemberId id)
    {
        return await _staffMembers
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<StaffMember?> GetByMecNumberAsync(MecanographicNumber mec)
    {
        return await _staffMembers
            .FirstOrDefaultAsync(s => s.MecanographicNumber.Equals(mec));
    }

    public async Task<List<StaffMember>> GetByNameAsync(string name)
    {
        return await _staffMembers
            .Where(s => s.ShortName.ToLower().Contains(name.ToLower()))
            .ToListAsync();
    }

    public async Task<List<StaffMember>> GetByStatusAsync(bool status)
    {
        return await _staffMembers
            .Where(s => s.IsActive == status)
            .ToListAsync();
    }

    public async Task<List<StaffMember>> GetByQualificationsAsync(List<QualificationId> ids)
    {
        var idGuids = ids.Select(id => id.AsGuid()).ToList();
        
        var allStaff = await _staffMembers.ToListAsync();
    
        return allStaff
            .Where(s => s.Qualifications.Any(q => idGuids.Contains(q.AsGuid())))
            .ToList();
    }

    public async Task<List<StaffMember>> GetByExactQualificationsAsync(List<QualificationId> ids)
    {
        var idGuids = ids.Select(id => id.AsGuid()).ToList();
        var count = idGuids.Count;
        
        var allStaff = await _staffMembers.ToListAsync();
    
        return allStaff
            .Where(s => 
                s.Qualifications.Count == count &&
                s.Qualifications.All(q => idGuids.Contains(q.AsGuid())))
            .ToList();
    }

    public async Task<bool> EmailIsInTheSystem(Email email)
    {
        return await _staffMembers
            .AnyAsync(s => s.Email.Address.Equals(email.Address));
    }

    public async Task<bool> PhoneIsInTheSystem(PhoneNumber phone)
    {
        return await _staffMembers
            .AnyAsync(s => s.Phone.Number.Equals(phone.Number));
    }
}