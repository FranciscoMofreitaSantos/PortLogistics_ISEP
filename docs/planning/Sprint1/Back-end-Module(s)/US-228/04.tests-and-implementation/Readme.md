# **US2.2.8 – Register Vessel Visit Notification**

---

## **4. Tests**

The following tests were developed to validate the correct behavior of the *Register Vessel Visit Notification* use case.

### **4.1. Unit Tests**

**Scope:** Domain and Application layers

| Test ID | Description                                                                                                                                   | Expected Result                                                          |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| T01     | Create a `VesselVisitNotification` with valid data (ETA, ETD, volume, docks, manifests, vessel IMO)                                           | Instance created successfully with `Status = InProgress`                 |
| T02     | Attempt to create a `VesselVisitNotification` with invalid `ETA` or `ETD` format                                                              | Throws `BusinessRuleValidationException`                                 |
| T03     | Create a `VvnCode` with valid year and sequence                                                                                               | Properly formatted code: `YYYY-THPA-XXXXXX`                              |
| T04     | Attempt to create a `VvnCode` with non-numeric year or sequence                                                                               | Throws `BusinessRuleValidationException`                                 |
| T05     | Validate `Volume < 0` constraint                                                                                                              | Throws `BusinessRuleValidationException("Volume must be non-negative.")` |
| T06     | Check `Submit()`, `Withdraw()`, `Resume()`, and `Accept()` transitions                                                                        | State transitions behave as per business rules                           |
| T07     | Create tasks for a cargo manifest and ensure all required operations (`ContainerHandling`, `YardTransport`, `StoragePlacement`) are generated | Three `EntityTask` created for each container entry                      |

---

### **4.2. Integration Tests**

**Scope:** API Endpoint `/api/vesselvisitnotifications`

| Test ID | Scenario                                      | Request                                                   | Expected Result                                                                     |
| ------- | --------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| IT01    | Valid creation of a Vessel Visit Notification | `POST /api/vesselvisitnotifications` with valid JSON body | HTTP `201 Created` with `VesselVisitNotificationDto`                                |
| IT02    | Invalid vessel IMO number                     | Vessel not registered in system                           | HTTP `400 Bad Request` – `"System couldn't find a Vessel with the given ImoNumber"` |
| IT03    | Invalid dock code                             | Dock not found in repository                              | HTTP `400 Bad Request` – `"Dock with code [...] not found"`                         |
| IT04    | Missing required fields (e.g. ETA/ETD)        | Incomplete request body                                   | HTTP `400 Bad Request`                                                              |
| IT05    | Fetch existing VVN by ID                      | `GET /api/vesselvisitnotifications/id/{id}`               | HTTP `200 OK` with full VVN JSON                                                    |
| IT06    | Fetch non-existing VVN                        | Invalid GUID                                              | HTTP `404 Not Found`                                                                |

---

## **5. Construction (Implementation)**

The implementation followed the layered architecture defined for the project:

| Layer                            | Main Components                                                                                                           | Description                                                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Presentation (API)**           | `VesselVisitNotificationController`                                                                                       | Exposes REST endpoints `/api/vesselvisitnotifications` for creation and retrieval. Handles HTTP status codes.                                                          |
| **Application (Service)**        | `VesselVisitNotificationService`                                                                                          | Orchestrates the creation logic, validating dock codes, manifests, vessel IMO, and generating related tasks. Uses Unit of Work for transaction integrity.              |
| **Domain**                       | `VesselVisitNotification`, `VvnCode`, `ClockTime`, `PdfDocumentCollection`, `CrewManifest`, `CargoManifest`, `EntityTask` | Encapsulates business rules: state transitions (`Submit`, `Withdraw`, `Resume`, `Accept`), and ensures integrity constraints (non-negative volume, valid dates, etc.). |
| **Factory**                      | `VesselVisitNotificationFactory`                                                                                          | Builds aggregates from DTOs and converts domain entities into DTOs for API response.                                                                                   |
| **Persistence (Infrastructure)** | `VesselVisitNotificationRepository`                                                                                       | Implements `IVesselVisitNotificationRepository` using EF Core. Persists the aggregate root and related entities.                                                       |

The `AddAsync()` method in the service coordinates the following sequence:

1. **Validate input DTO**
2. **Create dependent manifests**
3. **Fetch vessel and docks from repositories**
4. **Generate VVN code**
5. **Build the domain aggregate via factory**
6. **Create operational tasks**
7. **Persist and commit using UnitOfWork**
8. **Return DTO response**

---

## **6. Integration and Demo**

* The new feature was integrated into the **Port Management API**, under the route:

  ```
  POST /api/vesselvisitnotifications
  ```
* The endpoint expects a `CreatingVesselVisitNotificationDto` JSON body.
* The successful response returns a `VesselVisitNotificationDto` containing:

    * Code (`VvnCode`)
    * Vessel IMO
    * ETA / ETD
    * Volume
    * Associated manifests (crew and cargo)
    * Related tasks and assigned docks
    * Current status (`InProgress` by default)
* During the **demo**, a Shipping Agent Representative submits a valid request through Postman or Swagger UI.
  The API returns a **201 Created** message confirming the creation of the Vessel Visit Notification.

---

## **7. Observations**

* The business rules guarantee that only valid vessels, docks, and manifests can be linked to a VVN.
* The creation process automatically generates operational tasks based on the cargo manifests.
* The domain model ensures that a VVN can only be accepted after being submitted (`Submitted → Accepted` transition).
* The use of **Factories** centralizes entity creation and DTO mapping, improving testability and maintainability.
* The entire process respects the **DDD layered architecture** and **transaction consistency** using the `UnitOfWork` pattern.
