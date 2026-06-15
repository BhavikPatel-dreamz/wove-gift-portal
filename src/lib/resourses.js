export const Categories = [
  'Fashion',
  'Electronics',
  'Food & Beverage',
  'Travel',
  'Health & Beauty',
  'Home & Garden',
  'Sports & Outdoors',
  'Entertainment',
  'Services',
  'Other'
];

export const normalizeCategoryName = (category) => {
  return typeof category === 'string' ? category.trim().replace(/\s+/g, ' ') : '';
};

export const mergeCategories = (...categoryGroups) => {
  const categoryMap = new Map();

  categoryGroups.flat().forEach((category) => {
    const normalizedCategory = normalizeCategoryName(category);
    if (!normalizedCategory) return;

    const key = normalizedCategory.toLowerCase();
    if (!categoryMap.has(key)) {
      categoryMap.set(key, normalizedCategory);
    }
  });

  return [...categoryMap.values()];
};
