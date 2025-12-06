using SEM5_PI_WEBAPI.Domain.Shared;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests;

public interface IDataRightRequestRepository : IRepository<DataRightRequest, DataRightRequestId>
{
    Task<DataRightRequest?> CheckIfUserHasANonFinishRequestByType(string userEmail,RequestType requestType);
    Task<List<DataRightRequest>> GetAllDataRightRequestsForUser(string userEmail);
    Task<DataRightRequest?> GetRequestByIdentifier(string requestIdentifier);
    Task<List<DataRightRequest>> GetAllDataRightRequestsWithStatusWaitingForAssignment();
    Task<List<DataRightRequest>> GetAllDataRightRequestsForResponsible(string responsibleEmail);
    
    Task<DataRightRequest?> GetRequestById(string requestId);
}