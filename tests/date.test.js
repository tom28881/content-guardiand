import { daysBetween, isoWeekLabel } from '../src/backend/utils/date';

describe('Date Utils', () => {
  describe('daysBetween', () => {
    it('should return 0 for the same day', () => {
      expect(daysBetween('2023-01-01T12:00:00Z', '2023-01-01T18:00:00Z')).toBe(0);
    });

    it('should return 1 for consecutive days', () => {
      expect(daysBetween('2023-01-01T23:00:00Z', '2023-01-02T01:00:00Z')).toBe(1);
    });

    it('should return the correct number of days for a longer period', () => {
      expect(daysBetween('2023-01-01', '2023-01-31')).toBe(30);
    });

    it('should handle leap years', () => {
      expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
    });

    it('should work regardless of the order of dates', () => {
      expect(daysBetween('2023-01-31', '2023-01-01')).toBe(30);
    });
  });

  describe('isoWeekLabel', () => {
    it('should return the correct week for a date at the beginning of the year', () => {
      expect(isoWeekLabel('2023-01-01T00:00:00Z')).toBe('2022-W52');
    });

    it('should return the correct week for a date in the middle of the year', () => {
      expect(isoWeekLabel('2023-07-15T12:00:00Z')).toBe('2023-W28');
    });

    it('should return the correct week for a date at the end of the year', () => {
      expect(isoWeekLabel('2023-12-31T23:59:59Z')).toBe('2023-W52');
    });

    it('should handle the first week of a new year correctly', () => {
      expect(isoWeekLabel('2024-01-01T00:00:00Z')).toBe('2024-W01');
    });

    it('should handle a leap year date correctly', () => {
      expect(isoWeekLabel('2024-02-29T12:00:00Z')).toBe('2024-W09');
    });
  });
});
