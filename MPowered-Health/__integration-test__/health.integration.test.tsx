import { supabase } from '@/lib/supabase/client';
import { fetchHealthSnapshot } from '@/services/health.service';
import {
  listPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from '@/services/prescriptions.service';

import type {
  PrescriptionDraft,
  PrescriptionRow,
} from '@/my-health/prescriptions/state/prescriptions.mapper';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

type MockQuery = Record<string, jest.Mock>;

const createQueryMock = (): MockQuery => {
  const query: MockQuery = {};

  for (const method of [
    'select',
    'eq',
    'gte',
    'order',
    'limit',
    'insert',
    'update',
    'delete',
    'single',
  ]) {
    query[method] = jest.fn(() => query);
  }

  return query;
};

const mockFrom = supabase.from as jest.Mock;

const draft: PrescriptionDraft = {
  name: '  Paracetamol  ',
  strength: '500',
  unit: 'mg',
  form: 'Tablet',
  repeat: 'Daily',
};

const prescriptionRow: PrescriptionRow = {
  prescription_id: 'prescription-123',
  medicine_name: 'Paracetamol',
  strength: 500,
  strength_unit: 'mg',
  form: 'Tablet',
  frequency: 'Daily',
};

describe('My Health services', () => {
  let query: MockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    query = createQueryMock();
    mockFrom.mockReturnValue(query);
  });

  describe('fetchHealthSnapshot', () => {
    it('queries recent assessments and returns the mapped snapshot', async () => {
      query.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await fetchHealthSnapshot('user-123');

      expect(mockFrom).toHaveBeenCalledWith('assessment');
      expect(query.select).toHaveBeenCalledWith(
        expect.stringContaining('pain_assessment(*)'),
      );
      expect(query.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(query.gte).toHaveBeenCalledWith(
        'date',
        expect.any(String),
      );
      expect(query.order).toHaveBeenCalledWith('date', {
        ascending: false,
      });
      expect(query.limit).toHaveBeenCalledWith(500);

      expect(result).toEqual({
        painRecords: [],
        latest: {},
        weeks: [],
      });
    });

    it('throws a safe error when assessments cannot be loaded', async () => {
      query.limit.mockResolvedValue({
        data: null,
        error: { code: 'PGRST200' },
      });

      await expect(
        fetchHealthSnapshot('user-123'),
      ).rejects.toThrow(
        'Could not load health records (PGRST200).',
      );
    });
  });

  describe('listPrescriptions', () => {
    it('loads prescriptions for the requested user', async () => {
      query.order.mockResolvedValue({
        data: [prescriptionRow],
        error: null,
      });

      const result = await listPrescriptions('user-123');

      expect(mockFrom).toHaveBeenCalledWith('Prescription');
      expect(query.select).toHaveBeenCalledWith('*');
      expect(query.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(query.order).toHaveBeenCalledWith('created_at', {
        ascending: true,
      });

      expect(result).toEqual([
        {
          id: 'prescription-123',
          name: 'Paracetamol',
          strength: '500',
          unit: 'mg',
          form: 'Tablet',
          repeat: 'Daily',
        },
      ]);
    });

    it('returns an empty list when the user has no prescriptions', async () => {
      query.order.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        listPrescriptions('user-123'),
      ).resolves.toEqual([]);
    });

    it('throws an error when loading prescriptions fails', async () => {
      query.order.mockResolvedValue({
        data: null,
        error: { code: '42501' },
      });

      await expect(
        listPrescriptions('user-123'),
      ).rejects.toThrow('Could not load prescriptions (42501).');
    });
  });

  describe('createPrescription', () => {
    it('inserts the mapped draft and database defaults', async () => {
      query.single.mockResolvedValue({
        data: prescriptionRow,
        error: null,
      });

      const result = await createPrescription('user-123', draft);

      expect(mockFrom).toHaveBeenCalledWith('Prescription');

      expect(query.insert).toHaveBeenCalledWith({
        medicine_name: 'Paracetamol',
        strength: 500,
        strength_unit: 'mg',
        form: 'Tablet',
        frequency: 'Daily',
        user_id: 'user-123',
        number_of_repeat: 1,
        time_out: '09:00:00',
      });

      expect(query.select).toHaveBeenCalled();
      expect(query.single).toHaveBeenCalled();

      expect(result).toEqual({
        id: 'prescription-123',
        name: 'Paracetamol',
        strength: '500',
        unit: 'mg',
        form: 'Tablet',
        repeat: 'Daily',
      });
    });

    it('throws an error when saving fails', async () => {
      query.single.mockResolvedValue({
        data: null,
        error: { code: '42501' },
      });

      await expect(
        createPrescription('user-123', draft),
      ).rejects.toThrow('Could not save the prescription (42501).');
    });
  });

  describe('updatePrescription', () => {
    it('updates editable fields without overwriting database defaults', async () => {
      query.single.mockResolvedValue({
        data: prescriptionRow,
        error: null,
      });

      await updatePrescription('prescription-123', draft);

      expect(mockFrom).toHaveBeenCalledWith('Prescription');

      expect(query.update).toHaveBeenCalledWith({
        medicine_name: 'Paracetamol',
        strength: 500,
        strength_unit: 'mg',
        form: 'Tablet',
        frequency: 'Daily',
      });

      expect(query.eq).toHaveBeenCalledWith(
        'prescription_id',
        'prescription-123',
      );

      expect(query.update.mock.calls[0][0]).not.toHaveProperty(
        'number_of_repeat',
      );
      expect(query.update.mock.calls[0][0]).not.toHaveProperty(
        'time_out',
      );

      expect(query.select).toHaveBeenCalled();
      expect(query.single).toHaveBeenCalled();
    });

    it('throws an error when updating fails', async () => {
      query.single.mockResolvedValue({
        data: null,
        error: { code: '42501' },
      });

      await expect(
        updatePrescription('prescription-123', draft),
      ).rejects.toThrow('Could not save the prescription (42501).');
    });
  });

  describe('deletePrescription', () => {
    it('deletes the requested prescription by ID', async () => {
      query.eq.mockResolvedValue({
        error: null,
      });

      await expect(
        deletePrescription('prescription-123'),
      ).resolves.toBeUndefined();

      expect(mockFrom).toHaveBeenCalledWith('Prescription');
      expect(query.delete).toHaveBeenCalled();
      expect(query.eq).toHaveBeenCalledWith(
        'prescription_id',
        'prescription-123',
      );
    });

    it('throws an error when deletion fails', async () => {
      query.eq.mockResolvedValue({
        error: { code: '42501' },
      });

      await expect(
        deletePrescription('prescription-123'),
      ).rejects.toThrow('Could not remove the prescription (42501).');
    });
  });
});