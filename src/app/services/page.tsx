import { redirect } from "next/navigation";

// Services are shown in the landing page section; this keeps old /services links working.
export default function ServicesPage() {
  redirect("/#services");
}
