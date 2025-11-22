import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaffMemberEditModal from '../../components/StaffMemberEditModal';
import type { StaffMember } from "../../domain/staffMember";
import type { Qualification } from "../../../qualifications/domain/qualification";
import * as service from '../../services/staffMemberService';
import * as qService from '../../../qualifications/services/qualificationService';
import * as helpers from '../../helpers/staffMemberHelpers';
import * as notify from '../../../../utils/notify';
import { WeekDay } from "../../helpers/staffMemberHelpers";


const mockUpdateStaffMember = vi.spyOn(service, 'updateStaffMember');
const mockGetQualifications = vi.spyOn(qService, 'getQualifications');
const mockGetWeekDayNames = vi.spyOn(helpers, 'getWeekDayNames'); // Mock helper para exibição


const mockNotifyError = vi.spyOn(notify, 'notifyError');
const mockNotifySuccess = vi.spyOn(notify, 'notifySuccess');

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


const mockStaff: StaffMember = {
    id: '1',
    mecanographicNumber: 'M001',
    shortName: 'Maria Silva',
    email: 'maria.s@test.com',
    phone: '123456789',
    schedule: { shift: 'Morning', daysOfWeek: '0000011' }, // Segunda e Terça
    isActive: true,
    qualificationCodes: ['Q1', 'Q2']
};

const mockQualifications: Qualification[] = [
    { id: 'Q1ID', code: 'Q1', name: 'Qual A' },
    { id: 'Q2ID', code: 'Q2', name: 'Qual B' },
    { id: 'Q3ID', code: 'Q3', name: 'Qual C' },
];

describe('StaffMemberEditModal', () => {
    const mockOnClose = vi.fn();
    const mockOnUpdate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUpdateStaffMember.mockResolvedValue(mockStaff as any);
        mockGetQualifications.mockResolvedValue(mockQualifications);
        mockGetWeekDayNames.mockReturnValue(['Monday', 'Tuesday']);
    });

    it('não deve renderizar no modo "toggle"', () => {
        render(<StaffMemberEditModal staffMember={mockStaff} mode="toggle" onClose={mockOnClose} onUpdate={mockOnUpdate} />);
        expect(screen.queryByText('staffMembers.editTitle')).not.toBeInTheDocument();
    });

    it('deve carregar os dados iniciais do StaffMember e o schedule atual', () => {
        render(<StaffMemberEditModal staffMember={mockStaff} mode="edit" onClose={mockOnClose} onUpdate={mockOnUpdate} />);

        expect(screen.getByDisplayValue('Maria Silva')).toBeInTheDocument();
        expect(screen.getByText('M001')).toBeInTheDocument();
        expect(screen.getByText(/shiftType.Morning - weekDay.Monday, weekDay.Tuesday/)).toBeInTheDocument();
    });


    it('deve chamar updateStaffMember com nome e status atualizados', async () => {
        const updatedName = 'Maria Updated';

        render(<StaffMemberEditModal staffMember={mockStaff} mode="edit" onClose={mockOnClose} onUpdate={mockOnUpdate} />);


        const nameInput = screen.getByPlaceholderText('staffMembers.form.namePlaceholder');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, updatedName);


        await userEvent.click(screen.getByLabelText('staffMembers.form.isActive'));


        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.save' }));

        await waitFor(() => {
            expect(mockUpdateStaffMember).toHaveBeenCalledWith({
                mecNumber: 'M001',
                shortName: updatedName,
                isActive: false,
            });
        });

        expect(mockNotifySuccess).toHaveBeenCalledWith('staffMembers.updateSuccess');
        expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    });

    it('deve exibir erro se o nome for apagado', async () => {
        render(<StaffMemberEditModal staffMember={mockStaff} mode="edit" onClose={mockOnClose} onUpdate={mockOnUpdate} />);

        await userEvent.clear(screen.getByDisplayValue('Maria Silva'));
        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.save' }));

        expect(mockNotifyError).toHaveBeenCalledWith('staffMembers.nameRequired');
        expect(mockUpdateStaffMember).not.toHaveBeenCalled();
    });




    it('deve enviar a atualização do schedule se a opção for marcada', async () => {
        const mockCreateSchedule = vi.spyOn(helpers, 'createSchedule');
        mockCreateSchedule.mockReturnValue({ shift: 'Evening', daysOfWeek: '0010001' } as any);

        render(<StaffMemberEditModal staffMember={mockStaff} mode="edit" onClose={mockOnClose} onUpdate={mockOnUpdate} />);


        await userEvent.click(screen.getByLabelText('staffMembers.form.changeSchedule'));


        await userEvent.selectOptions(screen.getByRole('combobox'), 'Evening');

        const dayFriday = screen.getByText('weekDay.Friday').closest('div') as HTMLElement;
        const dayTuesday = screen.getByText('weekDay.Tuesday').closest('div') as HTMLElement;

        await userEvent.click(dayFriday);
        await userEvent.click(dayTuesday);

        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.save' }));

        await waitFor(() => {
            expect(mockUpdateStaffMember).toHaveBeenCalledWith(expect.objectContaining({
                mecNumber: 'M001',
                schedule: { shift: 'Evening', daysOfWeek: '0010001' },
            }));
        });

        expect(mockCreateSchedule).toHaveBeenCalledWith('Evening', [WeekDay.Monday, WeekDay.Friday]);
    });


    it('deve adicionar qualificações (Q3) e enviar addQualifications: true', async () => {

        render(<StaffMemberEditModal staffMember={mockStaff} mode="edit" onClose={mockOnClose} onUpdate={mockOnUpdate} />);

        await userEvent.click(screen.getByLabelText('staffMembers.form.addQualifications'));
        await waitFor(() => expect(mockGetQualifications).toHaveBeenCalledTimes(1));


        await userEvent.click(screen.getByText('Q3').closest('.staffMember-qual-item') as HTMLElement);

        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.save' }));

        await waitFor(() => {
            expect(mockUpdateStaffMember).toHaveBeenCalledWith(expect.objectContaining({
                mecNumber: 'M001',
                qualificationCodes: ['Q3'],
                addQualifications: true,
            }));
        });
    });


    it('deve substituir qualificações existentes (mudar para apenas Q3) e enviar addQualifications: false', async () => {

        render(<StaffMemberEditModal staffMember={mockStaff} mode="edit" onClose={mockOnClose} onUpdate={mockOnUpdate} />);

        await userEvent.click(screen.getByLabelText('staffMembers.form.changeQualifications'));
        await waitFor(() => expect(mockGetQualifications).toHaveBeenCalledTimes(1));

        const qualQ1 = screen.getByText('Q1').closest('.staffMember-qual-item') as HTMLElement;
        const qualQ2 = screen.getByText('Q2').closest('.staffMember-qual-item') as HTMLElement;
        const qualQ3 = screen.getByText('Q3').closest('.staffMember-qual-item') as HTMLElement;

        await userEvent.click(qualQ1);
        await userEvent.click(qualQ2);
        await userEvent.click(qualQ3);

        await userEvent.click(screen.getByRole('button', { name: 'staffMembers.save' }));

        await waitFor(() => {
            expect(mockUpdateStaffMember).toHaveBeenCalledWith(expect.objectContaining({
                mecNumber: 'M001',
                qualificationCodes: ['Q3'],
                addQualifications: false,
            }));
        });
    });
});