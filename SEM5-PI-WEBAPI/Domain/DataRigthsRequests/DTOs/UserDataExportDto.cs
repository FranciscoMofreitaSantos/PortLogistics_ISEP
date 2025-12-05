namespace SEM5_PI_WEBAPI.Domain.DataRigthsRequests.DTOs;


    public class UserDataExportDto
    {
        // Secção 1 – Dados de conta
        public string UserId { get; set; }
        public string Auth0UserId { get; private set; }
        public string Name { get; private set; }
        public string Email { get; private set; }
        public bool IsActive { get; set; }
        public bool Eliminated { get; set; }
        public string? Role { get; set; }
        public byte[]? Picture { get; set; }
        
        // Secção 2 – Dados SAR (se aplicável)
        public bool IsShippingAgentRepresentative { get; set; }
        public ShippingAgentRepresentativeExportDto? ShippingAgentRepresentative { get; set; }

        // Secção 3 – Privacy Policy confirmations
        public List<PrivacyPolicyConfirmationExportDto> PrivacyPolicyConfirmations { get; set; }

    }

