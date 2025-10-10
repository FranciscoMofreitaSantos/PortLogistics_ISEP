# **US2.2.4 – Register and Update Storage Areas**

## **4. Tests**

### **Test Strategy**

The testing strategy follows a layered validation approach to ensure correctness, robustness, and integration across the system:

* **Unit Tests** – Validate all domain rules inside the Aggregate Root `StorageArea`:

    * Enforce maximum capacity constraints (`occupancy ≤ maxCapacity`);
    * Validate name and description constraints (length, uniqueness);
    * Ensure dock distances and physical resources follow consistency rules.

* **Integration Tests** – Validate persistence and mapping of the `StorageArea` aggregate through the `StorageAreaRepository` using EF Core InMemoryDatabase.

* **API / Functional Tests** – Validate endpoint responses of `StorageAreasController`, including correct HTTP status codes, serialization, and input validation.

---

### **Main Test Cases**

| **Test ID** | **Description**                                             | **Input**                                                                                                         | **Expected Output**               |
| ----------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| TC01        | Register a new Storage Area (Yard) successfully             | `{name:"Yard A", type:"Yard", maxBays:2, maxRows:2, maxTiers:2, distances:[{dockCode:"DK-0001",distanceKm:1.5}]}` | `201 Created` + `StorageAreaDto`  |
| TC02        | Reject duplicate name                                       | Same `name` as existing record                                                                                    | `400 Bad Request`                 |
| TC03        | Reject invalid description (too long)                       | `description.length > 100`                                                                                        | `400 Bad Request`                 |
| TC04        | Reject invalid name (too short)                             | `name.length < 3`                                                                                                 | `400 Bad Request`                 |
| TC05        | Reject capacity overflow                                    | Creating/Updating with `currentCapacity > maxCapacity`                                                            | `400 Bad Request`                 |
| TC06        | Register Storage Area with multiple unique docks            | Distances with distinct DockCodes                                                                                 | `201 Created`                     |
| TC07        | Reject duplicate DockCodes                                  | Distances list containing repeated DockCodes                                                                      | `400 Bad Request`                 |
| TC08        | Register with valid Physical Resources                      | `physicalResources = ["CR-001", "MC-002"]` (existing)                                                             | `201 Created`                     |
| TC09        | Reject non-existing Physical Resources                      | `physicalResources = ["INVALID-001"]`                                                                             | `400 Bad Request`                 |
| TC10        | Update storage area type                                    | `PATCH /api/storageareas/{id}` `{type:"Warehouse"}`                                                               | `200 OK` + updated DTO            |
| TC11        | Get all storage areas                                       | `GET /api/storageareas`                                                                                           | `200 OK` + List of DTOs           |
| TC12        | Get storage area by ID                                      | `GET /api/storageareas/id/{id}`                                                                                   | `200 OK` + `StorageAreaDto`       |
| TC13        | Get storage area by Name                                    | `GET /api/storageareas/name/{name}`                                                                               | `200 OK` + `StorageAreaDto`       |
| TC14        | Get dock distances by ID                                    | `GET /api/storageareas/distances?id={id}`                                                                         | `200 OK` + List of distances      |
| TC15        | Reject non-existing dock distances query                    | Invalid ID or Name                                                                                                | `404 Not Found`                   |
| TC16        | Get physical resources by ID                                | `GET /api/storageareas/physicalresources?id={id}`                                                                 | `200 OK` + List of resource codes |
| TC17        | Reject non-existing storage area in physical resource query | Invalid ID or Name                                                                                                | `404 Not Found`                   |

---

## **5. Construction (Implementation)**

### **Domain Layer**

* **Aggregate Root:** `StorageArea`
* **Entities / Value Objects:**

    * `StorageAreaId`
    * `StorageAreaDockDistance`
    * `PhysicalResourceCode`
* **DTOs:**

    * `CreatingStorageAreaDto`
    * `StorageAreaDto`
    * `StorageAreaDockDistanceDto`
