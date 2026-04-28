"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";
import { useUserAppointmentStore } from "@/stores/user-appointments-store";

/**
 * Монтируется один раз в корне приложения.
 * Фетчит /api/users/me и кладёт пользователя в Zustand-стор.
 * После загрузки пользователя также загружает его консультации.
 */
export function AppInit() {
  const { fetchUser, user, fetched: userFetched } = useUserStore();
  const { fetchAppointments, fetched: apptFetched } = useUserAppointmentStore();

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Fetch appointments after user is loaded
  useEffect(() => {
    if (userFetched && user && !apptFetched) {
      fetchAppointments();
    }
  }, [userFetched, user, apptFetched, fetchAppointments]);

  return null;
}
