# Plano de Testes – StorageArea, Container, VesselType, Vessel e VVN
*(SEM5_PI_WEBAPI.Tests)*

Este documento descreve, para os módulos:

- `StorageArea`
- `Container`
- `VesselType`
- `Vessel`
- `VesselVisitNotification (VVN)`

que tipos de testes existem (ou são previstos), qual é o **SUT (System Under Test)** em cada caso,  
e que nível de “caixa preta” está a ser considerado:

- **Testes de domínio** (regras de negócio, quase white-box mas focados na API pública);
- **Caixa preta de classe** (Service, Controller, etc.);
- **Caixa preta de aplicação** (WebAPI completa via `HttpClient` + `WebApplicationFactory` ou controller+service reais com repositórios mockados).

---

## 1. Visão geral

Tecnologias usadas:

- `xUnit` – framework de testes;
- `Moq` – criação de mocks para repositórios, serviços, `IUnitOfWork`, `ILogger`, etc.;
- `Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory` – para arrancar a WebAPI em memória e testar via `HttpClient`;
- `EF Core InMemory` – base de dados em memória, isolada por teste de sistema.

Objetivo geral:

- Validar que:
    - as **entidades/agregados** (Domain),
    - os **serviços de aplicação** (Services),
    - os **controladores** (Controllers),
    - e a **API HTTP** como um todo (System / WebAPI)

se comportam corretamente em cenários de sucesso e erro (dados inválidos, duplicados, não encontrado, etc.).

---

## 2. StorageArea

### 2.1 Testes de Domínio – `StorageArea`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Domain/StorageAreaTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.StorageAreas.StorageArea`  
**Tipo:** Testes de domínio / unidade  
**Nível:** Caixa preta de classe de domínio (foco em invariantes e regras internas)

Principais cenários:

- Construção válida:
    - `CreateStorageArea_ValidData_ShouldInitializeCorrectly`
- Validação de nome:
    - `CreateStorageArea_EmptyName_ShouldThrowException`
    - `CreateStorageArea_NameTooShort_ShouldThrowException`
- Validação de descrição:
    - `CreateStorageArea_NullDescription_ShouldUseDefault`
    - `CreateStorageArea_TooLongDescription_ShouldThrowException`
- Gestão de contentores:
    - `PlaceContainer_ValidSlot_ShouldIncreaseCapacity`
    - `PlaceContainer_DuplicateSlot_ShouldThrowException`
    - `PlaceContainer_OutsideBounds_ShouldThrowException`
    - `RemoveContainer_ValidSlot_ShouldDecreaseCapacity_AndRemoveSlotIfEmpty`
    - `RemoveContainer_EmptySlot_ShouldThrowException`
    - `FindContainer_WhenNotPresent_ShouldReturnNull`
    - `FindContainer_InvalidBounds_ShouldThrow`
- Docks:
    - `AssignDock_NewDock_ShouldAddDistance`
    - `AssignDock_DuplicateDock_ShouldThrowException`
- Physical Resources:
    - `AddPhysicalResources_NewResources_ShouldIncreaseList`
    - `RemovePhysicalResources_Existing_ShouldRemoveCorrectly`
    - `RemovePhysicalResources_NotExisting_ShouldDoNothing`
- Atualizações:
    - `ChangeDescription_Valid_ShouldUpdate`
    - `ChangeDescription_TooLong_ShouldThrowException`
    - `ChangeMaxBoundaries_Invalid_ShouldThrow`
    - `ChangeMaxBoundaries_Valid_ShouldUpdate`

> Aqui o SUT é apenas a classe de domínio `StorageArea`, sem repositórios ou EF.  
> São testes de regras de negócio e integridade interna do agregado.

---

### 2.2 Testes de Serviço – `StorageAreaService`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Services/StorageAreaServiceTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.StorageAreas.StorageAreaService`  
**Dependências mockadas:** `IStorageAreaRepository`, `IPhysicalResourceRepository`, `IDockRepository`, `IContainerRepository`, `IUnitOfWork`, `ILogger<StorageAreaService>`  
**Tipo:** Testes de unidade de serviço  
**Nível:** Caixa preta de classe (service)

