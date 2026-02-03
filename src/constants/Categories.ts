export const Categories = {
  tops: 'Tops',
  bottoms: 'Bottoms',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessories',
} as const;

export const CategoryOptions = [
  { label: 'Tops', value: 'tops' },
  { label: 'Bottoms', value: 'bottoms' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Shoes', value: 'shoes' },
  { label: 'Accessories', value: 'accessories' },
] as const;

export const CommonTags = [
  'casual',
  'formal',
  'workout',
  'waterproof',
  'warm',
  'cool',
  'dressy',
  'everyday',
  'seasonal',
  'vintage',
] as const;
