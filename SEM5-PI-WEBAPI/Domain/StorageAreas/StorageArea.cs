using SEM5_PI_WEBAPI.Domain.PhysicalResources;
using SEM5_PI_WEBAPI.Domain.Shared;
using SEM5_PI_WEBAPI.Domain.ValueObjects;

namespace SEM5_PI_WEBAPI.Domain.StorageAreas;

public enum StorageAreaType
{
    Yard,
    Warehouse
}

public class StorageArea : Entity<StorageAreaId>, IAggregateRoot
{
    private const string DefaultDescription = "No description.";
    private const int MinNameLength = 3;
    private const int MaxDescriptionLength = 100;
    private const int MinBays = 1;
    private const int MinRows = 1;
    private const int MinTiers = 1;
    
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public StorageAreaType Type { get; private set; }

    public int MaxBays { get; private set; }
    public int MaxRows { get; private set; }
    public int MaxTiers { get; private set; }

    public int MaxCapacityTeu => MaxBays * MaxRows * MaxTiers;
    public int CurrentCapacityTeu { get; private set; }
    
    public List<PhysicalResourceCode> PhysicalResources { get; private set; }

    private readonly List<StorageAreaDockDistance> _distancesToDocks = new();
    public IReadOnlyCollection<StorageAreaDockDistance> DistancesToDocks => _distancesToDocks.AsReadOnly();
    
    
    private readonly List<StorageAreaSlot> _slots = new();
    public IReadOnlyCollection<StorageAreaSlot> Slots => _slots.AsReadOnly();

    protected StorageArea() { }

    public StorageArea(string name, string? description, StorageAreaType type,
        int maxBays, int maxRows, int maxTiers, IEnumerable<StorageAreaDockDistance> distancesToDocks, List<PhysicalResourceCode> physicalResources)
    {
        SetName(name);
        SetDescription(description);
        SetType(type);

        SetMaxBays(maxBays);
        SetMaxRows(maxRows);
        SetMaxTiers(maxTiers);

        _distancesToDocks.AddRange(distancesToDocks);
        PhysicalResources = physicalResources?.ToList() ?? new List<PhysicalResourceCode>();
        CurrentCapacityTeu = 0;

        this.Id = new StorageAreaId(Guid.NewGuid());
        
    }
    
    public void ChangeDescription(string description) => SetDescription(description);
    public void AddPhysicalResources(IEnumerable<PhysicalResourceCode> physicalResources) => AggPhysicalResources(physicalResources);
    public void RemovePhysicalResources(IEnumerable<PhysicalResourceCode> physicalResources) => RmvPhysicalResources(physicalResources);
    public void ChangeMaxBays(int updatedMaxBays) => SetMaxBays(updatedMaxBays);
        
    public void ChangeMaxRows(int updatedMaxRows) => SetMaxRows(updatedMaxRows);
        
    public void ChangeMaxTiers(int updatedMaxTiers)=> SetMaxTiers(updatedMaxTiers);

    
    private StorageAreaSlot GetOrCreateSlot(int bay, int row, int tier)
    {
        var slot = _slots.FirstOrDefault(s => s.Bay == bay && s.Row == row && s.Tier == tier);
    
        if (slot == null)
        {
            slot = new StorageAreaSlot(this.Id, bay, row, tier);
            _slots.Add(slot);
        }

        return slot;
    }


    public void PlaceContainer(Iso6346Code containerIso, int bay, int row, int tier)
    {
        if (bay < 0 || bay >= MaxBays ||
            row < 0 || row >= MaxRows ||
            tier < 0 || tier >= MaxTiers)
            throw new BusinessRuleValidationException($"Invalid Bay/Row/Tier [{bay}|{row}|{tier}] position for storage area [{Name}] -> {MaxBays}|{MaxRows}|{MaxTiers}.");

        var slot = GetOrCreateSlot(bay, row, tier);

        if (!slot.IsEmpty())
            throw new BusinessRuleValidationException($"Slot [{bay}|{row}|{tier}] is already occupied on storage area [{Name}].");

        slot.AssignContainer(containerIso);
        CurrentCapacityTeu++;
    }


