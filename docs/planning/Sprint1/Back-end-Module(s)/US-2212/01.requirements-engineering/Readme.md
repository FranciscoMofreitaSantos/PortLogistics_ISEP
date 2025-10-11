# US 2.2.12 - Register and Manage Physical Resources

## 1. Requirements Engineering

### 1.1. User Story Description

> **As a Logistics Operator,** I want to **register and manage physical resources** (create, update, deactivate) so that they can be **accurately considered** during **planning and scheduling operations**.

**Preconditions**

* Operator is authenticated and authorized.
* The “Resource Management” module is available.

**Postconditions**

* A new **PhysicalResource** is persisted, updated, or deactivated.
* Resources are available for reference in planning and scheduling operations.
* Changes and deactivations are auditable (who/when/what).

---

### 1.2. Customer Specifications and Clarifications

> Physical resources include **cranes (fixed and mobile), trucks, and other equipment** directly involved in vessel and yard operations.
> Each resource must have a **unique alphanumeric code** (`ALPHA_CODE`) and a **description**.
> Resources must store **operational capacity** (varies by resource type) and, if applicable, an **assigned area** (e.g., Dock A, Yard B).
> Additional properties include:
> - **Availability status** (`STATUS`: active, inactive, under maintenance).
> - **Setup time** (`SETUP_TIME` in minutes, if relevant) before starting operations.
> - **Qualification requirements** to ensure only certified staff are scheduled.
    > **Deactivation/reactivation** must preserve data for audit and historical planning purposes.
    > Resources must be **searchable/filterable** by `ALPHA_CODE`, `DESCRIPTION`, `TYPE`, and `STATUS`.

**From forum (hypothetical clarifications)**

> **Q:** Can two resources share the same `ALPHA_CODE`?  
> **A:** No, `ALPHA_CODE` must be **unique** across all resources for clear identification.

> **Q:** What units are used for `OPERATIONAL_CAPACITY`?  
> **A:** Depends on the resource `TYPE` (e.g., tons/hour for cranes, load capacity for trucks).

> **Q:** Is `SETUP_TIME` mandatory for all resources?  
> **A:** No, it’s optional and only applicable for resources requiring setup (e.g., cranes).


---

### 1.3. Acceptance Criteria

* **AC01 – Create:** System allows creating a `PhysicalResource` with `ALPHA_CODE`, `DESCRIPTION`, `TYPE`, `OPERATIONAL_CAPACITY`, `SETUP_TIME`, `STATUS`, `SCHEDULE`, and `QUALIFICATIONS`.
* **AC02 – Update:** System allows updating the fields of an existing `PhysicalResource`.
* **AC03 – Deactivate:** System supports deactivating a resource by setting `STATUS` to `INACTIVE` or `UNDER_MAINTENANCE`, preserving data.
* **AC04 – Search/Filter:** Users can **search** by `ALPHA_CODE` and **filter** by `ALPHA_CODE`, `DESCRIPTION`, `TYPE`, or `STATUS` substrings.
* **AC05 – Reference Availability:** Created/updated resources are **immediately available** to planning and scheduling modules.
* **AC06 – Audit:** Create/Update/Deactivate actions are **logged** with timestamp, operator ID, and action outcome.
* **AC07 – Error Handling:** On validation failure, the user receives **clear, actionable error messages**; no partial records.

---

### 1.4. Found Dependencies

* **Depends on:** Authentication/Authorization (role: Logistics Operator), US 2.2.13 (Qualification Management for `QUALIFICATIONS` reference).
* **Provides to:** Planning and scheduling modules that reference `PhysicalResource`.
* **Cross-cutting:** Audit/Logging, Search API.

---

### 1.5. Input and Output Data

**Input Data (Create/Update form or API):**

* `ALPHA_CODE : string` *(required, unique, alphanumeric)*
* `DESCRIPTION : string` *(required)*
* `TYPE : string` *(required, e.g., "Fixed Crane", "Truck")*
* `OPERATIONAL_CAPACITY : number > 0` *(required, type-specific units)*
* `SETUP_TIME : integer >= 0` *(optional)*
* `STATUS : enum {ACTIVE, INACTIVE, UNDER_MAINTENANCE}` *(required)*
* `SCHEDULE : object` *(optional, defines availability windows)*
* `QUALIFICATIONS : list<string>` *(optional, references qualification codes from US 2.2.13)*

**Output Data:**

* On success: persisted **PhysicalResource DTO** (`ID`, `ALPHA_CODE`, `DESCRIPTION`, `TYPE`, `OPERATIONAL_CAPACITY`, `SETUP_TIME`, `STATUS`, `SCHEDULE`, `QUALIFICATIONS`, created/updated timestamps).
* On failure: **error list** with field-level messages (e.g., “ALPHA_CODE already exists”, “OPERATIONAL_CAPACITY must be > 0”).
* For search: **paged list** of `{ID, ALPHA_CODE, DESCRIPTION, TYPE, STATUS}` with filter metadata.

---

### 1.6. System Sequence Diagram (SSD)

![SSD](./puml/us2.2.12-sequence-diagram.svg)

---

### 1.7. Other Relevant Remarks

- None