Principais cenários:

- Criação:
    - `CreateAsync_ShouldCreateStorageArea_WhenValid`
    - `CreateAsync_ShouldThrow_WhenNameAlreadyExists`
    - `CreateAsync_ShouldThrow_WhenDockDoesNotExist`
    - `CreateAsync_ShouldThrow_WhenPhysicalResourceDoesNotExist`
- Consultas:
    - `GetAllAsync_ShouldReturnList_WhenExists`
    - `GetByIdAsync_ShouldReturn_WhenExists`
    - `GetByIdAsync_ShouldThrow_WhenNotFound`
    - `GetByNameAsync_ShouldReturn_WhenExists`
    - `GetByNameAsync_ShouldThrow_WhenNotFound`
- Distâncias a docks:
    - `GetDistancesToDockAsync_ShouldReturnDistances_WhenValid`
- Physical Resources:
    - `GetPhysicalResourcesAsync_ShouldReturnResources_WhenValid`
    - `GetPhysicalResourcesAsync_ShouldThrow_WhenStorageAreaNotFound`
- Grid e contentores:
    - `GetGridAsync_ReturnsSlots_ForPlacedContainer`
    - `GetContainerAsync_ShouldThrow_WhenStorageAreaNotFound`
    - `GetContainerAsync_ShouldThrow_WhenSlotEmpty`
    - `GetContainerAsync_ShouldThrow_WhenContainerNotFoundInDb`

> O serviço é tratado como caixa preta: invocamos métodos públicos e validamos resultados ou exceções, com todas as dependências mockadas.

---

### 2.3 Testes de Controller – `StorageAreasController`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Controllers/StorageAreasControllerTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Controllers.StorageAreasController`  
**Dependências mockadas:** `IStorageAreaService`, `ILogger<StorageAreasController>`, `IResponsesToFrontend`  
**Tipo:** Testes de unidade de controller  
**Nível:** Caixa preta de classe (API/controller)

Endpoints cobertos:

- `GET /api/storageareas`
- `GET /api/storageareas/id/{id}`
- `GET /api/storageareas/name/{name}`
- `GET /api/storageareas/distances`
- `GET /api/storageareas/physicalresources`
- `POST /api/storageareas`
- `GET /api/storageareas/{id}/grid`
- `GET /api/storageareas/{id}/container`

Cenários testados:

- 200 OK com lista ou DTO.
- 404 NotFound quando o serviço lança `BusinessRuleValidationException` por ausência.
- 400 BadRequest quando o serviço lança `BusinessRuleValidationException` de validação de negócio.
- Verificação de tipos de `ActionResult` (`OkObjectResult`, `ObjectResult` com `StatusCode`, `CreatedAtRouteResult`).

---

### 2.4 Testes de Integração (Controller + Service) – StorageArea

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Integration/StorageAreasControllerServiceTests.cs`  
**SUT:** `StorageAreasController` + `StorageAreaService`  
**Dependências mockadas:** Repositórios, `IUnitOfWork`, loggers, `IResponsesToFrontend`  
**Tipo:** Integração leve  
**Nível:** Caixa preta de classe composta

Cenários equivalentes aos do controller, mas:

- O controller chama o serviço real;
- O serviço aplica as regras de negócio sobre repositórios mockados.

---

### 2.5 Testes de Sistema – `StorageAreasSystemTests`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.SystemTests/StorageAreasSystemTests.cs`  
**SUT:** WebAPI completa (toda a aplicação, via `CustomWebApplicationFactory`)  
**Tipo:** Testes de sistema / caixa preta de aplicação

Utilização de:

- `CustomWebApplicationFactory` para configurar a aplicação com EF InMemory;
- `HttpClient` para fazer chamadas HTTP reais (`GET`, `POST`).

Cenários principais:

