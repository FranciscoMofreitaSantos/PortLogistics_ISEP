using SEM5_PI_WEBAPI.Domain.Qualifications;
using SEM5_PI_WEBAPI.Infraestructure.Shared;

namespace SEM5_PI_WEBAPI.Infraestructure.Qualifications;

public class QualificationRepository : BaseRepository<Qualification, QualificationId>, IQualificationRepository
{
    public QualificationRepository(DddSample1DbContext context) : base(context.Qualifications)
    {
    }
}