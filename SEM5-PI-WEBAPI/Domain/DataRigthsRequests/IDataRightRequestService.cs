using SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests;

public interface IDataRightRequestService
{
    
    // ------ Users
    Task<DataRightsRequestDto> CreateDataRightRequest(DataRightsRequestDto dto);
    Task<List<DataRightsRequestDto>> GetAllDataRightsRequestsForUser(string userEmail);
    
    // ------ Admin
    Task<DataRightsRequestDto> AssignResponsibleToDataRightRequestAsync(string requestId, string responsibleEmail);
    Task<List<DataRightsRequestDto>> GetAllDataRightRequestsWithStatusWaitingForAssignment();
    Task<List<DataRightsRequestDto>> GetAllDataRightRequestsForResponsible(string responsibleEmail);
    Task<DataRightsRequestDto> ResponseDataRightRequestTypeAccessAsync(string requestId);
    Task<bool> DeleteDataRightRequestAsync(string requestId);
    Task<DataRightsRequestDto> ResponseDataRightRequestTypeRectificationAsync(RectificationApplyDto dto);
}