- `GetAll_ShouldReturnOk_AndList`
- `Create_ShouldReturnCreated_AndThenGetById_ShouldReturnOk`
- `GetById_ShouldReturnNotFound_ForRandomId`
- `GetByName_ShouldReturnOk_ForExistingCreatedArea`
- `GetByName_ShouldReturnNotFound_ForUnknown`
- `Create_ShouldReturnBadRequest_WhenNameTooShort`
- `GetDistances_ByName_ShouldReturnOk`
- `GetPhysicalResources_ByName_ShouldReturnOk`
- `GetGrid_ShouldReturnOk_AndRespectDimensions`
- `GetGrid_ShouldReturnNotFound_ForRandomId`
- `GetContainerInPosition_ShouldReturnNotFound_ForEmptySlot`

> Aqui o SUT é a WebAPI inteira: middleware, controllers, serviços, repositórios, EF InMemory, etc.  
> Não há mocks, apenas a aplicação em execução em memória.

---

## 3. Container

### 3.1 Testes de Domínio – `Container`

**Ficheiro (típico):** `SEM5_PI_WEBAPI.Tests.Domain/ContainerTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.Containers.EntityContainer` + `Iso6346Code`  
**Tipo:** Testes de domínio / unidade  
**Nível:** Caixa preta de classe de domínio

Cenários típicos:

- Construção de `Iso6346Code` com:
    - formato válido (4 letras + 7 dígitos);
    - formato inválido (letras a menos, dígitos a menos, caracteres inválidos) → exceção.
- Construção de `EntityContainer` com dados válidos (ISO, tipo, peso, etc.).
- Regras de negócio:
    - bloqueio de estados inválidos (se houver enum de estado);
    - associação a uma `StorageArea` e posição, se a lógica estiver no agregado.

---

### 3.2 Testes de Serviço – `ContainerService`

**Ficheiro (típico):** `SEM5_PI_WEBAPI.Tests.Services/ContainerServiceTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.Containers.ContainerService`  
**Dependências mockadas:** `IContainerRepository`, `IUnitOfWork`, eventualmente `IStorageAreaRepository`, `ILogger<ContainerService>`  
**Tipo:** Testes de unidade de serviço  
**Nível:** Caixa preta de classe

Cenários típicos:

- `CreateAsync`:
    - cria contentor com ISO válido;
    - falha se ISO já existir (duplicado);
    - falha se ISO inválido.
- `GetByIsoAsync`:
    - devolve DTO quando existe;
    - lança exceção de negócio quando não existe.
- Operações complementares:
    - marcações de estado (por exemplo “damaged”, “blocked”) se existirem;
    - validação de movimentos (load/unload) face a StorageArea/Manifest (se estiver neste serviço).

---

### 3.3 Testes de Controller – `ContainersController`

**Ficheiro (típico):** `SEM5_PI_WEBAPI.Tests.Controllers/ContainersControllerTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Controllers.ContainersController`  
**Dependências mockadas:** `IContainerService`, `ILogger<ContainersController>`, `IResponsesToFrontend`  
**Tipo:** Testes de unidade de controller  
**Nível:** Caixa preta de classe

Cenários típicos:

- `POST /api/containers`:
    - devolve `Created` com DTO;
    - devolve `BadRequest` com `ProblemDetails` quando o serviço lança exceção de validação.
- `GET /api/containers/{iso}`:
    - devolve `Ok` com DTO quando o contentor existe;
    - devolve `NotFound` com `ProblemDetails` quando não existe.
- Filtros e listagens (por estado, tipo, etc.), se implementados.

---

### 3.4 Testes de Sistema – `ContainerSystemTests`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.SystemTests/ContainerSystemTests.cs`  
**SUT:** WebAPI completa (via `CustomWebApplicationFactory`)  
**Tipo:** Caixa preta de aplicação

Cenários típicos:

- Criação de container via `POST /api/containers` com JSON:
    - sucesso e falhas de validação.
- Consulta por ISO via `GET /api/containers/{iso}`:
    - sucesso / not found.
- Integração com outros módulos:
    - por exemplo, verificação de grid ou storage quando o container é associado a uma StorageArea (se for exposto via API).

---

## 4. VesselType

### 4.1 Testes de Domínio – `VesselType`

**Ficheiro (típico):** `SEM5_PI_WEBAPI.Tests.Domain/VesselTypeTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.VesselsTypes.VesselType`  
**Tipo:** Testes de domínio / unidade  
**Nível:** Caixa preta de classe de domínio

