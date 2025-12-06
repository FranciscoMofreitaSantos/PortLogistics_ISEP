using SEM5_PI_WEBAPI.Domain.ConfirmationsUserReadPPs;
using SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ShippingAgentRepresentatives;
using SEM5_PI_WEBAPI.Domain.Users;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests;

public class DataRightsRequestFactory
{
    public static DataRightRequest ConvertDtoToEntity(DataRightsRequestDto dto)
    {
        return new DataRightRequest(
            dto.UserId,
            dto.UserEmail,
            dto.Type,
            dto.Payload);
    }


    public static UserDataExportDto PrepareResponseDto(
        User user,
        ShippingAgentRepresentative? sar,
        ConfirmationPrivacyPolicy  privacyPolicies)
    {
        var userDataExport = new UserDataExportDto();
        var shippingAgentRepresentativeExportDto = new  ShippingAgentRepresentativeExportDto();
        var privacyPolicyConfirmationExportDto = new  PrivacyPolicyConfirmationExportDto();
        
        var userDto = UserMapper.ToDto(user);
        
        userDataExport.UserId =  userDto.Id.ToString();
        userDataExport.Auth0UserId = userDto.Auth0UserId.ToString();
        userDataExport.Name = userDto.Name;
        userDataExport.Email = userDto.Email;
        userDataExport.IsActive = userDto.IsActive;
        userDataExport.Eliminated = userDto.Eliminated;
        userDataExport.Role = userDto.Role.ToString();
        userDataExport.Picture = userDto.Picture;
        
        userDataExport.IsShippingAgentRepresentative = false;
        userDataExport.ShippingAgentRepresentative = null;
        
        
        if (userDto.Role == Roles.ShippingAgentRepresentative)
        {
            userDataExport.IsShippingAgentRepresentative = true;

            if (sar == null) throw new BusinessRuleValidationException("The role of user is SAR but no sar entity was pass to create dto.");
            
            
            var sarDto = ShippingAgentRepresentativeFactory.CreateDto(sar);

            shippingAgentRepresentativeExportDto.SarId = sarDto.Id.ToString();
            shippingAgentRepresentativeExportDto.Name = sarDto.Name;
            shippingAgentRepresentativeExportDto.CitizenId = sarDto.CitizenId.ToString();
            shippingAgentRepresentativeExportDto.Nationality = sarDto.Nationality.ToString();
            shippingAgentRepresentativeExportDto.Email = sarDto.Email.ToString();
            shippingAgentRepresentativeExportDto.PhoneNumber = sarDto.PhoneNumber.ToString();
            shippingAgentRepresentativeExportDto.Status = sarDto.Status.ToString();
            shippingAgentRepresentativeExportDto.Sao = sarDto.SAO;
            shippingAgentRepresentativeExportDto.VvnCodes = sarDto.Notifs.Select(n => n.ToString()).ToList();
         
            userDataExport.ShippingAgentRepresentative = shippingAgentRepresentativeExportDto;
        }
        
        var confirmationDto = ConfirmationMapper.MapConfirmationToDto(privacyPolicies);
        privacyPolicyConfirmationExportDto.VersionPrivacyPolicy = confirmationDto.VersionPrivacyPolicy;
        privacyPolicyConfirmationExportDto.IsAccepted = confirmationDto.IsAcceptedPrivacyPolicy;
        privacyPolicyConfirmationExportDto.AcceptedAtUtc = confirmationDto.AcceptedAtTime;
        privacyPolicyConfirmationExportDto.UserEmail = confirmationDto.UserEmail;
        
        userDataExport.PrivacyPolicyConfirmations = privacyPolicyConfirmationExportDto;
        return userDataExport;
    }
}