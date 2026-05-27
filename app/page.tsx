import { connection } from "next/server";
import { getDashboardData } from "@/features/mlb-dashboard/application/get-dashboard-data";
import { DashboardPage } from "@/features/mlb-dashboard/ui/dashboard-page";

export default async function Home() {
  await connection();

  const dashboardData = await getDashboardData();

  return <DashboardPage {...dashboardData} />;
}
