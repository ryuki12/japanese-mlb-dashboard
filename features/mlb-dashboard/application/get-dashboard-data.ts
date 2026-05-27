import type { DashboardData } from "../domain/stats";
import { fetchDashboardData } from "../infrastructure/supabase-dashboard-repository";

export async function getDashboardData(): Promise<DashboardData> {
  return fetchDashboardData();
}
