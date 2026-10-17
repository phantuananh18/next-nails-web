import { redirect } from "next/navigation";

// The appointment request form lives on the landing page.
export default function BookingPage() {
  redirect("/#booking");
}
