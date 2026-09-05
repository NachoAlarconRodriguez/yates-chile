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
      let supabaseData: PaymentInstallment[] = [];
      try {
        const { data, error } = await supabase
          .from('payment_installments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          supabaseData = data;
        }
      } catch {}

      let localData: PaymentInstallment[] = [];
      try {
        const stored = localStorage.getItem('yates_installments');
        if (stored) {
          localData = JSON.parse(stored);
        }
      } catch {}

      if (localData.length === 0) return supabaseData;
      if (supabaseData.length === 0) return localData;

      // Merge: localData might have updated status or recent items
      const mergedMap = new Map<string, PaymentInstallment>();
      supabaseData.forEach((i) => mergedMap.set(i.id, i));
      localData.forEach((i) => {
        mergedMap.set(i.id, { ...(mergedMap.get(i.id) || {}), ...i });
      });

      return Array.from(mergedMap.values());
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

      try {
        const stored = localStorage.getItem('yates_installments');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((i: any) =>
            i.id === installmentId
              ? { ...i, receipt_url: receiptUrl, bank_reference: bankRef || null, status: 'pending_approval' }
              : i
          );
          localStorage.setItem('yates_installments', JSON.stringify(updated));
        }
      } catch {}

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
      let installment: any = null;
      try {
        const { data, error: fetchErr } = await supabase
          .from('payment_installments')
          .select('*')
          .eq('id', installmentId)
          .single();
        if (!fetchErr && data) {
          installment = data;
        }
      } catch {}

      if (!installment) {
        try {
          const stored = localStorage.getItem('yates_installments');
          if (stored) {
            const list = JSON.parse(stored);
            installment = list.find((i: any) => i.id === installmentId);
          }
        } catch {}
      }

      // Update installment in Supabase
      try {
        await supabase
          .from('payment_installments')
          .update({
            status: 'approved',
            amount_paid: amountPaid,
            approved_by: adminName,
            approved_at: new Date().toISOString(),
          })
          .eq('id', installmentId);
      } catch {}

      // Update installment in localStorage
      try {
        const stored = localStorage.getItem('yates_installments');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((i: any) =>
            i.id === installmentId
              ? {
                  ...i,
                  status: 'approved',
                  amount_paid: amountPaid,
                  approved_by: adminName,
                  approved_at: new Date().toISOString(),
                }
              : i
          );
          localStorage.setItem('yates_installments', JSON.stringify(updated));
        }
      } catch {}

      if (installment) {
        // Check if all installments for this booking are approved
        const bookingId = installment.booking_id;
        try {
          const { data: allInst } = await supabase
            .from('payment_installments')
            .select('status')
            .eq('booking_id', bookingId);

          const allApproved = allInst && allInst.length > 0 && allInst.every((i) => i.status === 'approved');

          if (installment.booking_type === 'lodge') {
            await supabase
              .from('lodge_bookings')
              .update({
                status: allApproved ? 'approved' : 'approved',
                updated_at: new Date().toISOString(),
              })
              .eq('id', bookingId);
          } else if (installment.booking_type === 'expedition') {
            await supabase
              .from('expedition_bookings')
              .update({
                status: allApproved ? 'approved' : 'approved',
                updated_at: new Date().toISOString(),
              })
              .eq('id', bookingId);
          }
        } catch {}
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yates_installments_updated'));
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
