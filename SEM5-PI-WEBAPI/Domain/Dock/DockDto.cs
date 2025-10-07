using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VesselsTypes;

namespace SEM5_PI_WEBAPI.Domain.Dock
{
    public class DockDto
    {
        public Guid Id { get; set; }
        public DockCode Code { get; private set; }
        public string Location { get; private set; }
        public double LengthM { get; private set; }
        public double DepthM { get; private set; }
        public double MaxDraftM { get; private set; }
        public IReadOnlyCollection<VesselTypeId> AllowedVesselTypeIds { get; private set; }

        public DockDto(
            Guid id,
            DockCode code,
            string location,
            double lengthM,
            double depthM,
            double maxDraftM,
            IEnumerable<VesselTypeId> allowedVesselTypeIds)
        {
            Id = id;
            Code = code;
            Location = location;
            LengthM = lengthM;
            DepthM = depthM;
            MaxDraftM = maxDraftM;
            AllowedVesselTypeIds = allowedVesselTypeIds.ToList().AsReadOnly();
        }
    }
}