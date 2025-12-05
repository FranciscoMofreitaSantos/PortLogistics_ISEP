using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests;

public class DataRightRequestService : IDataRightRequestService
{
    private readonly IDataRightRequestRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DataRightRequestService(IDataRightRequestRepository repository, IUnitOfWork unitOfWork)
    {
       this._repository = repository;
       this._unitOfWork = unitOfWork;
    }
}