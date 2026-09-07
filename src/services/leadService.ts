import { supabase } from '../lib/supabase';
import type { CustomerProfile } from '../pages/AdminPage';

export interface LeadItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  origin: 'reserva_incompleta' | 'newsletter' | 'brochure' | 'contacto_web' | 'expedicion_interest' | 'lodge_interest' | 'whatsapp' | 'manual';
  originDetails: string;
  dateCreated: string;
  status: 'nuevo' | 'contactado' | 'cotizando' | 'convertido' | 'descartado';
  interestType: 'expediciones' | 'lodge' | 'charter' | 'general';
  estimatedPax?: number;
  tentativeDate?: string;
  notes?: string;
  city?: string;
  country?: string;
  docId?: string;
  estimatedBudgetClp?: number;
  convertedCustomerId?: string;
}

export const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    fullName: 'Ignacio Alarcón Rodríguez',
    email: 'ignacio.alarcon@orangedesign.cl',
    phone: '+56 9 8412 9901',
    docId: '17.318.824-2',
    origin: 'reserva_incompleta',
    originDetails: 'Reserva Web Incompleta (Sin Pago)',
    dateCreated: '2026-08-28',
    status: 'nuevo',
    interestType: 'expediciones',
    estimatedPax: 1,
    tentativeDate: '31 oct 2026 - 10 nov 2026',
    notes: 'RUT: 17.318.824-2. Llenó el formulario de reserva para Expedición Juan Fernández pero no registró abono ni pago.',
    city: 'Santiago',
    country: 'Chile',
    estimatedBudgetClp: 1850000,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    fullName: 'Matías Larraín Palma',
    email: 'matias.larrain@inversioneslp.cl',
    phone: '',
    origin: 'newsletter',
    originDetails: 'Suscripción Newsletter Web',
    dateCreated: '2026-08-27',
    status: 'nuevo',
    interestType: 'general',
    notes: 'Suscripción directa al Newsletter oficial desde el sitio web público.',
    city: 'Chile',
    country: 'Chile',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    fullName: 'Francisca Vial Ochagavía',
    email: 'fvial@vialabogados.cl',
    phone: '+56 9 9345 6712',
    origin: 'brochure',
    originDetails: 'Descarga Brochure Travesías 2026/2027',
    dateCreated: '2026-08-26',
    status: 'contactado',
    interestType: 'charter',
    estimatedPax: 6,
    tentativeDate: 'Diciembre 2026',
    notes: 'Descargó dossier completo en alta resolución. Interesada en chárter privado familiar para Juan Fernández.',
    city: 'Santiago',
    country: 'Chile',
    estimatedBudgetClp: 15000000,
  }
];

const LEADS_STORAGE_KEY = 'yates_leads_store';

function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

