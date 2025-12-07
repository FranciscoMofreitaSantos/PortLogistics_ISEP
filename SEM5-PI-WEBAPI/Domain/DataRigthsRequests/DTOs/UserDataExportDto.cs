namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;


    public class UserDataExportDto
    {
        // Secção 1 – Dados de conta
        public string UserId { get; set; }
        public string Auth0UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public bool Eliminated { get; set; }
        public string? Role { get; set; }
        public string? Picture { get; set; }
        
        // Secção 2 – Dados SAR (se aplicável)
        public bool IsShippingAgentRepresentative { get; set; }
        public ShippingAgentRepresentativeExportDto? ShippingAgentRepresentative { get; set; }

        // Secção 3 – Privacy Policy confirmations
        public PrivacyPolicyConfirmationExportDto PrivacyPolicyConfirmations { get; set; }

        public UserDataExportDto(){}
    }

