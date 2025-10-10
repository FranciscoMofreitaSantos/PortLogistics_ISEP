using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Infraestructure.Shared;
using SQLitePCL;

namespace SEM5_PI_WEBAPI.Infraestructure.Qualifications;

public class QualificationRepository : BaseRepository<Qualification, QualificationId>, IQualificationRepository
{
    private readonly DddSample1DbContext _context;
    public QualificationRepository(DddSample1DbContext context) : base(context.Qualifications)
    {
        _context = context;
    }

    public async Task<bool> ExistQualificationID(QualificationId qualificationId)
    {
        return await ExistsAsync(q => q.Id.Equals(qualificationId));
    }
}