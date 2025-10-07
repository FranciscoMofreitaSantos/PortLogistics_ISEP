namespace SEM5_PI_WEBAPI.Domain.Dock
{
    public class UpdateDockDto
    {
        public string? Code { get; set; }
        public string? Location { get; set; }
        public double? LengthM { get; set; }
        public double? DepthM { get; set; }
        public double? MaxDraftM { get; set; }
        public List<string>? AllowedVesselTypeIds { get; set; }

        public UpdateDockDto() { }

        public UpdateDockDto(
            string? code,
            string? location,
            double? lengthM,
            double? depthM,
            double? maxDraftM,
            List<string>? allowedVesselTypeIds)
        {
            Code = code;
            Location = location;
            LengthM = lengthM;
            DepthM = depthM;
            MaxDraftM = maxDraftM;
            AllowedVesselTypeIds = allowedVesselTypeIds;
        }
    }
}