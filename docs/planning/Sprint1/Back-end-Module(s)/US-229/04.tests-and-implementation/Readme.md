# **US2.2.9 – Update or Complete Vessel Visit Notification**

---

## **4. Tests**

To ensure correctness and domain consistency, a comprehensive set of unit and integration tests was implemented:

| **Test Type**    | **Target**                                     | **Description**                                                                                | **Expected Result**                                           |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Unit Test        | `VesselVisitNotification.UpdateVolume()`       | Validates that the volume is correctly updated when the VVN is *InProgress*.                   | Volume field updated successfully.                            |
| Unit Test        | `VesselVisitNotification.Submit()`             | Ensures a VVN can only be submitted once and transitions from *InProgress* → *Submitted*.      | Status changes to `Submitted`; subsequent updates blocked.    |
| Unit Test        | `VesselVisitNotification.Withdraw()`           | Confirms that a VVN can only be withdrawn when status is *InProgress* or *PendingInformation*. | Status changes to `Withdrawn`.                                |
| Unit Test        | `VesselVisitNotification.UpdateListDocks()`    | Verifies that docks can be changed only before submission.                                     | Dock list updated; exception thrown if submitted.             |
| Integration Test | `VesselVisitNotificationController.Update()`   | Sends a PUT request with updated ETA/ETD, Volume, and Manifests.                               | API returns `200 OK` and updated DTO.                         |
| Integration Test | `VesselVisitNotificationController.Submit()`   | Sends a PUT request to `/submit`.                                                              | API returns `200 OK`; database reflects status = `Submitted`. |
| Integration Test | `VesselVisitNotificationController.Withdraw()` | Sends a PUT request to `/withdraw`.                                                            | API returns `200 OK`; status = `Withdrawn`.                   |

All tests were executed using **xUnit** and **EFCore InMemory** for persistence simulation.
Each test also validates the **domain invariants** (no invalid transitions, no updates after submission, and consistent timestamps).

---

## **5. Construction (Implementation)**

This user story was implemented following the layered architecture and DDD principles:

### **Files Created/Updated**

| **Layer**                | **File**                                | **Description**                                                                                     |
| ------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **API**                  | `VesselVisitNotificationController.cs`  | Added endpoints for `PUT /{id}`, `/submit`, and `/withdraw`.                                        |
| **Application**          | `VesselVisitNotificationService.cs`     | Implemented logic to update VVNs, validate status, and handle state transitions.                    |
| **Domain**               | `VesselVisitNotification.cs`            | Added domain methods: `UpdateEstimatedTimeArrival`, `UpdateVolume`, `Submit`, `Withdraw`, `Resume`. |
| **DTOs**                 | `UpdateVesselVisitNotificationDto.cs`   | Defines editable fields that can be updated while the VVN is *InProgress*.                          |
| **Repository Interface** | `IVesselVisitNotificationRepository.cs` | Provides persistence methods used during update operations.                                         |

### **Main Operations Implemented**

```csharp
public async Task<VesselVisitNotificationDto> UpdateAsync(VesselVisitNotificationId id, UpdateVesselVisitNotificationDto dto)
public async Task<VesselVisitNotificationDto> SubmitByIdAsync(VesselVisitNotificationId id)
public async Task<VesselVisitNotificationDto> WithdrawByIdAsync(VesselVisitNotificationId id)
```

These operations enforce:

* Validation of editable status before applying changes.
* Transactional persistence via `UnitOfWork`.
* Domain-controlled transitions to ensure business rule integrity.

---

## **6. Integration and Demo**

**Integration Scenario:**

1. A Shipping Agent Representative updates an existing VVN:

   ```
   PUT /api/VesselVisitNotification/{id}
   ```

   → returns **200 OK** with the updated DTO.

2. Once all data is validated, the agent submits the VVN:

   ```
   PUT /api/VesselVisitNotification/{id}/submit
   ```

   → the system changes status to **Submitted** (read-only).

3. If corrections are required, the agent can withdraw:

   ```
   PUT /api/VesselVisitNotification/{id}/withdraw
   ```

   → status reverts to **Withdrawn**, allowing future resubmission.

**Demo Video Steps (in the Sprint presentation):**

* Step 1: Show existing VVN in *InProgress* status.
* Step 2: Update ETA/ETD and Volume.
* Step 3: Submit VVN → locked for further changes.
* Step 4: Withdraw VVN → editable again.

---

## **7. Observations**

* This user story builds directly upon **US2.2.8 (Create Vessel Visit Notification)**, extending lifecycle control and edit capabilities.
* The **state management** logic (submit, withdraw, resume) ensures data integrity and prevents invalid updates.
* The **update workflow** integrates seamlessly with the cargo and crew manifest creation logic.
* Future improvements:

    * Include **audit logs** to record update timestamps and responsible agents.
    * Extend to allow **resuming withdrawn VVNs** via dedicated endpoint.
    * Consider adding **validation feedback** for complex field mismatches (e.g., ETA before ETD).

