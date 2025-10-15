using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Domain.StaffMembers;
using SEM5_PI_WEBAPI.Infraestructure.Shared;

namespace SEM5_PI_WEBAPI.Infraestructure.StaffMembers;

public class StaffMemberRepository : BaseRepository<StaffMember, StaffMemberId>, IStaffMemberRepository
{
    private readonly DbSet<StaffMember> _staffMembers;

    public StaffMemberRepository(DddSample1DbContext context) : base(context.StaffMember)
    {
        _staffMembers = context.StaffMember;
    }

    public async Task<List<StaffMember>> GetAllAsync()
    {
        return await _staffMembers
            .Include(s => s.Qualifications)
            .ToListAsync();
    }

    public async Task<StaffMember?> GetByIdAsync(StaffMemberId id)
    {
        return await _staffMembers
            .Include(s => s.Qualifications)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<StaffMember?> GetByMecNumberAsync(MecanographicNumber mec)
    {
        return await _staffMembers
            .Include(s => s.Qualifications)
            .FirstOrDefaultAsync(s => s.MecanographicNumber.Equals(mec));
    }

    public async Task<List<StaffMember>> GetByNameAsync(string name)
    {
        return await _staffMembers
            .Include(s => s.Qualifications)
            .Where(s => s.ShortName.ToLower().Contains(name.ToLower()))
            .ToListAsync();
    }


    public async Task<List<StaffMember>> GetByStatusAsync(bool status)
    {
        return await _staffMembers
            .Include(s => s.Qualifications)
            .Where(s => s.IsActive == status)
            .ToListAsync();
    }

    public async Task<List<StaffMember>> GetByQualificationsAsync(List<QualificationId> ids)
    {
        var idValues = ids.Select(id => id.Value).ToList();
        return await _staffMembers
            .Include(s => s.Qualifications)
            .Where(s => s.Qualifications.Any(q => idValues.Contains(q.Value)))
            .ToListAsync();

    }

    public async Task<List<StaffMember>> GetByExactQualificationsAsync(List<QualificationId> ids)
    {
        var idValues = ids.Select(id => id.Value).ToList();

        var staffMembers = await _staffMembers
            .Include(s => s.Qualifications)
            .Where(s => s.Qualifications.Count() == idValues.Count())
            .ToListAsync();
        
        //Console.WriteLine(staffMembers[0].Qualifications.Count());
        foreach (var id in ids)
            Console.WriteLine(id.Value);
        {
            
        }
        Console.WriteLine(ids.Count());

        var filtered = staffMembers.Where(s =>
            s.Qualifications.Select(q => q.Value).OrderBy(x => x)
                .SequenceEqual(idValues.OrderBy(x => x))).ToList();

        return filtered;
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