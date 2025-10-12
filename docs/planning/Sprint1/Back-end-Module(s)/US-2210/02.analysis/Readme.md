# **US2.2.10 – View Vessel Visit Notification Status**

## **2. Analysis**

---

### **2.1. Relevant Domain Model Excerpt**

![DM](./svg/LAPR5_project.svg)

#### **Explanation**

* Each **VesselVisitNotification (VVN)** is associated with a specific **ShippingAgentRepresentative** who submitted it.
* Each **representative** belongs to a **ShippingAgentOrganization**, meaning that VVNs can also be viewed by other representatives from the same organization.
* The **status** and **assigned dock** are the most relevant attributes for the shipping agent to monitor the progress of each visit.
* This user story focuses on querying and filtering existing VVNs rather than modifying them.

---

### **2.2. Other Remarks**

* This functionality relies on **query operations** through the `VesselVisitNotificationRepository`.
* The repository should expose a method such as:

  ```csharp
  Task<IEnumerable<VesselVisitNotification>> FindByFiltersAsync(
      string? vesselImo,
      VvnStatus? status,
      string? representative,
      DateTime? from,
      DateTime? to,
      Guid organizationId);
  ```
* Data visibility is **restricted by organization**, ensuring that a user can only access VVNs submitted by representatives of the same shipping company.
* The **VesselVisitNotificationService** is responsible for fetching and converting the data into `VesselVisitNotificationDto` objects before returning it to the API layer.
* This is a **read-only** use case — it does not modify the domain state.
* Possible future enhancements include **server-side pagination**, **sorting**, and **caching** to improve performance for large data sets.
* The REST API will expose endpoints such as:

  ```
  GET /api/vvn
  GET /api/vvn?status=Accepted
  GET /api/vvn?vessel=IMO1234567
  GET /api/vvn?from=2025-01-01&to=2025-12-31
  ```