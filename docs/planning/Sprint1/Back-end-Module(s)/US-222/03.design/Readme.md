# US2.2.2 – Manage Vessels (Create, Search, Update)

## 3. Design – User Story Realization

### 3.1. Rationale

***Note that SSD – Alternative One is adopted.***

| Interaction ID                                       | Question: Which class is responsible for...                   | Answer                     | Justification (with patterns)                                                                                          |
| :--------------------------------------------------- | :------------------------------------------------------------ | :------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| Step 1: Officer submits request (e.g. Create Vessel) | …interacting with the actor?                                  | `VesselController`         | **Controller** pattern: centralizes handling of HTTP/API requests from external actors.                                |
|                                                      | …coordinating the US?                                         | `VesselService`            | **Application Service**: orchestrates domain logic, ensures validations, calls repositories and factories.             |
| Step 2: request data (imoNumber, name, owner, type)  | …validating business rules (format, uniqueness, consistency)? | `Vessel` (Aggregate Root)  | **Information Expert**: only the aggregate enforces its invariants (valid IMO number, non-empty name, unique IMO).     |
| Step 3: persist Vessel                               | …storing/retrieving Vessel aggregates?                        | `VesselRepository`         | **Repository**: abstracts database access, retrieves entities, and persists aggregates.                                |
| Step 4: log action                                   | …recording audit/log information?                             | `AuditService` (or Logger) | **Pure Fabrication**: dedicated component for cross-cutting concerns like logging, persistence-independent monitoring. |
| Step 5: factory methods                              | …converting DTOs into domain objects and vice-versa?          | `VesselFactory`            | **Factory**: responsible for object creation, hides construction details, ensures consistency between DTO ↔ Entity.    |

---

**Systematization**

According to this rationale, the conceptual classes promoted to software classes are:

* `Vessel` (Aggregate Root)
* `VesselType` (Aggregate Root – referenced by Vessel)

Other software classes (i.e. Pure Fabrication) identified:

* `VesselController`
* `VesselService`
* `VesselRepository`
* `VesselFactory`
* `AuditService` (logging / cross-cutting)

---

## 3.2. Sequence Diagram (SD)

### Full Diagram

![FSSD](./puml/us2.2.2-sequence-diagram-full.svg)

---

## 3.3. Class Diagram (CD)

![CD](./puml/us2.2.2-class-diagram.svg)

