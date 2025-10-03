# US2.2.2 - Register and update Vessel Records

## 2. Analysis

### 2.1. Relevant Domain Model Excerpt

![Domain Model](./puml/domain_model.png)

**Concepts identified:**

* **Vessel (Aggregate Root)**

    * Attributes: `Id` (surrogate key), `IMO` (natural key), `Name`, `Operator/Owner`.
    * Association: belongs to one `VesselType`.
* **IMO (Value Object)**

    * Ensures correct format and check digit validation.
    * Immutable once created.
  
* **VesselType (Entity)**

    * From US2.2.1, referenced here to classify vessels.
  
* **Owner/Operator (Value Object or simple property)**

    * Stores operator information.
    * May evolve to an entity if operators/organizations become first-class citizens in the system (dependency with US2.2.5).

**Invariants and business rules:**

* A `Vessel` **must have a valid IMO** at creation; IMO cannot be updated.
* Vessel **must reference a valid VesselType** (must exist in the system).
* `Name` and `Operator/Owner` are updatable.
* No duplicate IMO numbers allowed (enforced by repository/aggregate).
* Updates must preserve referential integrity (VesselType link must remain valid).

---

### 2.2. Other Remarks

* The **IMO number** acts as a business identifier but will be encapsulated in a Value Object for validation.
* Updates may trigger **audit logging** (who updated vessel name/operator, when).
* Search functionality (by IMO, name, operator) is an **application service responsibility**, not modeled as part of the aggregate.
* Future US may extend this to include technical vessel details (dimensions, tonnage, flag state).