* **Factory:** `StorageAreaFactory`

    * Creates domain entities ensuring dock codes and distances are unique.
* **Repository Interface:** `IStorageAreaRepository`
* **Additional Repository:** `IPhysicalResourceRepository` (for physical resource validation)

---

### **Application Layer**

* **Service:** `StorageAreaService`

    * Implements the business logic for all storage area operations:

        * `GetAllAsync()`
        * `GetByIdAsync(StorageAreaId)`
        * `GetByNameAsync(string)`
        * `GetDistancesToDockAsync(string? name, StorageAreaId? id)`
        * `GetPhysicalResourcesAsync(string? name, StorageAreaId? id)`
        * `CreateAsync(CreatingStorageAreaDto)`
    * Validates:

        * Name uniqueness
        * Physical resources existence
        * Dock distance duplication
    * Handles all domain-level exceptions (`BusinessRuleValidationException`).

---

### **Infrastructure Layer**

* **EF Core Configuration:**
  `StorageAreaEntityTypeConfiguration`

    * Maps entity fields and owned collections (`DistancesToDocks`).
    * Ignores computed properties like `MaxCapacityTeu` and `_grid`.
* **Repository Implementations:**

    * `StorageAreaRepository`
    * `PhysicalResourceRepository`
* **Database Context:**
  `DddSample1DbContext` with `DbSet<StorageArea>`, `DbSet<PhysicalResource>`.

---

### **Presentation Layer**

* **Controller:** `StorageAreasController`

    * REST Endpoints:

        * `GET /api/storageareas`
        * `GET /api/storageareas/id/{id}`
        * `GET /api/storageareas/name/{name}`
        * `GET /api/storageareas/distances`
        * `GET /api/storageareas/physicalresources`
        * `POST /api/storageareas`
        * `PATCH /api/storageareas/{id}` (future extension)
    * Implements proper HTTP responses:

        * `200 OK` on success
        * `201 Created` when creating
        * `400 Bad Request` for invalid input
        * `404 Not Found` for missing resources
        * `409 Conflict` for duplicates

---

## **6. Integration and Demonstration**

### **Integration Steps**

1. Apply latest EF Core migrations to ensure `StorageArea` and `PhysicalResource` tables are up to date.
2. Register dependencies in `Program.cs`:

   ```csharp
   builder.Services.AddScoped<IStorageAreaRepository, StorageAreaRepository>();
   builder.Services.AddScoped<IPhysicalResourceRepository, PhysicalResourceRepository>();
   builder.Services.AddScoped<IStorageAreaService, StorageAreaService>();
   ```
3. Enable structured logging using **Serilog** or built-in ASP.NET Core logging.
4. Use Swagger UI or IntelliJ HTTP Client to execute and verify all API endpoints.
5. Validate proper serialization/deserialization of `StorageAreaDto`.
6. Integrate with **Dock Management Module** to verify existing `DockCodes` consistency.
7. Demonstrate main use cases:

    * Create a new Yard with multiple Dock distances and resources.
    * Update its capacity/type.
    * Query its distances and physical resources.

---

## **7. Observations and Design Notes**

* Validation logic is **enforced inside the `StorageArea` aggregate** to preserve domain integrity.
* Each `StorageArea` can be linked to multiple docks through unique `DockCodes`.
* Each `StorageArea` can reference multiple **Physical Resources** (e.g., cranes, trucks, forklifts).
* Distances and resources are **manually provided by the Port Authority Officer**.
* `StorageAreaService` ensures:

    * No duplicate DockCodes in creation.
    * All referenced Physical Resources exist in the database.
    * Proper business rule validation and transactional consistency.
* Logging is applied both in **domain services** and **controllers**, ensuring traceability for audit logs.
* The system is prepared for future extensions:

    * Updating Storage Areas (`PATCH`)
    * Deleting or deactivating them (`DELETE`)
    * Expanding validation against Dock and Resource subsystems.
