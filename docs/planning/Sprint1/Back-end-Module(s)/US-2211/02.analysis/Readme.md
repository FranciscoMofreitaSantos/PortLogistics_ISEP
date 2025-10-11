# US2.2.11 - Register and manage operating staff members

## 2. Analysis

### 2.1. Relevant Domain Model Excerpt

![Domain Model](domain-model.png)

The domain model shows the main entities and relationships for managing operating staff members.
- **StaffMember**: Has fields for ID, short name, email, phone number, schedule, and status. Each staff member can participate in multiple tasks.
- **Task**: Tasks are assigned to one physical resource and one staff member and have their own ID, start/end times, description, status, and type.
- **PhysicalResource**: Represents the resource for a task, linked by ID, alpha code, schedule, operational capacity, description, setup time, status, and type.
- **Qualification**: Staff members and physical resources are linked to qualifications. Each qualification aggregates multiple staff members or resources by code and name.

Relationships:
- Each **Task** is associated with zero, one or several PhysicalResources and/or one StaffMembers
- StaffMember and PhysicalResource can each have zero or more Qualifications.
- Qualifications form a different aggregate, grouping together qualified entities.
- The model supports filtering staff by schedule, status, and qualifications, which are required for US2.2.11.

---

### 2.2. Other Remarks

- Data integrity and domain constraints must ensure each staff member is uniquely identified and properly qualified before assignment to any tasks.
- Changes to staff status (available/unavailable) and schedule will impact task assignment logic.
- Qualification aggregates support business rules enforcing only qualified staff/resource assignment during scheduling.
- Status and schedule properties allow dynamic availability management per operational needs.
