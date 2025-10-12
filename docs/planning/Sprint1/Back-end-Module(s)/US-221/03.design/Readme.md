# US2.2.1 – Create and Manage Vessel Types

## 3. Design – User Story Realization

### 3.1. Rationale

This section defines which software class takes responsibility for each interaction step, following the **System Sequence Diagram** established in the analysis phase.

| Interaction ID                                              | Question: Which class is responsible for... | Answer                                   | Justification (with patterns)                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Step 1: Officer submits “Create/Update VesselType”          | …interacting with the actor?                | `VesselTypeController`                   | **Controller Pattern:** centralizes request handling from the external API and delegates logic to the application layer.       |
|                                                             | …coordinating the use case?                 | `IVesselTypeService` / `VesselTypeService` | **Application Service:** orchestrates business logic, enforcing workflow and delegating persistence to repositories.          |
| Step 2: request data (name, description, constraints, etc.) | …validating business rules?                 | `VesselType` (Aggregate Root)            | **Information Expert:** the aggregate root enforces invariants (positive constraints, name uniqueness, etc.).                |
|                                                             | …transforming between DTOs and Entities?    | `VesselTypeFactory`                      | **Factory Pattern:** centralizes creation of domain objects and DTOs to ensure consistent transformations.                    |
| Step 3: persist VesselType                                  | …storing/retrieving VesselType data?        | `VesselTypeRepository` + `UnitOfWork`    | **Repository Pattern:** abstracts persistence; **Unit of Work:** ensures transactional consistency and atomic commits.        |
| Step 4: log action                                          | …recording audit trail or logs?             | `ILogger` (e.g., Serilog)                | **Pure Fabrication:** cross-cutting concern responsible for recording audit, monitoring, and debugging information.           |

**Systematization**

According to the above rationale, the conceptual classes promoted to software classes are:

- `VesselType` (Aggregate Root)

Other software classes (i.e., Pure Fabrication) identified:

- `VesselTypeController`
- `IVesselTypeService` / `VesselTypeService`
- `VesselTypeFactory`
- `VesselTypeRepository`
- `UnitOfWork`
- `ILogger` (Logging / Audit)

---

### 3.2. Sequence Diagram (SD)

**Full Diagram:**

![Sequence Diagram – US2.2.1](./puml/us2.2.1-sequence-diagram-full.svg)

---

### 3.3. Class Diagram (CD)

The class diagram represents the structural organization of the main components involved in the user story.  
It includes the **Domain Aggregate**, **Application Service**, **Repository**, **Factory**, and **Controller**, following the **DDD Layered Architecture**.

**Main elements:**
- `VesselType` — Aggregate Root defining attributes and business rules.
- `CreatingVesselTypeDto` / `UpdatingVesselTypeDto` — DTOs used for data transfer between layers.
- `IVesselTypeService` / `VesselTypeService` — Application Service interface and implementation coordinating the use case.
- `VesselTypeRepository` and `IUnitOfWork` — Infrastructure components for persistence and transaction management.
- `VesselTypeController` — REST controller handling API requests and responses.
- `ILogger` — Cross-cutting service for audit logging.

**Diagram:**

![Class Diagram – US2.2.1](./puml/us2.2.1-class-diagram.svg)
