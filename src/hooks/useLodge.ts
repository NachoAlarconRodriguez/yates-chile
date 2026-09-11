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

  const isDateFullyBooked = (dateStr: string) => {
    if (!dateStr || rooms.length === 0) return false;
    const activeRooms = rooms.filter((r) => r.is_active !== false);
    if (activeRooms.length === 0) return false;
    return activeRooms.every((r) => isDateBookedForRoom(r.id, dateStr));
  };

  const createBooking = async (params: Parameters<typeof lodgeService.createBooking>[0]) => {
    const res = await lodgeService.createBooking(params);
    if (res.success) {
      await fetchData();
    }
    return res;
  };

  const adminBlockRoom = async (params: Parameters<typeof lodgeService.adminBlockRoom>[0]) => {
    const res = await lodgeService.adminBlockRoom(params);
    await fetchData();
    return res;
  };

  const deleteBookingOrBlock = async (bookingIdOrCode: string) => {
    const res = await lodgeService.deleteBookingOrBlock(bookingIdOrCode);
    await fetchData();
    return res;
  };

  return {
    rooms,
    bookings,
    loading,
    refreshLodge: fetchData,
    isDateBookedForRoom,
    isRoomBookedForRange,
    isDateFullyBooked,
    createBooking,
    adminBlockRoom,
    deleteBookingOrBlock,
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
