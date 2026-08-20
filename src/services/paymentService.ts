import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type PaymentInstallment = Database['public']['Tables']['payment_installments']['Row'];

export const paymentService = {
  async getInstallmentsForBooking(bookingId: string): Promise<PaymentInstallment[]> {
    try {
      const { data, error } = await supabase
        .from('payment_installments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('installment_number', { ascending: true });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async getAllPendingInstallments(): Promise<PaymentInstallment[]> {
    try {
      const { data, error } = await supabase
        .from('payment_installments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  async uploadReceipt(installmentId: string, file: File, bankRef?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const ext = file.name.split('.').pop();
      const path = `receipts/${installmentId}_${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('receipts')
        .upload(path, file, { upsert: true });

      if (uploadErr) {
        return { success: false, error: uploadErr.message };
      }

      const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path);
      const receiptUrl = publicUrlData.publicUrl;

      // Update installment to pending_approval
      const { error: updateErr } = await supabase
        .from('payment_installments')
        .update({
          receipt_url: receiptUrl,
          bank_reference: bankRef || null,
          status: 'pending_approval',
        })
        .eq('id', installmentId);

      if (updateErr) return { success: false, error: updateErr.message };
      return { success: true, url: receiptUrl };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async approveInstallment(
    installmentId: string,
    amountPaid: number,
    adminName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: installment, error: fetchErr } = await supabase
        .from('payment_installments')
        .select('*')
        .eq('id', installmentId)
        .single();

      if (fetchErr || !installment) return { success: false, error: 'Cuota no encontrada' };

      // Update installment to approved
      const { error: appErr } = await supabase
        .from('payment_installments')
        .update({
          status: 'approved',
          amount_paid: amountPaid,
          approved_by: adminName,
          approved_at: new Date().toISOString(),
        })
        .eq('id', installmentId);

      if (appErr) return { success: false, error: appErr.message };

      // Check if all installments for this booking are approved
      const { data: allInst } = await supabase
        .from('payment_installments')
        .select('status')
        .eq('booking_id', installment.booking_id);

      const allApproved = allInst && allInst.length > 0 && allInst.every((i) => i.status === 'approved');

      // Update corresponding booking status to approved if first/all installment approved
      if (installment.booking_type === 'lodge') {
        await supabase
          .from('lodge_bookings')
          .update({
            status: allApproved ? 'approved' : 'approved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', installment.booking_id);
      } else if (installment.booking_type === 'expedition') {
        await supabase
          .from('expedition_bookings')
          .update({
            status: allApproved ? 'approved' : 'approved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', installment.booking_id);
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  async applyDiscount(
    bookingType: 'lodge' | 'expedition',
    bookingId: string,
    discountAmount: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (bookingType === 'lodge') {
        const { error } = await supabase
          .from('lodge_bookings')
          .update({
            discount_amount: discountAmount,
            discount_reason: reason,
          })
          .eq('id', bookingId);
        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase
          .from('expedition_bookings')
          .update({
            discount_amount: discountAmount,
            discount_reason: reason,
          })
          .eq('id', bookingId);
        if (error) return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};
