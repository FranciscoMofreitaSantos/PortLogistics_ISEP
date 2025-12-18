# US 4.1.13 - Record and manage incidents

## 4. Tests

### 4.1. Unit Tests (Domain Layer)

Tests focus on the **Incident Aggregate Root** to ensure invariants and business rules are enforced before data reaches the database.

**Test Class:** `Incident.spec.ts`

* **Test 1: Create valid Incident**
* **Scenario:** Provide all valid properties for a "Specific" impact mode incident.
* **Expected:** `Incident` object is created successfully with a generated ID (or provided ID).


* **Test 2: Fail creation with invalid Code format**
* **Scenario:** Provide code `INVALID-CODE`.
* **Expected:** Throws `BusinessRuleValidationError` ("Invalid incident format").


* **Test 3: Fail creation if End Date < Start Date**
* **Scenario:** `startTime` = Today, `endTime` = Yesterday.
* **Expected:** Throws `BusinessRuleValidationError` ("End time must be after start time").


* **Test 4: Fail "Specific" mode without VVEs**
* **Scenario:** `impactMode` = "Specific", `vveList` = `[]`.
* **Expected:** Throws `BusinessRuleValidationError` ("vveList must contain at least one VVE").


* **Test 5: Fail "Upcoming" mode without Windows**
* **Scenario:** `impactMode` = "Upcoming", `upcomingWindowStartTime` = `null`.
* **Expected:** Throws `BusinessRuleValidationError` ("Window start/end time cannot be null").


* **Test 6: Mark as Resolved**
* **Scenario:** Call `markAsResolved()` on an active incident.
* **Expected:** `endTime` is set to `Date.now()`, `duration` is calculated and not null.



### 4.2. Integration Tests (Service/Controller Layer)

Tests using **Supertest** (mocking the HTTP server) and a test database (or mocked repo) to verify the API contract.

**Test Class:** `IncidentController.test.ts`

* **Test 1: POST /api/incidents (Success)**
* **Input:** Valid JSON DTO.
* **Expected:** HTTP 201 Created, returns the created JSON with ID.


* **Test 2: POST /api/incidents (Duplicate)**
* **Input:** Valid JSON but with a `code` that already exists in DB.
* **Expected:** HTTP 400 Bad Request ("Incident already exists").


* **Test 3: GET /api/incidents/active**
* **Setup:** Insert 1 resolved incident, 1 active incident.
* **Action:** GET request.
* **Expected:** HTTP 200, returns array containing only the active incident.


* **Test 4: PATCH /api/incidents/:code/resolve**
* **Action:** Resolve an existing incident.
* **Expected:** HTTP 200, returns updated DTO with `endTime` populated.


* **Test 5: POST /api/incidents/:code/vve/:vveCode**
* **Action:** Add a VVE to an existing incident.
* **Expected:** HTTP 200, response `vveList` contains the new VVE code.



---

## 5. Construction (Implementation)

The implementation follows a **Clean Architecture** approach using **TypeScript**, **Node.js**, **Express**, and **MongoDB**.

### 5.1. Package Structure

```text
src/
├── controllers/
│   └── incident/
│       ├── createIncidentController.ts
│       ├── updateIncidentController.ts
│       ├── getAllIncidentsController.ts
│       └── ... (Single Action Controllers)
├── domain/
│   └── incident/
│       ├── incident.ts (Aggregate Root)
│       ├── impactMode.ts (Value Object)
│       └── incidentId.ts
├── dto/
│   └── IIncidentDTO.ts
├── mappers/
│   └── IncidentMap.ts
├── persistence/
│   └── schemas/
│       └── incidentSchema.ts
├── repos/
│   └── incidentRepo.ts
└── services/
    └── incidentService.ts

```

### 5.2. Key Code Excerpts

**Aggregate Root Validation (Domain)**
The `Incident` class ensures state consistency.

