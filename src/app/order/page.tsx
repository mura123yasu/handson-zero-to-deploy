import { getMenuItems } from "@/lib/menu";
import OrderClient from "./order-client";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const menuItems = await getMenuItems();
  return <OrderClient menuItems={menuItems} />;
}
