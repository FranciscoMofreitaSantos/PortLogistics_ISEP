# US2.2.1 – Create and Manage Vessel Types

---

## 4. Tests

### 4.1. Purpose
The main goal of testing this user story is to verify the correct behavior of the system when creating, updating, and retrieving **Vessel Types**, ensuring that all business rules and constraints are enforced.

### 4.2. Scope
The tests cover the **Domain**, **Application Service**, and **Controller** layers:

#### Unit Tests
- **Domain (Entity):** validation of rules such as non-empty name, valid dimension constraints, and capacity calculation.
- **Application Service:** validation of name uniqueness, repository integration, and transactional behavior.
- **Controller:** validation of HTTP responses, exception handling, and DTO serialization.

#### Integration Tests (API)
- API endpoints `/api/VesselType` tested via HTTP requests (Postman collection):  
  - `GET /api/VesselType` – retrieve all vessel types  
  - `GET /api/VesselType/id/{guid}` – retrieve by ID  
  - `POST /api/VesselType` – create  
  - `PUT /api/VesselType/{id}` – update  
  - `GET /api/VesselType/filter` – search/filter by name or description  

### 4.3. Key Test Cases

| Layer | Test Case | Expected Result |
| ------ | ---------- | ---------------- |
| Domain | Creating a `VesselType` with negative bays | `BusinessRuleValidationException` thrown |
| Domain | Setting a name longer than 50 chars | `BusinessRuleValidationException` thrown |
| Service | Adding a new `VesselType` with an existing name | `BusinessRuleValidationException: "VesselType with name X already exists"` |
| Service | Valid creation of vessel type | Returns `VesselTypeDto` with valid ID and computed capacity |
| Controller | POST `/api/VesselType` valid input | HTTP `201 Created` with DTO body |
| Controller | POST `/api/VesselType` invalid (missing fields) | HTTP `400 BadRequest` with error message |
| Controller | PUT `/api/VesselType/{id}` valid update | HTTP `200 OK` and updated DTO |
| Controller | PUT `/api/VesselType/{id}` invalid (duplicate name) | HTTP `400 BadRequest` |
| Controller | GET `/filter` no results | HTTP `404 NotFound` |

---

## 5. Construction (Implementation)

### 5.1. Layers Involved
The implementation follows a **DDD + Clean Architecture** approach, consisting of the following layers:

| Layer | Description | Example Classes |
| ------ | ------------ | ---------------- |
| **Presentation** | Handles HTTP requests and responses. | `VesselTypeController` |
| **Application** | Coordinates business operations and validation flow. | `IVesselTypeService`, `VesselTypeService`, `VesselTypeFactory` |
| **Domain** | Contains core business logic and invariants. | `VesselType`, `VesselTypeId` |
| **Infrastructure** | Handles data persistence and transaction management. | `IVesselTypeRepository`, `UnitOfWork` |
| **Cross-cutting** | Logging and monitoring. | `ILogger<T>` |

### 5.2. Main Code Elements

#### (a) Domain – `VesselType`
Implements all business rules:
```csharp
if (string.IsNullOrWhiteSpace(name)) throw new BusinessRuleValidationException("Name can't be empty.");
if (maxBays < 1 || maxRows < 1 || maxTiers < 1)
    throw new BusinessRuleValidationException("Dimensions must be greater than zero.");
Capacity = MaxBays * MaxRows * MaxTiers;
````

#### (b) Application Service – `VesselTypeService`

Coordinates validation and persistence:

```csharp
public async Task<VesselTypeDto> AddAsync(CreatingVesselTypeDto dto)
{
    var exists = (await GetAllAsync()).Any(q => q.Name.Equals(dto.Name, StringComparison.OrdinalIgnoreCase));
    if (exists) throw new BusinessRuleValidationException($"VesselType with name '{dto.Name}' already exists.");

    var entity = VesselTypeFactory.CreateBasicVesselType(dto);
    await _vesselTypeRepository.AddAsync(entity);
    await _unitOfWork.CommitAsync();

    return VesselTypeFactory.CreateDtoVesselType(entity);
}
```

#### (c) Controller – `VesselTypeController`

Exposes REST endpoints:

```csharp
[HttpPost]
public async Task<ActionResult<VesselTypeDto>> Create(CreatingVesselTypeDto dto)
{
    try
    {
        var created = await _service.AddAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
    catch (BusinessRuleValidationException e)
    {
        return BadRequest(e.Message);
    }
}
```

---

## 6. Integration and Demo

* The implemented API endpoints were tested using **Postman**, confirming full integration between layers.
* Successful requests return `VesselTypeDto` objects serialized in JSON.
* Error cases return detailed validation messages with proper HTTP codes (`400`, `404`).
* Logging is available through **Serilog**, recording creation, update, and search events.

**Example demo scenario:**

1. `POST /api/VesselType` → creates `"Panamax"`
2. `GET /api/VesselType/filter?name=Panamax` → confirms existence
3. `PUT /api/VesselType/{id}` → updates max tiers
4. `GET /api/VesselType/id/{id}` → returns updated version




