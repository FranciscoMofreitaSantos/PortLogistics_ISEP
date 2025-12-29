## 4. Tests

### 4.1. Test Strategy

* **Unit Tests (Service/Domain):** validate invariants and orchestration without hitting the DB (mock repos/checkers).
* **Integration Tests (API + DB):** validate REST contract, persistence, audit logging, and conflict detection end-to-end.
* **E2E Tests (SPA):** validate edit workflow, required reason, warnings/conflicts display, and successful save.

### 4.2. Unit Test Cases (suggested)

**OperationPlan (domain)**

* **UT01:** `create()` fails when `algorithm` is empty.
* **UT02:** `create()` fails when `operations` is `null/undefined`.
* **UT03:** applying update fails when any operation has `startTime >= endTime`.
* **UT04:** applying update fails when `loadingDuration` or `unloadingDuration` < 0.
* **UT05:** applying update fails when `craneCountUsed < 0`.
* **UT06:** applying update fails when `craneCountUsed > totalCranesOnDock` (if enforced as invariant).
* **UT07:** applying update supports updating only a subset of fields (e.g., crane change without changing time).

**OperationPlanService (application/service)**

* **UT08:** returns 404 when plan not found for `vvnId + planDate`.
* **UT09:** returns 400 when `reasonForChange` missing/empty.
* **UT10:** returns 409 when `ConsistencyChecker` returns blocking conflicts.
* **UT11:** returns 200 with warnings when checker returns warnings only.
* **UT12:** persists plan + writes audit entry on success (save called once + append audit called once).
* **UT13:** concurrency: returns 412 when version/etag mismatch.

### 4.3. Integration Test Cases (API)

* **IT01:** `GET /vvns/{vvnId}/operation-plan?planDate=...` returns 200 with plan dto.
* **IT02:** same GET returns 404 when plan not found.
* **IT03:** `PATCH /vvns/{vvnId}/operation-plan` returns 400 on invalid payload (missing `reasonForChange`, invalid times).
* **IT04:** `PATCH` returns 409 when resource conflict is detected (blocking).
* **IT05:** `PATCH` returns 200 and includes `warnings[]` when non-blocking inconsistencies exist.
* **IT06:** audit endpoint returns entries after an update, containing `changedAt`, `author`, `reason`.

### 4.4. SPA Tests (E2E)

* **E2E01:** user edits an operation and is blocked until “reason for change” is filled.
* **E2E02:** after save, UI shows success and displays warnings if returned.
* **E2E03:** when API returns 409, UI shows conflict panel with details and does not apply changes silently.

---

## 5. Construction (Implementation)

### 5.1. Backend (API + Service + Domain)

**Endpoints (suggested)**

* `GET /api/vvns/{vvnId}/operation-plan?planDate=YYYY-MM-DD`
* `PATCH /api/vvns/{vvnId}/operation-plan`
* `GET /api/vvns/{vvnId}/operation-plan/audit?planDate=YYYY-MM-DD`

**Update DTO (suggested)**

* `status?: string`
* `planDate: Date` (or in query/path if you prefer)
* `operations: OperationPatchDto[]`
* `reasonForChange: string`
* (Optional) `version: number` or use `If-Match` header (ETag)

**Validation & Invariants**

* Syntactic validation in controller: required fields, types, non-empty reason.
* Semantic validation in service/domain:

    * `startTime < endTime`
    * non-negative durations
    * crane capacity constraints
    * staff assignment structure validity

**Consistency Checking (cross-VVN/resources)**

* Implement `OperationPlanConsistencyChecker`:

    * Query overlapping plans by `dock` and time range.
    * Aggregate `craneCountUsed` per dock/time window and compare with capacity.
    * Validate staff overlaps if staff model exists.

**Audit Logging**

* Append-only log entry on success:

    * `planId`, `vvnId`, `changedAt`, `author`, `reasonForChange`, `diffSummary` (or JSON patch)
* Store audit entries in a dedicated collection/table (recommended) to keep history immutable.

### 5.2. Frontend (SPA)

* Plan page supports:

    * load plan by `vvnId` (+ planDate)
    * edit mode with per-operation editable fields
    * mandatory “Reason for change” input
    * submit update → show warnings/conflicts
* Conflict UX:

    * blocking conflicts show modal/panel listing collisions (cranes/staff/time overlaps)
    * warnings appear as non-blocking alerts on successful save

---

## 6. Integration and Demo

### 6.1. Demo Script (suggested)

1. **Open VVN** and load current operation plan for a target day.
2. Enter **edit mode** and change:

    * one operation’s `startTime/endTime`
    * crane assignment (`crane`, `craneCountUsed`)
    * add/update `staffAssignments`
3. Provide **reason for change** and submit.
4. Show **success response** and how **warnings** appear (if applicable).
5. Trigger a **blocking conflict** (e.g., set `craneCountUsed` above capacity or overlap with another VVN) and show:

    * API returns 409
    * UI displays conflict details
6. Open the **audit trail** and show the entry with date/author/reason and change summary.

### 6.2. Evidence

* Screenshots:

    * edit form + reason required validation
    * success with warnings
    * conflict panel (409)
    * audit log list
* Optional: API logs / Postman collection demonstrating requests/responses.

---

## 7. Observations

* Consider adding `operationId` to each operation to support stable updates and cleaner audit diffs.
* Prefer optimistic concurrency (ETag/version) to avoid accidental overwrites in last-minute operations.
* Decide and document a clear policy for conflicts:

    * which conditions are **blocking** (409/412) vs **warnings** (200 + warnings)
* Ensure audit log is immutable and queryable by `vvnId + planDate` (or planId) for traceability.
