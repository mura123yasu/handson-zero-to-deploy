export type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  inStock: boolean;
};

export const categories = [
  "すべて",
  "メイン",
  "サイド",
  "デザート",
  "ドリンク",
];

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "特製ハンバーグ定食",
    price: 1280,
    category: "メイン",
    description: "自家製デミグラスソースの特製ハンバーグ。ライス・味噌汁付き。",
    imageUrl: "🍽️",
    inStock: true,
  },
  {
    id: 2,
    name: "海鮮丼",
    price: 1480,
    category: "メイン",
    description: "新鮮な刺身をふんだんに盛り付けた海鮮丼。味噌汁付き。",
    imageUrl: "🐟",
    inStock: true,
  },
  {
    id: 3,
    name: "から揚げ定食",
    price: 980,
    category: "メイン",
    description: "カリッとジューシーな鶏のから揚げ。ライス・味噌汁付き。",
    imageUrl: "🍗",
    inStock: true,
  },
  {
    id: 4,
    name: "季節のサラダ",
    price: 580,
    category: "サイド",
    description: "旬の野菜を使った彩り豊かなサラダ。",
    imageUrl: "🥗",
    inStock: true,
  },
  {
    id: 5,
    name: "味噌汁（単品）",
    price: 200,
    category: "サイド",
    description: "出汁にこだわった自家製味噌汁。",
    imageUrl: "🍜",
    inStock: true,
  },
  {
    id: 6,
    name: "枝豆",
    price: 350,
    category: "サイド",
    description: "塩茹でした旬の枝豆。おつまみにも最適。",
    imageUrl: "🫛",
    inStock: true,
  },
  {
    id: 7,
    name: "抹茶アイス",
    price: 400,
    category: "デザート",
    description: "濃厚な宇治抹茶を使用したアイスクリーム。",
    imageUrl: "🍨",
    inStock: true,
  },
  {
    id: 8,
    name: "わらび餅",
    price: 450,
    category: "デザート",
    description: "もちもち食感の手作りわらび餅。黒蜜ときな粉添え。",
    imageUrl: "🍡",
    inStock: true,
  },
  {
    id: 9,
    name: "緑茶",
    price: 250,
    category: "ドリンク",
    description: "香り高い静岡産の煎茶。",
    imageUrl: "🍵",
    inStock: true,
  },
  {
    id: 10,
    name: "生ビール",
    price: 550,
    category: "ドリンク",
    description: "キンキンに冷えた生ビール（中ジョッキ）。",
    imageUrl: "🍺",
    inStock: true,
  },
];