Cenários típicos:

- Construção de `VesselType` com dados válidos:
    - nome, descrição, comprimento, boca, calado máximo, capacidade TEU, etc.
- Validações:
    - nome obrigatório e com tamanho mínimo;
    - dimensões > 0;
    - capacidade TEU ≥ 0.
- Atualizações:
    - alteração de descrição;
    - ajustes de limites, se permitido pelo domínio.

---

### 4.2 Testes de Serviço – `VesselTypeService`

**Ficheiro (típico):** `SEM5_PI_WEBAPI.Tests.Services/VesselTypeServiceTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.VesselsTypes.VesselTypeService`  
**Dependências mockadas:** `IVesselTypeRepository`, `IUnitOfWork`, `ILogger<VesselTypeService>`  
**Tipo:** Testes de unidade de serviço  
**Nível:** Caixa preta de classe

Cenários típicos:

- `CreateAsync`:
    - cria um `VesselType` quando o nome é único;
    - lança exceção quando o nome já existe;
    - lança exceção quando as dimensões ou parâmetros são inválidos.
- `GetAllAsync`, `GetByIdAsync`, `GetByNameAsync`:
    - devolvem DTOs quando existe;
    - lançam exceção de negócio quando não é encontrado.

---

### 4.3 Testes de Controller – `VesselTypeController`

**Ficheiro (típico):** `SEM5_PI_WEBAPI.Tests.Controllers/VesselTypeControllerTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Controllers.VesselTypeController`  
**Dependências mockadas:** `IVesselTypeService`, `ILogger<VesselTypeController>`, `IResponsesToFrontend`  
**Tipo:** Testes de unidade de controller  
**Nível:** Caixa preta de classe

Cenários:

- `GET /api/vesseltype`:
    - 200 OK e lista de tipos;
    - 404 NotFound se o serviço lançar exceção por não existirem tipos.
- `GET /api/vesseltype/id/{id}`:
    - 200 OK com DTO;
    - 404 NotFound se não existir.
- `POST /api/vesseltype`:
    - 201 Created em caso de sucesso;
    - 400 BadRequest quando as regras de negócio falham (dimensões inválidas, nome duplicado, etc.).

---

### 4.4 Testes de Sistema – `VesselTypeSystemTests`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.SystemTests/VesselTypeSystemTests.cs`  
**SUT:** WebAPI completa  
**Tipo:** Caixa preta de aplicação

Cenários:

- `GetAll_ShouldReturnOkAndList_FromRealSystem`:
    - valida a lista inicial de `VesselType` (seed).
- `Create_Then_GetById_ShouldWork_ThroughHttp`:
    - `POST /api/vesseltype` seguido de `GET /api/vesseltype/id/{id}`.
- `Create_ShouldReturnBadRequest_WhenDomainValidationFails`:
    - por exemplo, descrição inválida ou dimensões negativas.

---

## 5. Vessel

### 5.1 Testes de Domínio – `Vessel`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Domain/VesselTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.Vessels.Vessel`  
**Tipo:** Testes de domínio / unidade  
**Nível:** Caixa preta de classe de domínio

Cenários já definidos:

- Construção válida:
    - `CreateVessel_WithValidData_ShouldInitializeCorrectly`
- Validação de `Name`:
    - `CreateVessel_WithInvalidName_ShouldThrow`
    - `CreateVessel_WithTooShortName_ShouldThrow`
- Validação de `Owner`:
    - `CreateVessel_WithInvalidOwner_ShouldThrow`
    - `CreateVessel_WithTooShortOwner_ShouldThrow`
- Validação de `VesselTypeId`:
    - `CreateVessel_WithEmptyVesselTypeId_ShouldThrow`
- Atualizações:
    - `UpdateName_WithValidName_ShouldChangeName`
    - `UpdateName_WithInvalidName_ShouldThrow`
    - `UpdateOwner_WithValidOwner_ShouldChangeOwner`
    - `UpdateOwner_WithInvalidOwner_ShouldThrow`
- Igualdade/hash:
    - `Equals_ShouldReturnTrue_ForSameIdAndImo`
    - `GetHashCode_ShouldBeBasedOnId`

