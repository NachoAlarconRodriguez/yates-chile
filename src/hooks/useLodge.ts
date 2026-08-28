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
      if (!['pending_transfer', 'approved', 'blocked'].includes(b.status)) return false;
      return dateStr >= b.check_in && dateStr < b.check_out;
    });
  };

  const isRoomBookedForRange = (roomId: string, checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return false;
    return bookings.some((b) => {
      if (b.room_id !== roomId) return false;
      if (!['pending_transfer', 'approved', 'blocked'].includes(b.status)) return false;
      return b.check_in < checkOut && b.check_out > checkIn;
    });
  };

  return {
    rooms,
    bookings,
    loading,
    refreshLodge: fetchData,
    isDateBookedForRoom,
    isRoomBookedForRange,
    createBooking: lodgeService.createBooking.bind(lodgeService),
    adminBlockRoom: lodgeService.adminBlockRoom.bind(lodgeService),
    deleteBookingOrBlock: lodgeService.deleteBookingOrBlock.bind(lodgeService),
    createRoom: async (newRoom: Partial<LodgeRoom>) => {
      const res = await lodgeService.createRoom(newRoom);
      await fetchData();
      return res;
    },
    updateRoom: async (roomId: string, updates: Partial<LodgeRoom>) => {
      const res = await lodgeService.updateRoom(roomId, updates);
      await fetchData();
      return res;
    },
    deleteRoom: async (roomId: string) => {
      const res = await lodgeService.deleteRoom(roomId);
      await fetchData();
      return res;
    },
  };
}