```typescript
// src/domain/incident/incident.ts
public static create(props: IncidentProps, id?: UniqueEntityID): Incident {
    // ... Guards ...
    
    // Invariant: Specific mode requires VVEs
    if (Incident.isSpecificMode(props.impactMode) && (!props.vveList || props.vveList.length === 0)) {
        throw new BusinessRuleValidationError(IncidentError.InvalidInput, "Specific mode requires VVEs.");
    }
    
    // Invariant: Upcoming mode requires Time Windows
    if (Incident.isUpcomingMode(props.impactMode)) {
        if (!props.upcomingWindowStartTime || !props.upcomingWindowEndTime) {
             throw new BusinessRuleValidationError(IncidentError.InvalidInput, "Upcoming mode requires window times.");
        }
    }
    
    return new Incident({ ...props }, id);
}

```

**Repository Querying (Persistence)**
Mongoose is used to filter Active vs. Resolved incidents efficiently.

```typescript
// src/repos/incidentRepo.ts
async getActiveIncidents(): Promise<Incident[]> {
    // Active = endTime is null
    const list = await this.incidentSchema.find({ endTime: null });
    return list.map(record => this.incidentMap.toDomain(record));
}

async getResolvedIncidents(): Promise<Incident[]> {
    // Resolved = endTime is NOT null
    const list = await this.incidentSchema.find({ endTime: { $ne: null } });
    return list.map(record => this.incidentMap.toDomain(record));
}

```

**Dependency Injection Configuration**
Ensures correct case-sensitivity for injection tokens.

```typescript
// src/loaders/index.ts
// ...
{ name: "incidentSchema", path: "../persistence/schemas/incidentSchema" } // Lowercase 'i'
// ...

// src/config.ts
incident: {
    name: "incidentRepo", // Lowercase 'i' to match Service injection
    path: "../repos/incidentRepo",
}

```

---

## 6. Integration and Demo

### 6.1. Deployment Prerequisites

1. **Database**: MongoDB instance running (locally or Atlas).
2. **Environment**: `.env` file configured with `MONGODB_URI` and `PORT`.
3. **Dependencies**: `npm install`.

### 6.2. Demonstration Script (API Walkthrough)

To demonstrate the User Story functionality, the following sequence of HTTP requests is executed (using the `requests.http` file provided in the design phase):

1. **Create Incident Type**: (Prerequisite) Create `T-INC001` (Weather).
2. **Register Active Incident**:
* `POST /api/incidents`
* Body: `{ "code": "INC-2024-001", "impactMode": "Global", "endTime": null ... }`
* *Result*: 201 Created.


3. **Verify Active List**:
* `GET /api/incidents/active`
* *Result*: List includes `INC-2024-001`.


4. **Add Affected VVE**:
* `POST /api/incidents/INC-2024-001/vve/VVE-999`
* *Result*: 200 OK, `vveList` now contains `VVE-999`.


5. **Mark as Resolved**:
* `PATCH /api/incidents/INC-2024-001/resolve`
* *Result*: 200 OK, `endTime` is populated.


6. **Verify Resolved List**:
* `GET /api/incidents/active` -> Empty (or does not contain 001).
* `GET /api/incidents/resolved` -> Contains `INC-2024-001`.



---

## 7. Observations

### 7.1. Critical Decisions & Assumptions

* **VVE Storage**: We decided to store affected VVEs as an array of strings (`[String]`) in the `Incident` document.
* *Pros*: Performance (no joins needed to see affected VVEs for an incident), Simplicity.
* *Cons*: If a VVE ID changes (unlikely) or is deleted, data integrity must be managed manually.


* **External Validation**: The `IncidentService` contains a placeholder `checkIfVVEsExist`. This currently assumes VVEs exist or is mocked. In a full microservices environment, this would require a synchronous HTTP call or Event Bus check to the VVE module.
* **Date Handling**: All dates are expected in **ISO 8601** format (UTC). The frontend is responsible for converting local operator time to UTC before sending.

### 7.2. Future Improvements

* **Soft Deletes**: Currently, the `DELETE` endpoint performs a hard delete from MongoDB. For audit purposes, a "Soft Delete" (setting a `isDeleted` flag) is recommended for production.
* **Optimistic Locking**: Implement `version` keys in Mongoose to prevent race conditions if two operators try to update the `vveList` of the same incident simultaneously.
* **Pagination**: The `getAll`, `getActive`, and `getResolved` endpoints return all records. For a system with years of history, Server-Side Pagination (skip/limit) is mandatory.