---

### 5.2 Testes de Serviço – `VesselService`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Services/VesselServiceTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.Vessels.VesselService`  
**Dependências mockadas:** `IVesselRepository`, `IVesselTypeRepository`, `IUnitOfWork`, `ILogger<VesselService>`  
**Tipo:** Testes de unidade de serviço  
**Nível:** Caixa preta de classe

Cenários:

- `CreateAsync_ShouldCreateVessel_WhenValidData`
    - garante criação quando IMO é único e `VesselType` existe.
- `CreateAsync_ShouldThrow_WhenImoAlreadyExists`
- `CreateAsync_ShouldThrow_WhenVesselTypeDoesNotExist`
- `GetByImoNumberAsync_ShouldReturnVessel_WhenExists`
- `GetByImoNumberAsync_ShouldThrow_WhenNotFound`
- `PatchByImoAsync_ShouldUpdateFields_WhenVesselExists`
- `PatchByImoAsync_ShouldThrow_WhenVesselNotFound`
- `GetAllAsync_ShouldReturnAll_WhenExist`

---

### 5.3 Testes de Controller – `VesselController`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Controllers/VesselControllerTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Controllers.VesselController`  
**Dependências mockadas:** `IVesselService`, `ILogger<VesselController>`, `IResponsesToFrontend`  
**Tipo:** Testes de unidade de controller  
**Nível:** Caixa preta de classe

Cenários:

- `GetAllAsync_ShouldReturnOk_WhenVesselsExist`
- `GetAllAsync_ShouldReturnNotFound_WhenNoVessels`
- `GetById_ShouldReturnOk_WhenFound`
- `GetById_ShouldReturnNotFound_WhenMissing`
- `CreateAsync_ShouldReturnCreated_WhenValid`
- `CreateAsync_ShouldReturnBadRequest_WhenBusinessError`
- `GetByImoAsync`, `GetByNameAsync`, `GetByOwnerAsync`:
    - casos de sucesso e not found.
- `GetByFilterAsync`:
    - resultados com filtro, lista vazia, etc.
- `PatchByImoAsync`:
    - Ok quando atualizado;
    - BadRequest quando DTO é nulo ou quando ocorre exceção de negócio.

---

### 5.4 Testes de Integração – Serviço + Controller

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Integration/VesselServiceControllerTests.cs`  
**SUT:** `VesselService` + `VesselController`  
**Dependências mockadas:** Repositórios, `IUnitOfWork`, loggers, `IResponsesToFrontend`  
**Tipo:** Integração leve  
**Nível:** Caixa preta de classe composta

Valida que:

- o controller usa o serviço correto;
- exceções do serviço são corretamente convertidas em respostas HTTP.

---

### 5.5 Testes de Sistema – `VesselSystemTests`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.SystemTests/VesselSystemTests.cs`  
**SUT:** WebAPI completa (via `CustomWebApplicationFactory`)  
**Tipo:** Caixa preta de aplicação

Cenários típicos:

- `GET /api/vessel`:
    - 200 OK com lista (pode depender de seed);
- `GET /api/vessel/id/{id}`:
    - 200 OK quando existe;
    - 404 NotFound para `Guid` aleatório.
- `GET /api/vessel/imo/{imo}`:
    - sucesso para navio criado;
    - 404 NotFound para IMO não existente.
- `POST /api/vessel`:
    - 201 Created para dados válidos (com `VesselType` existente);
    - 400 BadRequest quando o IMO está duplicado;
    - 400 BadRequest quando o `VesselType` não existe ou dados inválidos.
- `PATCH /api/vessel/imo/{imo}`:
    - 200 OK quando é possível atualizar;
    - 400/404 quando não existe ou dados são inválidos.
- `GET /api/vessel/name/{name}`, `owner/{owner}`, `filter`:
    - filtros aplicados corretamente, inclusive cenários sem resultados.

---

## 6. VVN – Vessel Visit Notification

### 6.1 Testes de Domínio – `VesselVisitNotification`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Domain/VesselVisitNotificationTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.VVN.VesselVisitNotification`  
**Tipo:** Testes de domínio / unidade  
**Nível:** Caixa preta de classe de domínio

