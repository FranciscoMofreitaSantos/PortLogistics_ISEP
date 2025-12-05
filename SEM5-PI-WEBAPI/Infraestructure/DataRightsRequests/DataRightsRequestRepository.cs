using Microsoft.EntityFrameworkCore;
using SEM5_PI_WEBAPI.Domain.DataRigthsRequests;
using SEM5_PI_WEBAPI.Infraestructure.Shared;

namespace SEM5_PI_WEBAPI.Infraestructure.DataRightsRequests;

public class DataRightsRequestRepository : BaseRepository<DataRightRequest, DataRightRequestId>, IDataRightRequestRepository
{
    private readonly DbSet<DataRightRequest> _context;
    
    public DataRightsRequestRepository(DddSample1DbContext context) : base(context.DataRightRequest)
    {
        _context = context.DataRightRequest;
    }
    
    
}