    public void RemoveContainer(int bay, int row, int tier)
    {
        var slot = _slots.SingleOrDefault(s => s.Bay == bay && s.Row == row && s.Tier == tier)
                   ?? throw new BusinessRuleValidationException($"No container found in Slot [{bay}|{row}|{tier}] for  storage area [{Name}].");

        slot.RemoveContainer();
        CurrentCapacityTeu--;

        if (slot.IsEmpty())
            _slots.Remove(slot);

    }



    public Iso6346Code? FindContainer(int bay, int row, int tier)
    {
        // validar limites
        if (bay < 0 || bay >= MaxBays ||
            row < 0 || row >= MaxRows ||
            tier < 0 || tier >= MaxTiers)
            throw new BusinessRuleValidationException($"Invalid Bay/Row/Tier [{bay}|{row}|{tier}] position for storage area [{Name}] -> {MaxBays}|{MaxRows}|{MaxTiers}.");

        var slot = _slots.FirstOrDefault(s =>
            s.Bay == bay && s.Row == row && s.Tier == tier);

        // Se o slot não existe, nunca teve contentor
        if (slot == null)
            return null;

        // Se existe, verifica se está vazio
        return slot.ContainerIsoCode is null ? null : new Iso6346Code(slot.ContainerIsoCode);
    }



    public void AssignDock(DockCode dock, float distance)
    {
        if (_distancesToDocks.Any(d => d.Dock.Value == dock.Value))
            throw new BusinessRuleValidationException($"Dock with DockCode {dock.Value} already exists.");

        _distancesToDocks.Add(new StorageAreaDockDistance(dock, distance));
    }
    

    private void SetDescription(string? description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            Description = DefaultDescription;
            return;
        }

        if (description.Length > MaxDescriptionLength)
            throw new BusinessRuleValidationException($"Description can't be longer than [{MaxDescriptionLength}] characters.");

        Description = description;
    }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length < MinNameLength)
            throw new BusinessRuleValidationException($"Name must have at least {MinNameLength} characters.");
        Name = name;
    }

    private void AggPhysicalResources(IEnumerable<PhysicalResourceCode> physicalResources)
    {
        foreach (var resource in physicalResources)
        {
            if (!this.PhysicalResources.Any(p => p.Value == resource.Value))
                this.PhysicalResources.Add(resource);
        }
    }


    private void RmvPhysicalResources(IEnumerable<PhysicalResourceCode> physicalResources)
    {
        var valuesToRemove = physicalResources.Select(p => p.Value).ToHashSet();
        this.PhysicalResources.RemoveAll(p => valuesToRemove.Contains(p.Value));
    }

    private void SetType(StorageAreaType type)
    {
        if(type != StorageAreaType.Yard && type != StorageAreaType.Warehouse)
            throw new BusinessRuleValidationException($"Invalid storage area type -> {type} make sure you are using a storage area type [Yard, Warehouse].");
        
        this.Type = type;
    }
    
    private void SetMaxBays(int maxBays)
    {
        if (maxBays < MinBays) throw new BusinessRuleValidationException($"Max 'Bays' must be greater than {MinBays}.");
        this.MaxBays = maxBays;
    }
        
    private void SetMaxRows(int maxRows)
    {
        if (maxRows < MinRows) throw new BusinessRuleValidationException($"Max 'Rows' must be greater than {MinRows}.");
        this.MaxRows = maxRows;
    }

    private void SetMaxTiers(int maxTiers)
    {
        if(maxTiers < MinTiers) throw new BusinessRuleValidationException($"Max 'Tiers' must be greater than {MinTiers}.");
        this.MaxTiers = maxTiers;
    }
    
    public override string ToString() =>
        $"StorageArea [Name={Name}, Type={Type}, Capacity={CurrentCapacityTeu}/{MaxCapacityTeu} TEUs]";
}