Principais cenários:

- Criação:
    - `Create_WithValidData_ShouldInitializeCorrectly`
        - Estado inicial `InProgress`, `IsEditable == true`, código formatado (`2025-THPA-000001`), volume correto, `Documents` não nulo.
    - `Create_WithInvalidVolume_ShouldThrow`
    - `Create_WithInvalidETAandETD_ShouldThrow` (ETA > ETD)
    - `Create_WithNullDocuments_ShouldCreateEmptyCollection`

- Ciclo de vida:
    - `Submit_ShouldChangeStatusToSubmitted`
    - `Submit_Twice_ShouldThrow`
    - `MarkPending_ShouldChangeStatusAndStayEditable`
    - `MarkPending_WhenNotSubmitted_ShouldThrow`
    - `Withdraw_ShouldSetStatusToWithdrawn`
    - `Withdraw_WhenAccepted_ShouldThrow`
    - `Resume_ShouldReopenWithdrawnVVN`
    - `Resume_WhenNotWithdrawn_ShouldThrow`
    - `Accept_ShouldChangeStatusToAccepted`
    - `Accept_WhenNotSubmitted_ShouldThrow`
    - `FullLifecycle_ShouldFollowValidFlow`  
      (`InProgress -> Submitted -> PendingInformation -> Withdrawn -> InProgress -> Submitted -> Accepted`)

- Atualizações:
    - `UpdateMethods_ShouldModifyValues_WhenEditable`  
      (ETA, ETD, Volume, ImoNumber, DockCode, etc.)
    - `UpdateVolume_WithNegative_ShouldThrow`
    - `Update_WhenNotEditable_ShouldThrow`

- Manifests e Tasks:
    - `UpdateCrewAndCargo_ShouldSetManifests_WhenEditable`
    - `SetTasks_ShouldAssignListProperly`

- Outros:
    - `ToString_ShouldContainReadableInfo`
    - `Equals_ShouldReturnTrue_WhenCodesMatch`
    - `Equals_ShouldReturnFalse_WhenCodesDiffer`
    - `IsEditable_ShouldBeFalse_WhenAccepted`
    - `IsEditable_ShouldBeTrue_WhenPendingInformation`

> Estes testes garantem as regras de negócio centrais da VVN: estados permitidos, transições, possibilidade de edição e invariantes de dados.

---

### 6.2 Testes de Serviço – `VesselVisitNotificationService`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Services/VesselVisitNotificationServiceTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Domain.VVN.VesselVisitNotificationService`  
**Dependências mockadas:**  
`IVesselVisitNotificationRepository`, `IVesselRepository`, `ICargoManifestRepository`,  
`ICargoManifestEntryRepository`, `ICrewManifestRepository`, `ICrewMemberRepository`,  
`IStorageAreaRepository`, `IContainerRepository`, `IShippingAgentRepresentativeRepository`,  
`IShippingAgentOrganizationRepository`, `IDockRepository`, `ITaskRepository`,  
`IUnitOfWork`, `ILogger<VesselVisitNotificationService>`  
**Tipo:** Testes de unidade de serviço  
**Nível:** Caixa preta de classe

Cenários principais:

- Criação:
    - `AddAsync_ShouldCreate_WhenValid`
        - SAR existe e está `activated`; Vessel existe; sem conflitos → cria VVN.
    - `AddAsync_ShouldThrow_WhenVesselNotFound`

- Aceitação:
    - `AcceptVvnAsync_ShouldThrow_WhenNoDockAvailable`
        - Garante que não é possível aceitar uma VVN sem dock compatível para o tipo de navio.

- Atualização:
    - `UpdateAsync_ShouldUpdate_WhenEditable`
    - `UpdateAsync_ShouldThrow_WhenAlreadySubmitted`

- Submissão:
    - `SubmitByCodeAsync_ShouldSubmit_WhenValid`
    - `SubmitByCodeAsync_ShouldThrow_WhenNotFound`
    - `SubmitByIdAsync_ShouldSubmit_WhenValid`
    - `SubmitByIdAsync_ShouldThrow_WhenNotFound`

