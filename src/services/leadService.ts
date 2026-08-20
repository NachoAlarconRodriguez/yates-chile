import { supabase } from '../lib/supabase';
import type { CustomerProfile } from '../pages/AdminPage';

export interface LeadItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  origin: 'brochure' | 'contacto_web' | 'expedicion_interest' | 'lodge_interest' | 'whatsapp' | 'manual';
  originDetails: string;
  dateCreated: string;
  status: 'nuevo' | 'contactado' | 'cotizando' | 'convertido' | 'descartado';
  interestType: 'expediciones' | 'lodge' | 'charter' | 'general';
  estimatedPax?: number;
  tentativeDate?: string;
  notes?: string;
  city?: string;
  country?: string;
  estimatedBudgetClp?: number;
  convertedCustomerId?: string;
}

export const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead-1',
    fullName: 'Francisca Vial Ochagavía',
    email: 'fvial@vialabogados.cl',
    phone: '+56 9 9821 4433',
    origin: 'brochure',
    originDetails: 'Descarga Brochure Travesías 2026/2027',
    dateCreated: '2026-08-19',
    status: 'nuevo',
    interestType: 'expediciones',
    estimatedPax: 2,
    tentativeDate: 'Noviembre 2026',
    notes: 'Descargó el brochure de travesías desde la web pública. Interés detectado en Expedición Robinson en velero.',
    city: 'Santiago',
    country: 'Chile',
    estimatedBudgetClp: 3700000,
  },
  {
    id: 'lead-2',
    fullName: 'Ignacio Errázuriz Lyon',
    email: 'ierrazuriz@antarticventures.com',
    phone: '+56 9 7411 9022',
    origin: 'contacto_web',
    originDetails: 'Formulario "Diseña tu Travesía" (Contacto)',
    dateCreated: '2026-08-18',
    status: 'cotizando',
    interestType: 'charter',
    estimatedPax: 6,
    tentativeDate: 'Enero 2027',
    notes: 'Solicitó cotización para chárter privado completo en Yate Terranova hacia Juan Fernández para grupo familiar de 6 personas.',
    city: 'Zapallar',
    country: 'Chile',
    estimatedBudgetClp: 12600000,
  },
  {
    id: 'lead-3',
    fullName: 'Dr. Alejandro Montesinos',
    email: 'amontesinos@clinicaalemana.cl',
    phone: '+56 9 8104 5511',
    origin: 'lodge_interest',
    originDetails: 'Consulta Web Lodge Rincón de Navegantes',
    dateCreated: '2026-08-16',
    status: 'contactado',
    interestType: 'lodge',
    estimatedPax: 2,
    tentativeDate: 'Octubre 2026',
    notes: 'Consultó por disponibilidad de Cabina Proa por 5 noches. Interesado en actividades de pesca con devolución y senderismo guiado.',
    city: 'Santiago',
    country: 'Chile',
    estimatedBudgetClp: 2100000,
  },
  {
    id: 'lead-4',
    fullName: 'Sophie Vandermeersch',
    email: 'sophie.vdm@belgium-expeditions.be',
    phone: '+32 470 12 34 56',
    origin: 'whatsapp',
    originDetails: 'WhatsApp Directo Concierge',
    dateCreated: '2026-08-14',
    status: 'cotizando',
    interestType: 'expediciones',
    estimatedPax: 4,
    tentativeDate: 'Febrero 2027',
    notes: 'Fotógrafa y bióloga belga. Desea coordinar expedición científica hacia Selkirk con buceo de observación de lobos marinos.',
    city: 'Bruselas',
    country: 'Bélgica',
    estimatedBudgetClp: 7400000,
  },
  {
    id: 'lead-5',
    fullName: 'Cristóbal Schmidt Cox',
    email: 'cschmidt@schmidtgroup.cl',
    phone: '+56 9 9344 8877',
    origin: 'brochure',
    originDetails: 'Descarga Brochure Travesías 2026/2027',
    dateCreated: '2026-08-12',
    status: 'contactado',
    interestType: 'expediciones',
    estimatedPax: 2,
    tentativeDate: 'Diciembre 2026',
    notes: 'Primer contacto realizado vía WhatsApp por concierge. En espera de confirmación de fechas laborales para viaje de aniversario.',
    city: 'Viña del Mar',
    country: 'Chile',
    estimatedBudgetClp: 3700000,
  },
  {
    id: 'lead-6',
    fullName: 'Agustín Valdés Cruz',
    email: 'agustin@valdespropiedades.cl',
    phone: '+56 9 8765 4321',
    origin: 'contacto_web',
    originDetails: 'Formulario de Contacto Web',
    dateCreated: '2026-08-08',
    status: 'convertido',
    interestType: 'lodge',
    estimatedPax: 2,
    tentativeDate: 'Septiembre 2026',
    notes: 'Convertido a cliente con reserva confirmada en Lodge Rincón de Navegantes.',
    city: 'Santiago',
    country: 'Chile',
    estimatedBudgetClp: 1850000,
  },
  {
    id: 'lead-7',
    fullName: 'Beatriz Larraín Undurraga',
    email: 'beatriz.larrain@gmail.com',
    phone: '+56 9 7123 9988',
    origin: 'manual',
    originDetails: 'Registro Directo / Evento Náutico',
    dateCreated: '2026-08-05',
    status: 'nuevo',
    interestType: 'general',
    estimatedPax: 3,
    tentativeDate: 'Enero 2027',
    notes: 'Contactada en el Club de Yates Higuerillas. Muy interesada en travesía a vela con sus hijos.',
    city: 'Concón',
    country: 'Chile',
    estimatedBudgetClp: 5550000,
  },
  {
    id: 'lead-8',
    fullName: 'Javier Morales Quintana',
    email: 'j.morales@mineriaaustral.cl',
    phone: '+56 9 6612 0099',
    origin: 'whatsapp',
    originDetails: 'WhatsApp Concierge',
    dateCreated: '2026-07-28',
    status: 'descartado',
    interestType: 'charter',
    estimatedPax: 10,
    tentativeDate: 'Marzo 2027',
    notes: 'Buscaba barco para fiesta de 20 personas en bahía de Valparaíso (no calza con el perfil de travesías oceánicas de Yates Chile).',
    city: 'Rancagua',
    country: 'Chile',
  },
];

