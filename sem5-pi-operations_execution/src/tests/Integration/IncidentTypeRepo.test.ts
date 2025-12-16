import 'reflect-metadata';
import { describe, it, expect, beforeAll,beforeEach, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// --- AJUSTA OS CAMINHOS CONFORME A TUA ESTRUTURA ---
import IncidentTypeRepo from '../../repos/incidentTypeRepo';
import IncidentTypeSchema from '../../persistence/schemas/incidentTypeSchema';
import IncidentTypeMap from '../../mappers/IncidentTypeMap';
import { IncidentType } from '../../domain/incidentTypes/incidentType';
import { UniqueEntityID } from '../../core/domain/UniqueEntityID';

describe('IncidentTypeRepo Integration', () => {
    let mongoServer: MongoMemoryServer;
    let repo: IncidentTypeRepo;

    // 1. Setup: Iniciar MongoDB em memória antes de todos os testes
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);

        const loggerMock = {
            debug: () => {},
            info: () => {},
            error: () => {},
            warn: () => {}
        };

        const mapper = new IncidentTypeMap();

        repo = new IncidentTypeRepo(
            IncidentTypeSchema as any,
            mapper,
            loggerMock as any
        );
    });

    // 2. Teardown: Parar MongoDB no fim
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    // 3. Limpeza: Apagar dados entre cada teste
    afterEach(async () => {
        await IncidentTypeSchema.deleteMany({});
    });

    // Helper para criar Entidades de Domínio rapidamente
    const createITDomain = (code: string, parent: string | null) => {
        return IncidentType.creat({
            code: code,
            name: `${code}-Name`,
            description: 'Integration Test',
            severity: 'Minor',
            parent: parent,
            createdAt: new Date(),
            updatedAt: null
        }, new UniqueEntityID());
    };

    // =========================================================
    // CRUD Básico
    // =========================================================

    it('should save and retrieve an Incident Type by Code', async () => {
        // CORRIGIDO: Formato T-INC###
        const item = createITDomain('T-INC001', null);

        // Save
        await repo.save(item);

        // Retrieve
        const found = await repo.findByCode('T-INC001');

        expect(found).not.toBeNull();
        expect(found!.code).toBe('T-INC001');
        expect(found!.name).toBe('T-INC001-Name');
    });

    it('should return null if code does not exist', async () => {
        const found = await repo.findByCode('T-INC999');
        expect(found).toBeNull();
    });

    it('should find by name (partial match)', async () => {
        // CORRIGIDO: Formatos válidos
        await repo.save(createITDomain('T-INC010', null)); // Name: T-INC010-Name
        await repo.save(createITDomain('T-INC020', null)); // Name: T-INC020-Name
        await repo.save(createITDomain('T-INC030', null)); // Name: T-INC030-Name (Water?)

        // Procura por "010" ou "INC"
        const results = await repo.findByName('INC');

        expect(results).toHaveLength(3); // Todos têm INC no nome gerado
    });

    // =========================================================
    // Testes de Hierarquia (Aggregation Pipelines)
    // =========================================================

    describe('Hierarchy & GraphLookup', () => {

        // Setup de uma árvore antes de cada teste deste bloco
        // T-INC100 (ROOT)
        //  |__ T-INC200 (Filho de 100)
        //       |__ T-INC300 (Filho de 200)
        //  |__ T-INC201 (Filho de 100)
        beforeEach(async () => {
            const root = createITDomain('T-INC100', null);
            await repo.save(root);

            const childA = createITDomain('T-INC200', 'T-INC100');
            await repo.save(childA);

            const childB = createITDomain('T-INC201', 'T-INC100');
            await repo.save(childB);

            const grandChild = createITDomain('T-INC300', 'T-INC200');
            await repo.save(grandChild);
        });

        it('getRootTypes: should return only types with no parent', async () => {
            const roots = await repo.getRootTypes();

            expect(roots).toHaveLength(1);
            expect(roots[0].code).toBe('T-INC100');
        });

        it('getDirectChilds: should return only immediate children', async () => {
            const children = await repo.getDirectChilds('T-INC100');

            expect(children).toHaveLength(2);
            const codes = children.map(c => c.code).sort();
            expect(codes).toEqual(['T-INC200', 'T-INC201']);
        });

        it('getDirectChilds: should return empty array if no children', async () => {
            const children = await repo.getDirectChilds('T-INC300');
            expect(children).toHaveLength(0);
        });

        it('getSubTreeFromParentNode: should return ALL descendants recursively', async () => {
            const subtree = await repo.getSubTreeFromParentNode('T-INC100');

            // Deve conter T-INC200, T-INC201 e T-INC300
            expect(subtree).toHaveLength(3);

            const codes = subtree.map(c => c.code);
            expect(codes).toContain('T-INC200');
            expect(codes).toContain('T-INC201');
            expect(codes).toContain('T-INC300');
        });

        it('getSubTreeFromParentNode: should return partial tree from middle node', async () => {
            const subtree = await repo.getSubTreeFromParentNode('T-INC200');

            // Deve conter apenas T-INC300
            expect(subtree).toHaveLength(1);
            expect(subtree[0].code).toBe('T-INC300');
        });
    });
});