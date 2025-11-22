import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaffMemberSearch from '../../components/StaffMemberSearch';
import * as staffService from '../../services/staffMemberService';
import * as qualService from '../../../qualifications/services/qualificationService';
import * as notify from '../../../../utils/notify';
import type { StaffMember } from '../../domain/staffMember';
import type { Qualification } from '../../../qualifications/domain/qualification';

const mockGetStaffMemberByMecNumber = vi.spyOn(staffService, 'getStaffMemberByMecNumber');
const mockGetQualifications = vi.spyOn(qualService, 'getQualifications');


vi.spyOn(notify, 'notifyError');
vi.spyOn(notify, 'notifyLoading');
vi.spyOn(notify, 'notifySuccess');

vi.mock('react-hot-toast', () => ({
    default: {
        dismiss: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
        success: vi.fn(),
    },
}));
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));


const mockStaffMember: StaffMember = {
    id: '1',
    mecanographicNumber: 'M001',
    shortName: 'John Doe',
    email: 'johndoe@test.com',
    phone: '123',
    schedule: { shift: 'Morning', daysOfWeek: '0000001' },
    isActive: true,
    qualificationCodes: ['Q1', 'Q2']
};

const mockQualifications: Qualification[] = [
    { id: 'Q1ID', code: 'Q1', name: 'Qual A' },
];

describe('StaffMemberSearch - Simplified Pass Test', () => {
    const mockOnSearchModeChange = vi.fn();
    const mockOnResultSelect = vi.fn();
    const mockOnBackToList = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetQualifications.mockResolvedValue(mockQualifications);
    });


    it('deve chamar onBackToList ao clicar em "showAll" e estar no modo list por padrão', async () => {
        render(<StaffMemberSearch
            searchMode="list"
            onSearchModeChange={mockOnSearchModeChange}
            onResultSelect={mockOnResultSelect}
            onBackToList={mockOnBackToList}
        />);

        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.showAll' }));

        expect(mockOnBackToList).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'staffMembers.showAll' })).toHaveClass('active');
    });

    it('deve mudar o modo para mecNumber e exibir o campo de busca', async () => {
        render(<StaffMemberSearch
            searchMode="list"
            onSearchModeChange={mockOnSearchModeChange}
            onResultSelect={mockOnResultSelect}
            onBackToList={mockOnBackToList}
        />);

        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.searchByMecNumber' }));

        render(<StaffMemberSearch
            searchMode="mecNumber"
            onSearchModeChange={mockOnSearchModeChange}
            onResultSelect={mockOnResultSelect}
            onBackToList={mockOnBackToList}
        />);

        expect(screen.getByPlaceholderText('staffMembers.searchMecNumberPlaceholder')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'staffMembers.search' })).toBeInTheDocument();
    });



    it('deve buscar por número mecanográfico com sucesso e exibir o resultado', async () => {
        mockGetStaffMemberByMecNumber.mockResolvedValue(mockStaffMember);

        render(<StaffMemberSearch
            searchMode="mecNumber"
            onSearchModeChange={mockOnSearchModeChange}
            onResultSelect={mockOnResultSelect}
            onBackToList={mockOnBackToList}
        />);

        const searchInput = screen.getByPlaceholderText('staffMembers.searchMecNumberPlaceholder');
        const searchButton = screen.getByRole('button', { name: 'staffMembers.search' });

        await userEvent.type(searchInput, 'M001');
        await userEvent.click(searchButton);

        await waitFor(() => {
            expect(mockGetStaffMemberByMecNumber).toHaveBeenCalledWith('M001');
        });

        expect(screen.getByText('John Doe')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.viewDetails' }));
        expect(mockOnResultSelect).toHaveBeenCalledWith(mockStaffMember);
    });
});