namespace SEM5_PI_DecisionEngineAPI.DTOs;

public class DockRebalanceProposalDto
{
    public DateOnly Day { get; set; }

    public List<DockReassignmentEntryDto> Reassignments { get; set; } = new();

    public int TotalMoves => Reassignments.Count(r => r.IsProposedMove && !r.Rejected);

    public string OptimizationSummary { get; set; }
}

public class DockReassignmentEntryDto
{
    public string VvnId { get; set; }
    public string VesselName { get; set; }

    public string OriginalDock { get; set; }
    public string ProposedDock { get; set; }
    
    public string DecisionType { get; set; }

    public bool IsProposedMove =>
        !string.Equals(OriginalDock, ProposedDock, StringComparison.OrdinalIgnoreCase)
        && !Rejected;

    public bool Rejected { get; set; }
    public string RejectionReason { get; set; }


    public double DockLoadBefore { get; set; }
    public double DockLoadAfter { get; set; }


    public double BalanceImprovementScore { get; set; }

    public string EvaluationNotes { get; set; }
}