import * as XLSX from 'xlsx';

export interface BookingExportRow {
  booking_code: string;
  type_label: string;
  service_title: string;
  raw_check_in?: any;
  raw_check_out?: any;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  amount: number;
  notes?: string;
  type: string;
}

export const exportBookingsToExcel = (
  bookings: BookingExportRow[],
  helpers: {
    formatDate: (d?: any) => string;
    calculateDays: (start?: any, end?: any) => number;
    getStatus: (b: any) => 'confirmed' | 'reserved' | 'scheduled' | 'blocked';
    getPendingBalance: (b: any) => number;
    getNextPayment: (b: any) => string;
  }
) => {
  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmada (100% Pagado)',
    reserved: 'Reservada (50% Pagado)',
    scheduled: 'Agendada (0% Pagado)',
    blocked: 'Bloqueo Administrativo',
  };

  // 1. Prepare data rows
  const data = bookings.map((b) => {
    const durationDays = helpers.calculateDays(b.raw_check_in, b.raw_check_out);
    const uStatus = helpers.getStatus(b);
    const pendingAmount = helpers.getPendingBalance(b);
    const nextPayment = helpers.getNextPayment(b);

    return {
      'Código Reserva': b.booking_code || '-',
      'Tipo de Servicio': b.type_label || (b.type === 'lodge' ? 'Lodge Rincón' : 'Expedición Náutica'),
      'Expedición / Habitación': b.service_title || '-',
      'Fecha Inicio': helpers.formatDate(b.raw_check_in),
      'Fecha Fin': helpers.formatDate(b.raw_check_out),
      'Días': durationDays,
      'Huésped / Pasajero': b.guest_name || '-',
      'Teléfono': b.guest_phone || '-',
      'Email': b.guest_email || '-',
      'Estado de Reserva': statusLabels[uStatus] || uStatus,
      'Precio Total (CLP)': b.amount || 0,
      'Saldo Pendiente (CLP)': pendingAmount,
      'Próximo Pago (60d)': nextPayment,
      'Notas / Observaciones': b.notes || '',
    };
  });

  // 2. Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. Set custom column widths
  worksheet['!cols'] = [
    { wch: 16 }, // Código
    { wch: 20 }, // Tipo
    { wch: 36 }, // Servicio
    { wch: 14 }, // Inicio
    { wch: 14 }, // Fin
    { wch: 8 },  // Días
    { wch: 26 }, // Pasajero
    { wch: 18 }, // Teléfono
    { wch: 26 }, // Email
    { wch: 26 }, // Estado
    { wch: 18 }, // Precio Total
    { wch: 20 }, // Saldo Pendiente
    { wch: 18 }, // Próximo Pago
    { wch: 40 }, // Notas
  ];

  // 4. Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservas');

  // 5. Generate filename with date
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `Reservas_Yates_Chile_${dateStr}.xlsx`;

  // 6. Download file
  XLSX.writeFile(workbook, filename);
};
