import { redirect } from "next/navigation";

export default function BarberDashboardRedirect() {
  redirect("/barber/queue");
}
