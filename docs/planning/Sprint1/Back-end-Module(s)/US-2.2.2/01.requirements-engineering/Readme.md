# US2.2.2 - Register and update Vessel Records

## 1. Requirements Engineering

### 1.1. User Story Description

As a **Port Authority Officer**, I want to **register and update vessel records**, so that **valid vessels can be referenced in visit notifications**.

---

### 1.2. Customer Specifications and Clarifications

**From the specifications document and client meetings:**

* A **vessel record** must include:

    * **IMO number** (unique international vessel identifier).
    * **Vessel name**.
    * **Vessel type** (referencing an existing `VesselType` from US2.2.1).
    * **Operator/owner**.
* The system must **validate the IMO number format**:

    * 7 digits, last digit is a **check digit**.
    * Invalid format → request rejected.
* Vessel records must be **searchable** by IMO number, name, or operator.
* Records can be **updated** (e.g., operator change, vessel renamed).

**From forum:**

> **Question:** Can a vessel record be deleted?
> **Answer:** Not in this sprint. Only updates are allowed. Future extension might allow soft-delete or status flag.

---

### 1.3. Acceptance Criteria

* **AC01:** A vessel must not be registered without a valid **IMO number**.
* **AC02:** The system rejects registration if IMO number is invalid (not 7 digits / wrong check digit).
* **AC03:** Vessel must be associated with an existing **VesselType** (US2.2.1).
* **AC04:** A vessel can be searched by **IMO number, vessel name, or operator**.
* **AC05:** Updates are allowed on **name** and **operator/owner** but not on IMO number.
* **AC06:** Vessel records persist in repository and are accessible for use in **visit notifications** (US2.2.7).

---

### 1.4. Found out Dependencies

* Depends on **US2.2.1**: `VesselType` must exist before creating a vessel.
* Provides input to **US2.2.7** (visit notifications must reference a registered vessel).

---

### 1.5. Input and Output Data

**Input Data:**

* IMO number (string, 7 chars, with check digit).
* Vessel name (string).
* Vessel type ID (UUID).
* Operator/Owner (string).

**Output Data:**

* Confirmation of vessel registration/update.
* Error messages when validation fails (e.g., invalid IMO number).
* Search results (list of vessels with attributes).

---

### 1.6. System Sequence Diagram (SSD)
