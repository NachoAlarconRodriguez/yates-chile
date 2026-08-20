import { useState, useEffect, useCallback } from 'react';
import { lodgeService, type LodgeRoom, type LodgeBooking } from '../services/lodgeService';

export function useLodge() {
  const [rooms, setRooms] = useState<LodgeRoom[]>([]);
  const [bookings, setBookings] = useState<LodgeBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsData, bookingsData] = await Promise.all([
        lodgeService.getRooms(),
        lodgeService.getBookingsAndBlocks(),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch {
      // Fallbacks are handled inside service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isDateBookedForRoom = (roomId: string, dateStr: string) => {
    return bookings.some((b) => {
      if (b.room_id !== roomId) return false;
      return dateStr >= b.check_in && dateStr < b.check_out;
    });
  };

  return {
    rooms,
    bookings,
    loading,
    refreshLodge: fetchData,
    isDateBookedForRoom,
    createBooking: lodgeService.createBooking.bind(lodgeService),
    adminBlockRoom: lodgeService.adminBlockRoom.bind(lodgeService),
    deleteBookingOrBlock: lodgeService.deleteBookingOrBlock.bind(lodgeService),
  };
}
