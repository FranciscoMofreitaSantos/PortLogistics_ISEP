using SEM5_PI_WEBAPI.Domain.CargoManifests;
using SEM5_PI_WEBAPI.Domain.CrewManifests;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.VVN.Docs;

namespace SEM5_PI_WEBAPI.Domain.VVN;

public static class VesselVisitNotificationFactory
{
    public static VesselVisitNotification CreateVesselVisitNotification(
        VvnCode code,
        string estimatedTimeArrivalDto,
        string estimatedTimeDepartureDto,
        int volume,
        PdfDocumentCollection? documents,
        CrewManifest? crewManifest,
        CargoManifest? loadingCargoManifest,
        CargoManifest? unloadingCargoManifest,
        ImoNumber vesselImo)
    {
        if (!DateTime.TryParse(estimatedTimeArrivalDto, null,
                System.Globalization.DateTimeStyles.RoundtripKind, out var eta))
            throw new BusinessRuleValidationException("Invalid EstimatedTimeArrival format. Use ISO 8601.");

        if (!DateTime.TryParse(estimatedTimeDepartureDto, null,
                System.Globalization.DateTimeStyles.RoundtripKind, out var etd))
            throw new BusinessRuleValidationException("Invalid EstimatedTimeDeparture format. Use ISO 8601.");

        var estimatedTimeArrival = new ClockTime(eta);
        var estimatedTimeDeparture = new ClockTime(etd);

        var safeDocuments = documents ?? new PdfDocumentCollection();

        return new VesselVisitNotification(
            code,
            estimatedTimeArrival,
            estimatedTimeDeparture,
            volume,
            safeDocuments,
            crewManifest,
            loadingCargoManifest,
            unloadingCargoManifest,
            vesselImo
        );
    }
}