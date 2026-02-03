import { ClothingItem } from '@/src/types/ClothingItem';
import { getTodayISO } from './dateHelpers';

// Placeholder image URLs - using a placeholder service
const getPlaceholderImage = (category: string, index: number): string => {
  // Using placeholder.com with category-specific colors
  const colors: Record<string, string> = {
    tops: 'FF6B6B',
    bottoms: '4ECDC4',
    outerwear: '45B7D1',
    shoes: '96CEB4',
    accessories: 'FFEAA7',
  };
  const color = colors[category] || 'CCCCCC';
  return `https://via.placeholder.com/400x400/${color}/FFFFFF?text=${category}+${index}`;
};

const brands = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'Gap', 'Old Navy',
  'Target', 'Forever 21', 'American Eagle', 'Hollister', 'Abercrombie',
  'J.Crew', 'Banana Republic', 'Calvin Klein', 'Tommy Hilfiger', 'Ralph Lauren'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', '28', '30', '32', '34', '36', '38', '40', '8', '9', '10', '11'];

const colorOptions = [
  ['Black'], ['White'], ['Navy'], ['Gray'], ['Beige'], ['Brown'],
  ['Blue'], ['Red'], ['Green'], ['Yellow'], ['Pink'], ['Purple'],
  ['Black', 'White'], ['Blue', 'White'], ['Red', 'Black'], ['Gray', 'Navy'],
  ['Beige', 'Brown'], ['Green', 'White']
];

const materials = [
  'Cotton', 'Polyester', 'Denim', 'Wool', 'Leather', 'Synthetic',
  'Linen', 'Silk', 'Spandex', 'Cashmere', 'Fleece', 'Canvas'
];

const careInstructions = [
  'Machine wash cold', 'Hand wash only', 'Dry clean only',
  'Machine wash warm', 'Hang dry', 'Tumble dry low'
];

const categoryItems: Record<string, string[]> = {
  tops: [
    'T-Shirt', 'Long Sleeve Shirt', 'Polo Shirt', 'Button-Down Shirt',
    'Tank Top', 'Sweater', 'Hoodie', 'Blouse', 'Tunic', 'Crop Top',
    'Henley', 'Flannel Shirt', 'Turtleneck', 'Cardigan', 'Blazer'
  ],
  bottoms: [
    'Jeans', 'Chinos', 'Cargo Pants', 'Leggings', 'Shorts',
    'Sweatpants', 'Dress Pants', 'Skirt', 'Joggers', 'Culottes',
    'Wide Leg Pants', 'Capri Pants', 'Cargo Shorts', 'Athletic Shorts'
  ],
  outerwear: [
    'Jacket', 'Coat', 'Parka', 'Bomber Jacket', 'Denim Jacket',
    'Leather Jacket', 'Windbreaker', 'Raincoat', 'Trench Coat',
    'Puffer Jacket', 'Blazer', 'Cardigan', 'Fleece Jacket'
  ],
  shoes: [
    'Sneakers', 'Running Shoes', 'Boots', 'Dress Shoes', 'Sandals',
    'Loafers', 'High Tops', 'Slip-Ons', 'Hiking Boots', 'Flats',
    'Heels', 'Oxfords', 'Espadrilles', 'Moccasins'
  ],
  accessories: [
    'Watch', 'Belt', 'Hat', 'Cap', 'Scarf', 'Sunglasses',
    'Backpack', 'Handbag', 'Wallet', 'Gloves', 'Tie', 'Bow Tie',
    'Necklace', 'Bracelet', 'Earrings'
  ]
};

const tagsByCategory: Record<string, string[]> = {
  tops: [
    ['casual', 'everyday'],
    ['casual', 'workout'],
    ['formal', 'dressy'],
    ['casual'],
    ['workout', 'everyday'],
    ['warm', 'casual'],
    ['casual', 'everyday'],
    ['formal', 'dressy'],
    ['casual'],
    ['casual', 'everyday'],
  ],
  bottoms: [
    ['casual', 'everyday'],
    ['casual', 'dressy'],
    ['casual', 'everyday'],
    ['workout', 'casual'],
    ['casual', 'everyday'],
    ['casual', 'warm'],
    ['formal', 'dressy'],
    ['casual', 'dressy'],
    ['casual', 'everyday'],
    ['casual'],
  ],
  outerwear: [
    ['casual', 'warm'],
    ['warm', 'everyday'],
    ['waterproof', 'warm'],
    ['casual', 'everyday'],
    ['casual'],
    ['casual', 'dressy'],
    ['waterproof', 'casual'],
    ['waterproof'],
    ['formal', 'dressy'],
    ['warm', 'casual'],
  ],
  shoes: [
    ['casual', 'everyday'],
    ['workout', 'casual'],
    ['casual', 'warm'],
    ['formal', 'dressy'],
    ['casual', 'everyday'],
    ['casual', 'dressy'],
    ['casual', 'everyday'],
    ['casual'],
    ['casual', 'everyday'],
    ['casual', 'dressy'],
  ],
  accessories: [
    ['formal', 'dressy'],
    ['casual', 'dressy'],
    ['casual', 'everyday'],
    ['casual'],
    ['warm', 'casual'],
    ['casual', 'everyday'],
    ['casual', 'everyday'],
    ['casual'],
    ['casual', 'dressy'],
    ['casual'],
  ],
};

export const generateDemoItems = (): ClothingItem[] => {
  const items: ClothingItem[] = [];
  const now = new Date();
  const categories: Array<'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories'> = 
    ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'];
  
  // Generate 10 items per category to get 50 total
  categories.forEach((category) => {
    const categoryNames = categoryItems[category];
    const categoryTags = tagsByCategory[category];
    
    for (let i = 0; i < 10; i++) {
      const nameIndex = i % categoryNames.length;
      const name = categoryNames[nameIndex];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const colors = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];
      const tags = categoryTags[i % categoryTags.length];
      const careInstruction = careInstructions[Math.floor(Math.random() * careInstructions.length)];
      
      // Random purchase date within last 2 years
      const daysAgo = Math.floor(Math.random() * 730);
      const purchaseDate = new Date(now);
      purchaseDate.setDate(purchaseDate.getDate() - daysAgo);
      
      // Random price based on category
      const basePrices: Record<string, [number, number]> = {
        tops: [15, 80],
        bottoms: [25, 120],
        outerwear: [50, 200],
        shoes: [40, 150],
        accessories: [10, 100],
      };
      const [minPrice, maxPrice] = basePrices[category];
      const purchasePrice = Math.round((Math.random() * (maxPrice - minPrice) + minPrice) * 100) / 100;
      
      const item: ClothingItem = {
        id: `demo-${category}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: `${brand} ${name}`,
        category,
        brand,
        size,
        colors,
        material,
        purchasePrice,
        purchaseDate: purchaseDate.toISOString(),
        photoUri: getPlaceholderImage(category, i + 1),
        careInstructions: careInstruction,
        tags,
        createdAt: getTodayISO(),
        updatedAt: getTodayISO(),
      };
      
      items.push(item);
    }
  });
  
  return items;
};
