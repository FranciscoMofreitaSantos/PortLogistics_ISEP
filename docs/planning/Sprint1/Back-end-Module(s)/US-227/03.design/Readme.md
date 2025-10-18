# US2.2.7 – Review Pending Vessel Visit Notifications

## 03.Design

### Overview

This section details the program flow for US 2.2.7, focusing on the acceptance and task creation logic when a Port Authority Officer approves a Vessel Visit Notification (VVN). The diagram below represents the interactions between application components and the main entities involved in the operation.

### Sequence and Component Diagram
![Sequence Diagram ](docs/planning/Sprint1/Back-end-Module(s)/US-227/03.design/svg/us2.2.7-sequence.diagram.svg)


### Flow Explanation

- **Request Initiation**: The Port Authority Officer sends a request to accept a specific VVN through the REST API controller.
- **Service Layer Processing**: The controller delegates to the VesselVisitNotificationService, which retrieves the full notification data from the repository.
- **Dock Assignment**: The service requests dock assignment via the dock repository, ensuring the vessel is allocated to the correct berth.
- **VVN Status Update**: The aggregate VVN is updated to reflect acceptance and the dock assignment.
- **Task Generation**:
    - If unloading cargo manifests are attached to the VVN, the service generates unloading tasks related to the assigned dock and saves them through the task repository.
    - Similarly, if loading cargo manifests exist, loading tasks are generated and persisted.
- **Persistence**: All state changes and new tasks are committed in a unit-of-work transaction.
- **Result Mapping**: The service factory maps the updated aggregated VVN and associated entities to a DTO, which is returned through the controller to the officer.
- **Final Response**: The officer receives a success response with the details of the accepted vessel visit and generated tasks.

This design ensures domain rules are enforced, tasks and dock assignment are correctly managed, and all relevant changes are recorded atomically for traceability and operational control.

