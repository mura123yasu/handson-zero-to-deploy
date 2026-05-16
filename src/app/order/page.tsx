import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  {
    id: 1,
    name: "特製ハンバーグ定食",
    price: 1280,
    category: "メイン",
    description: "自家製デミグラスソースの特製ハンバーグ。ライス・味噌汁付き。",
  },
  {
    id: 2,
    name: "海鮮丼",
    price: 1480,
    category: "メイン",
    description: "新鮮な刺身をふんだんに盛り付けた海鮮丼。味噌汁付き。",
  },
  {
    id: 3,
    name: "から揚げ定食",
    price: 980,
    category: "メイン",
    description: "カリッとジューシーな鶏のから揚げ。ライス・味噌汁付き。",
  },
  {
    id: 4,
    name: "季節のサラダ",
    price: 580,
    category: "サイド",
    description: "旬の野菜を使った彩り豊かなサラダ。",
  },
  {
    id: 5,
    name: "味噌汁（単品）",
    price: 200,
    category: "サイド",
    description: "出汁にこだわった自家製味噌汁。",
  },
  {
    id: 6,
    name: "抹茶アイス",
    price: 400,
    category: "デザート",
    description: "濃厚な宇治抹茶を使用したアイスクリーム。",
  },
];

export default function OrderPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <h1 className="text-lg font-bold tracking-tight">OSAKI 亭</h1>
        </div>
      </header>

      {/* メニューエリア */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          メニュー
        </h2>
        <div className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{item.name}</CardTitle>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 text-base font-semibold">
                  ¥{item.price.toLocaleString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  カートに追加
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* 注文リストを見るボタン（フッター固定） */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <Button variant="outline" className="w-full" size="lg">
            注文リストを見る
          </Button>
        </div>
      </div>
    </div>
  );
}
