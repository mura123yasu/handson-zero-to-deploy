import { Suspense } from "react";
import OrderHistoryClient from "./order-history-client";

export const dynamic = "force-dynamic";

export default function OrderHistoryPage() {
  return (
    <Suspense>
      <OrderHistoryClient />
    </Suspense>
  );
}