class LeadService {
  private getLocalLeads(): LeadItem[] {
    try {
      const data = localStorage.getItem(LEADS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (_) {}
    return INITIAL_LEADS;
  }

  private saveLocalLeads(leads: LeadItem[]): void {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    } catch (_) {}
  }

  public async getLeads(): Promise<LeadItem[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: LeadItem[] = data.map((d: any) => ({
          id: d.id,
          fullName: d.full_name || d.name || 'Prospecto',
          email: d.email || '',
          phone: d.phone || '',
          origin: d.origin || 'contacto_web',
          originDetails: d.origin_details || 'Formulario Web',
          dateCreated: d.created_at ? d.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          status: d.status || 'nuevo',
          interestType: d.interest_type || 'general',
          estimatedPax: d.estimated_pax || 2,
          tentativeDate: d.tentative_date || '',
          notes: d.notes || '',
          city: d.city || '',
          country: d.country || '',
          estimatedBudgetClp: d.estimated_budget_clp || 0,
          convertedCustomerId: d.converted_customer_id,
        }));

        this.saveLocalLeads(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase getLeads warning:', err);
    }

    return this.getLocalLeads();
  }

  public async createLead(lead: {
    fullName: string;
    email: string;
    phone: string;
    origin: LeadItem['origin'];
    originDetails?: string;
    interestType?: LeadItem['interestType'];
    estimatedPax?: number;
    tentativeDate?: string;
    notes?: string;
    city?: string;
    country?: string;
    estimatedBudgetClp?: number;
  }): Promise<{ success: boolean; lead?: LeadItem; error?: string }> {
    const originDet = lead.originDetails || (
      lead.origin === 'brochure'
        ? 'Descarga Brochure Travesías 2026/2027'
        : lead.origin === 'contacto_web'
        ? 'Formulario de Contacto Web'
        : lead.origin === 'whatsapp'
        ? 'WhatsApp Directo Concierge'
        : lead.origin === 'lodge_interest'
        ? 'Consulta Web Lodge'
        : 'Registro Manual'
    );

    let createdId = `lead-${Date.now()}`;

    try {
      const { data, error } = await (supabase as any).from('leads').insert({
        full_name: lead.fullName.trim(),
        email: lead.email.trim().toLowerCase(),
        phone: lead.phone.trim(),
        origin: lead.origin,
        origin_details: originDet,
        status: 'nuevo',
        interest_type: lead.interestType || 'general',
        estimated_pax: lead.estimatedPax || 2,
        tentative_date: lead.tentativeDate || null,
        notes: lead.notes || null,
        city: lead.city || 'Chile',
        country: lead.country || 'Chile',
        estimated_budget_clp: lead.estimatedBudgetClp || 0,
      }).select().single();

      if (!error && data) {
        createdId = data.id;
      }
    } catch (err) {
      console.warn('Supabase create lead warning:', err);
    }

    const newLead: LeadItem = {
      id: createdId,
      fullName: lead.fullName.trim(),
      email: lead.email.trim().toLowerCase(),
      phone: lead.phone.trim(),
      origin: lead.origin,
      originDetails: originDet,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'nuevo',
      interestType: lead.interestType || 'general',
      estimatedPax: lead.estimatedPax || 2,
      tentativeDate: lead.tentativeDate || '',
      notes: lead.notes || '',
      city: lead.city || 'Chile',
      country: lead.country || 'Chile',
      estimatedBudgetClp: lead.estimatedBudgetClp || 0,
    };

    const leads = this.getLocalLeads();
    const updated = [newLead, ...leads.filter(l => l.id !== createdId)];
    this.saveLocalLeads(updated);

    return { success: true, lead: newLead };
  }

  public async updateLeadStatus(id: string, status: LeadItem['status']): Promise<{ success: boolean; error?: string }> {
    if (isValidUuid(id)) {
      try {
        await (supabase as any).from('leads').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateLeadStatus warning:', err);
      }
    }

    const leads = this.getLocalLeads();
    const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
    this.saveLocalLeads(updated);
    return { success: true };
  }

  public async updateLeadNotes(id: string, notes: string): Promise<{ success: boolean; error?: string }> {
    if (isValidUuid(id)) {
      try {
        await (supabase as any).from('leads').update({ notes }).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateLeadNotes warning:', err);
      }
    }

    const leads = this.getLocalLeads();
    const updated = leads.map((l) => (l.id === id ? { ...l, notes } : l));
    this.saveLocalLeads(updated);
    return { success: true };
  }

  public async deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    if (isValidUuid(id)) {
      try {
        await (supabase as any).from('leads').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteLead warning:', err);
      }
    }

    const leads = this.getLocalLeads();
    const updated = leads.filter((l) => l.id !== id);
    this.saveLocalLeads(updated);
    return { success: true };
  }

  public convertLeadToCustomerProfile(lead: LeadItem): CustomerProfile {
    const isVipCandidate = (lead.estimatedBudgetClp || 0) >= 5000000 || lead.interestType === 'charter';
    const tagFromOrigin = lead.origin === 'brochure' ? '📥 Descargó Brochure' : lead.origin === 'whatsapp' ? '💬 WhatsApp' : '🌐 Web Contacto';
    const tagFromInterest = lead.interestType === 'expediciones' ? '⚓ Expedicionario' : lead.interestType === 'lodge' ? '🏡 Lodge Rincón' : '⛵ Chárter Privado';

    return {
      id: `cli-${Date.now()}`,
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone || '+56 9 0000 0000',
      rutOrPassport: 'Pendiente',
      nationality: lead.country === 'Chile' || !lead.country ? 'Chilena' : lead.country,
      city: lead.city ? `${lead.city}, ${lead.country || 'Chile'}` : 'Chile',
      category: isVipCandidate ? 'vip' : 'regular',
      tags: [isVipCandidate ? '👑 VIP Prospect' : '🌟 Nuevo Cliente', tagFromOrigin, tagFromInterest],
      totalSpentClp: lead.estimatedBudgetClp || 0,
      bookingsCount: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      dietaryPreferences: 'Sin registrar',
      divingLevel: 'No especificado',
      beveragePreference: 'No especificado',
      emergencyContact: '',
      notes: `Convertido desde Lead (${lead.originDetails}). Notas previas: ${lead.notes || 'Sin notas adicionales.'}`,
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: 'Hoy',
          type: 'note',
          title: 'Lead Convertido a Cliente CRM',
          description: `El prospecto fue transferido exitosamente desde Leads (${lead.originDetails}).`,
        },
      ],
    };
  }
}

export const leadService = new LeadService();