const LEADS_STORAGE_KEY = 'yates_leads_store';

class LeadService {
  private getLocalLeads(): LeadItem[] {
    try {
      const data = localStorage.getItem(LEADS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (_) {}
    this.saveLocalLeads(INITIAL_LEADS);
    return INITIAL_LEADS;
  }

  private saveLocalLeads(leads: LeadItem[]): void {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
      window.dispatchEvent(new CustomEvent('yates_leads_updated', { detail: leads }));
    } catch (_) {}
  }

  public async getLeads(): Promise<LeadItem[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
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
      }
    } catch {
      // Fallback a localStorage
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
    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      fullName: lead.fullName.trim(),
      email: lead.email.trim().toLowerCase(),
      phone: lead.phone.trim(),
      origin: lead.origin,
      originDetails: lead.originDetails || (
        lead.origin === 'brochure'
          ? 'Descarga Brochure Travesías 2026/2027'
          : lead.origin === 'contacto_web'
          ? 'Formulario de Contacto Web'
          : lead.origin === 'whatsapp'
          ? 'WhatsApp Directo Concierge'
          : lead.origin === 'lodge_interest'
          ? 'Consulta Web Lodge'
          : 'Registro Manual'
      ),
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

    try {
      await (supabase as any).from('leads').insert({
        id: newLead.id,
        full_name: newLead.fullName,
        email: newLead.email,
        phone: newLead.phone,
        origin: newLead.origin,
        origin_details: newLead.originDetails,
        status: newLead.status,
        interest_type: newLead.interestType,
        estimated_pax: newLead.estimatedPax,
        tentative_date: newLead.tentativeDate,
        notes: newLead.notes,
        city: newLead.city,
        country: newLead.country,
        estimated_budget_clp: newLead.estimatedBudgetClp,
      });
    } catch {
      // Fallback a localStorage
    }

    const leads = this.getLocalLeads();
    const updated = [newLead, ...leads];
    this.saveLocalLeads(updated);

    return { success: true, lead: newLead };
  }

  public async updateLeadStatus(id: string, status: LeadItem['status']): Promise<{ success: boolean; error?: string }> {
    try {
      await (supabase as any).from('leads').update({ status }).eq('id', id);
    } catch {
      // Fallback a localStorage
    }

    const leads = this.getLocalLeads();
    const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
    this.saveLocalLeads(updated);
    return { success: true };
  }

  public async updateLeadNotes(id: string, notes: string): Promise<{ success: boolean; error?: string }> {
    try {
      await (supabase as any).from('leads').update({ notes }).eq('id', id);
    } catch {
      // Fallback a localStorage
    }

    const leads = this.getLocalLeads();
    const updated = leads.map((l) => (l.id === id ? { ...l, notes } : l));
    this.saveLocalLeads(updated);
    return { success: true };
  }

  public async deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await (supabase as any).from('leads').delete().eq('id', id);
    } catch {
      // Fallback a localStorage
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
