import { describe, it, expect } from "vitest";
import {
    WeekDay,
    ShiftType,
    weekDaysToBinary,
    binaryToWeekDays,
    weekDayToString,
    getWeekDayNames,
    createSchedule
} from "../helpers/staffMemberHelpers";

describe('StaffMember Helpers', () => {
    it('weekDaysToBinary deve converter array de WeekDays para binário de 7 bits', () => {
        const days = [WeekDay.Monday, WeekDay.Wednesday, WeekDay.Friday];
        expect(weekDaysToBinary(days)).toBe('0010101');
    });

    it('weekDaysToBinary deve lidar com array vazio e retornar 0000000', () => {
        const days: number[] = [];
        expect(weekDaysToBinary(days)).toBe('0000000');
    });

    it('binaryToWeekDays deve converter binário para array de WeekDays (números)', () => {
        const binary = '1010100';
        // A ordem é Monday (1) a Sunday (64)
        const expectedDays = [WeekDay.Wednesday, WeekDay.Friday, WeekDay.Sunday];
        expect(binaryToWeekDays(binary)).toEqual(expectedDays);
    });

    it('binaryToWeekDays deve lidar com 0000000 e retornar array vazio', () => {
        expect(binaryToWeekDays('0000000')).toEqual([]);
    });

    it('weekDayToString deve retornar a string correta para cada WeekDay', () => {
        expect(weekDayToString(WeekDay.Monday)).toBe('Monday');
        expect(weekDayToString(WeekDay.Sunday)).toBe('Sunday');
        expect(weekDayToString(WeekDay.None)).toBe('None');
    });

    it('getWeekDayNames deve converter binário para array de nomes de dias', () => {
        const binary = '0110000'; // Representa Friday (16) e Saturday (32)
        const expectedNames = ['Friday', 'Saturday']; // Ordem dada pela lógica de binaryToWeekDays
        expect(getWeekDayNames(binary)).toEqual(expectedNames);
    });

    it('createSchedule deve criar um objeto Schedule válido', () => {
        const days = [WeekDay.Monday, WeekDay.Tuesday];
        const shift = ShiftType.Night;

        const expectedSchedule = {
            shift: 'Night',
            daysOfWeek: '0000011'
        };

        expect(createSchedule(shift, days)).toEqual(expectedSchedule);
    });
});