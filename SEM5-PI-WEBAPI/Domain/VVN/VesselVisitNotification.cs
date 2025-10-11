using SEM5_PI_WEBAPI.Domain.CargoManifests;
using SEM5_PI_WEBAPI.Domain.CrewManifests;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;
using SEM5_PI_WEBAPI.Domain.Dock;
using SEM5_PI_WEBAPI.Domain.Vessels;

namespace SEM5_PI_WEBAPI.Domain.VVN;

public enum VvnStatus{
    InProgress,
    PendingInformation,
    Withdrawn,
    Submitted,
    Rejected
}

public class VesselVisitNotification : Entity<VesselVisitNotificationId>, IAggregateRoot
{
    public VvnCode Code { get; private set; }
    
    public ClockTime EstimatedTimeArrival { get; private set; }
    public ClockTime ActualTimeArrival { get; private set; }
    public ClockTime EstimatedTimeDeparture { get; private set; }
    public ClockTime ActualTimeDeparture { get; private set; }
    public ClockTime? AcceptenceDate {get; private set;}

    public int Volume {get; set;}
    public string? Documents {get; set;}

    public VvnStatus Status {get; set;}
    public IEnumerable<EntityDock> ListDocks {get; set;}
    public CrewManifest? CrewManifest {get; set;}
    public CargoManifest? LoadingCargoManifest {get; set;}
    public CargoManifest? UnloadingCargoManifest {get; set;}
    public ImoNumber VesselImo {get; set;}
    
    public IEnumerable<Task> Tasks {get; set;}
    
    
    
    public VesselVisitNotification (){}
    
    public VesselVisitNotification(VvnCode code, ClockTime estimatedTimeArrival, ClockTime estimatedTimeDeparture,
        int volume,string? documents, IEnumerable<EntityDock> docks,
        CrewManifest? crewManifest,CargoManifest? loadingCargoManifest,
        CargoManifest? unloadingCargoManifest,ImoNumber vesselImo,IEnumerable<Task> tasks)
    {
        Id = new VesselVisitNotificationId(new Guid());
        SetCode(code);
        SetEstimatedTimeArrival(estimatedTimeArrival);
        SetEstimatedTimeDeparture(estimatedTimeDeparture);
        SetVolume(volume);
        SetDocuments(documents);
        SetListDocks(docks);
        SetCrewManifest(crewManifest);
        SetLoadingCargoManifest(loadingCargoManifest);
        SetUnloadingCargoManifest(unloadingCargoManifest);
        SetVesselImo(vesselImo);

        AcceptenceDate = null;
        Status = VvnStatus.InProgress;
    }


    private void SetCode(VvnCode code)
    {
        this.Code = code;
    }

    private void SetEstimatedTimeArrival(ClockTime estimatedTimeArrival)
    {
        this.EstimatedTimeArrival = estimatedTimeArrival;
    }

    private void SetEstimatedTimeDeparture(ClockTime estimatedTimeDeparture)
    {
        this.EstimatedTimeDeparture = estimatedTimeDeparture;
    }

    private void SetActualTimeDeparture(ClockTime actualTimeDeparture)
    {
        this.ActualTimeDeparture = actualTimeDeparture;
    }

    private void SetActualTimeArrival(ClockTime actualTimeArrival)
    {
        this.ActualTimeArrival = actualTimeArrival;
    }

    private void SetVolume(int volume)
    {
        this.Volume = volume;
    }

    private void SetDocuments(string documents)
    {
        this.Documents = documents;
    }

    private void SetListDocks(IEnumerable<EntityDock> docks)
    {
        this.ListDocks = docks;
    }

    private void SetCrewManifest(CrewManifest? crewManifest)
    {
        this.CrewManifest = crewManifest;
    }

    private void SetLoadingCargoManifest(CargoManifest? cargoManifest)
    {
        this.LoadingCargoManifest = cargoManifest;
    }

    private void SetUnloadingCargoManifest(CargoManifest? cargoManifest)
    {
        this.UnloadingCargoManifest = cargoManifest;
    }

    private void SetVesselImo(ImoNumber vesselImo)
    {
        this.VesselImo = vesselImo;
    }

    private void SetTasks(IEnumerable<Task> tasks)
    {
        this.Tasks = tasks;
    }
    
    
    //----------------
    
    public void Submit()
    {
        if (Status != VvnStatus.InProgress)
            throw new BusinessRuleValidationException("Only in-progress VVNs can be submitted.");
        Status = VvnStatus.Submitted;
    }

    public void MarkPending()
    {
        if (Status != VvnStatus.InProgress)
            throw new BusinessRuleValidationException("Only in-progress VVNs can be marked pending.");
        Status = VvnStatus.PendingInformation;
    }

    public void Reject(string reason)
    {
        if (Status != VvnStatus.Submitted)
            throw new BusinessRuleValidationException("Only submitted VVNs can be rejected.");
        Status = VvnStatus.Rejected;
    }

    public void Withdraw()
    {
        if (Status != VvnStatus.InProgress)
            throw new BusinessRuleValidationException("Only in-progress VVNs can be withdrawn.");
        Status = VvnStatus.Withdrawn;
    }
    
    public void Resume()
    {
        if (Status != VvnStatus.Withdrawn)
            throw new BusinessRuleValidationException("Only withdrawn VVNs can be resumed.");
        Status = VvnStatus.InProgress;
    }
    
    public bool IsEditable => Status == VvnStatus.InProgress || Status == VvnStatus.PendingInformation;

}