- Withdraw:
    - `WithdrawByIdAsync_ShouldWithdraw_WhenExists`
    - `WithdrawByIdAsync_ShouldThrow_WhenNotFound`
    - `WithdrawByCodeAsync_ShouldWithdraw_WhenExists`
    - `WithdrawByCodeAsync_ShouldThrow_WhenNotFound`

- Pending:
    - `MarkAsPendingAsync_ShouldThrow_WhenCodeNotFound`

- Filtros por SAR:
    - `GetInProgressPending_BySAR_ShouldReturnEmpty_WhenNone`
        - Testa cenário em que, para determinado SAR/SAO, não há VVNs em `InProgress`/`PendingInformation`.

---

### 6.3 Testes de Controller – `VesselVisitNotificationController`

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.Controllers/VesselVisitNotificationControllerTests.cs`  
**SUT:** `SEM5_PI_WEBAPI.Controllers.VesselVisitNotificationController`  
**Dependências mockadas:** `IVesselVisitNotificationService`, `ILogger<VesselVisitNotificationController>`, `IResponsesToFrontend`  
**Tipo:** Testes de unidade de controller  
**Nível:** Caixa preta de classe

Cenários principais (exemplos):

- Criação:
    - `CreateAsync_ShouldReturnOk_WhenValid`
    - `CreateAsync_ShouldReturnBadRequest_WhenInvalid` (ex.: ETA/ETD inválidos)

- GetById:
    - `GetById_ShouldReturnOk_WhenExists`
    - `GetById_ShouldReturnNotFound_WhenNotExists`

- Withdraw:
    - `WithdrawById_ShouldReturnOk_WhenSuccess`
    - `WithdrawById_ShouldReturnBadRequest_WhenRuleFails`
    - `WithdrawById_ShouldReturnServerError_WhenUnexpected`
    - `WithdrawByCode_ShouldReturnOk_WhenSuccess`
    - `WithdrawByCode_ShouldReturnBadRequest_WhenInvalid`  
      (inclui verificação de mensagem de formato inválido do código)
    - `WithdrawByCode_ShouldReturnServerError_WhenUnexpected`

- Submit:
    - `SubmitByCode_ShouldReturnOk_WhenSuccess`
    - `SubmitById_ShouldReturnOk_WhenSuccess`
    - `SubmitById_ShouldReturnBadRequest_WhenInvalid`

- Update:
    - `UpdateAsync_ShouldReturnOk_WhenValid`
    - `UpdateAsync_ShouldReturnBadRequest_WhenRuleFails`
    - `UpdateAsync_ShouldReturnServerError_WhenUnexpected`

- Accept / Reject:
    - `AcceptVvn_ShouldReturnOk_WhenSuccess`
    - `AcceptVvn_ShouldReturnBadRequest_WhenInvalid`
    - `AcceptVvn_ShouldReturnServerError_WhenUnexpected`
    - `RejectVvn_ShouldReturnOk_WhenSuccess`
    - `RejectVvn_ShouldReturnBadRequest_WhenInvalid`

- Listagens por SAR:
    - `GetInProgressOrPending_ShouldReturnOk_WhenSuccess`
    - `GetInProgressOrPending_ShouldReturnNotFound_WhenRuleFails`
    - `GetWithdrawn_ShouldReturnOk_WhenSuccess`
    - `GetSubmitted_ShouldReturnOk_WhenSuccess`
    - `GetAccepted_ShouldReturnOk_WhenSuccess`

- Listagens (ADMIN – all):
    - `GetAllInProgressPending_ShouldReturnOk_WhenSuccess`
    - `GetAllWithdrawn_ShouldReturnOk_WhenSuccess`
    - `GetAllSubmitted_ShouldReturnOk_WhenSuccess`
    - `GetAllAccepted_ShouldReturnOk_WhenSuccess`

> Tal como nos outros controllers, o foco está no mapeamento **Service → HTTP**:
> - Sucesso → `Ok` / `Created`
> - `BusinessRuleValidationException` → `400/404`
> - Exceções genéricas → `500` (ou `400` conforme a estratégia de `ProblemResponse`).

---

### 6.4 Testes de Integração / Caixa Preta de Aplicação – VVN

**Ficheiro:** `SEM5_PI_WEBAPI.Tests.SystemTests/VesselVisitNotificationControllerServiceTests.cs`  
**Namespace:** `SEM5_PI_WEBAPI.Tests.SystemTests`  
**SUT:** `VesselVisitNotificationController` + `VesselVisitNotificationService`  
**Dependências mockadas:** Todos os repositórios + `IUnitOfWork`, `ILogger`, `IResponsesToFrontend`  
**Tipo:** Integração / black-box de aplicação  
**Nível:** Caixa preta de classe composta (controller + service reais; repositórios mockados)

Cenários principais:

- CRUD base:
    - `Create_ShouldReturnOk_WhenValid`
    - `Create_ShouldReturnBadRequest_WhenInvalidImo`
    - `GetById_ShouldReturnOk_WhenExists`
    - `GetById_ShouldReturnNotFound_WhenNotExists`
    - `Update_ShouldReturnOk_WhenEditable`
    - `Update_ShouldReturnBadRequest_WhenNotEditable`

- Regras de negócio específicas:
    - `Create_ShouldReturnBadRequest_WhenEtaIsAfterEtd`
    - `SubmitById_ShouldReturnOk_AndChangeStatusToSubmitted`
    - `SubmitById_ShouldReturnBadRequest_WhenAlreadySubmitted`
    - `WithdrawByCode_ShouldReturnOk_WhenFromInProgress`
    - `WithdrawByCode_ShouldReturnBadRequest_WhenStatusNotInProgressOrPending`

- Filtros (ADMIN):
    - `GetInProgressPendingInformationVvnsByFilters_ShouldFilterByImoAndEta`
    - `GetAllAcceptedAsync_ShouldReturnOnlyAcceptedVvns`

> Estes testes exercitam o **fluxo completo da aplicação para VVN**, do controller até ao domínio, com os repositórios simulados.  
> Podem ser encarados como os testes **“black-box de aplicação”** para a funcionalidade VVN.

*(Neste momento não existe ainda um `VesselVisitNotificationSystemTests` com `HttpClient` e `WebApplicationFactory`. Se for criado, entra na coluna de “Sistema / WebAPI” na síntese.)*

---

## 7. Síntese por módulo e nível

| Módulo       | Domínio (Entidade)                          | Serviço (Service)                               | Controller                                           | Integração (Service+Controller)                          | Sistema / WebAPI (HTTP)                          |
|--------------|----------------------------------------------|-------------------------------------------------|------------------------------------------------------|---------------------------------------------------------|---------------------------------------------------|
| StorageArea  | `StorageAreaTests`                           | `StorageAreaServiceTests`                       | `StorageAreasControllerTests`                        | `StorageAreasControllerServiceTests`                    | `StorageAreasSystemTests`                         |
| Container    | `ContainerTests`                             | `ContainerServiceTests`                         | `ContainersControllerTests`                          | `ContainerServiceControllerTests`        | `ContainerSystemTests`                            |
| VesselType   | `VesselTypeTests`                            | `VesselTypeServiceTests`                        | `VesselTypeControllerTests`                          |`VesselTypeServiceControllerTests`            | `VesselTypeSystemTests`                           |
| Vessel       | `VesselTests`                                | `VesselServiceTests`                            | `VesselControllerTests`                              | `VesselServiceControllerTests`                          | `VesselSystemTests`                               |
| VVN          | `VesselVisitNotificationTests`               | `VesselVisitNotificationServiceTests`           | `VesselVisitNotificationControllerTests`             | `VesselVisitNotificationControllerServiceTests`         | `VesselVisitNotificationSystemTests` |

- **Caixa preta de classe**:
    - Entidades de domínio, serviços, controllers (cada um como SUT isolado, com dependências mockadas).
- **Caixa preta de aplicação**:
    - Testes de sistema (`*SystemTests`) onde o SUT é a WebAPI inteira via HTTP,  
      ou, no caso de VVN, o par Controller+Service reais exercitado como “black-box de aplicação”.
