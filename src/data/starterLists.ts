import { UserShoppingItem } from '../types/grocery';

export interface StarterListPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  itemCount: number;
  items: Omit<UserShoppingItem, 'id'>[];
}

export const STARTER_LIST_PRESETS: StarterListPreset[] = [
  {
    id: 'weekly_family',
    name: 'Weekly Family Staples',
    description: 'Essential produce, dairy, meat, and breakfast items for a 3-4 person household.',
    badge: 'Popular',
    itemCount: 10,
    items: [
      { catalogItemId: 'whole_milk', name: 'Whole Milk (1 Gallon)', quantity: 2, unit: 'gallon', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'large_eggs', name: 'Large Grade A White Eggs', quantity: 2, unit: 'dozen', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'chicken_breast', name: 'Boneless Skinless Chicken Breast', quantity: 3, unit: 'lb', category: 'Meat & Seafood', allowSubstitutions: true },
      { catalogItemId: 'ground_beef_85', name: 'Ground Beef 85/15 Lean', quantity: 2, unit: 'lb', category: 'Meat & Seafood', allowSubstitutions: true },
      { catalogItemId: 'bananas', name: 'Fresh Cavendish Bananas', quantity: 3, unit: 'lb', category: 'Produce', allowSubstitutions: true },
      { catalogItemId: 'honeycrisp_apples', name: 'Honeycrisp Apples', quantity: 2, unit: 'lb', category: 'Produce', allowSubstitutions: true },
      { catalogItemId: 'sourdough_bread', name: 'Artisan Sourdough Sliced Bread (24 oz)', quantity: 1, unit: 'loaf', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'rolled_oats', name: 'Old Fashioned Rolled Oats (42 oz)', quantity: 1, unit: 'tub', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'pasta_spaghetti', name: 'Spaghetti Pasta (16 oz)', quantity: 2, unit: 'box', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'marinara_sauce', name: 'Traditional Marinara Pasta Sauce (24 oz)', quantity: 2, unit: 'jar', category: 'Pantry & Bakery', allowSubstitutions: true },
    ],
  },
  {
    id: 'high_protein',
    name: 'High-Protein Meal Prep',
    description: 'Lean meats, Greek yogurt, eggs, salmon, and nutritious whole grains.',
    badge: 'Fitness',
    itemCount: 8,
    items: [
      { catalogItemId: 'chicken_breast', name: 'Boneless Skinless Chicken Breast', quantity: 5, unit: 'lb', category: 'Meat & Seafood', allowSubstitutions: true },
      { catalogItemId: 'atlantic_salmon', name: 'Fresh Atlantic Salmon Fillets', quantity: 2, unit: 'lb', category: 'Meat & Seafood', allowSubstitutions: true },
      { catalogItemId: 'large_eggs', name: 'Large Grade A White Eggs', quantity: 3, unit: 'dozen', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'greek_yogurt', name: 'Greek Yogurt Plain 0% (32 oz)', quantity: 2, unit: 'tub', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'baby_spinach', name: 'Organic Baby Spinach (16 oz)', quantity: 1, unit: 'container', category: 'Produce', allowSubstitutions: true },
      { catalogItemId: 'jasmine_rice', name: 'Jasmine White Rice (5 lb bag)', quantity: 1, unit: 'bag', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'almonds_roasted', name: 'Roasted Whole Almonds (16 oz)', quantity: 1, unit: 'bag', category: 'Beverages & Snacks', allowSubstitutions: true },
      { catalogItemId: 'rolled_oats', name: 'Old Fashioned Rolled Oats (42 oz)', quantity: 1, unit: 'tub', category: 'Pantry & Bakery', allowSubstitutions: true },
    ],
  },
  {
    id: 'budget_student',
    name: 'Budget Value Run',
    description: 'Maximum calorie-to-cost ratio with versatile long-shelf-life pantry staples.',
    badge: 'Under $30',
    itemCount: 8,
    items: [
      { catalogItemId: 'large_eggs', name: 'Large Grade A White Eggs', quantity: 2, unit: 'dozen', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'creamy_peanut_butter', name: 'Creamy Peanut Butter (16 oz)', quantity: 1, unit: 'jar', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'whole_wheat_bread', name: '100% Whole Wheat Sandwich Bread (20 oz)', quantity: 1, unit: 'loaf', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'bananas', name: 'Fresh Cavendish Bananas', quantity: 3, unit: 'lb', category: 'Produce', allowSubstitutions: true },
      { catalogItemId: 'black_beans', name: 'Black Beans Canned (15 oz)', quantity: 4, unit: 'can', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'jasmine_rice', name: 'Jasmine White Rice (5 lb bag)', quantity: 1, unit: 'bag', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'pasta_spaghetti', name: 'Spaghetti Pasta (16 oz)', quantity: 2, unit: 'box', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'marinara_sauce', name: 'Traditional Marinara Pasta Sauce (24 oz)', quantity: 2, unit: 'jar', category: 'Pantry & Bakery', allowSubstitutions: true },
    ],
  },
  {
    id: 'household_restock',
    name: 'Full Household & Pantry Restock',
    description: 'Paper goods, cleaning supplies, breakfast, dairy, and essential proteins.',
    badge: 'Big Run',
    itemCount: 12,
    items: [
      { catalogItemId: 'paper_towels', name: 'Ultra Strong Paper Towels (6 Double Rolls)', quantity: 1, unit: 'pack', category: 'Household', allowSubstitutions: true },
      { catalogItemId: 'toilet_paper', name: 'Ultra Soft Bath Tissue (12 Mega Rolls)', quantity: 1, unit: 'pack', category: 'Household', allowSubstitutions: true },
      { catalogItemId: 'dish_soap', name: 'Concentrated Dishwashing Liquid (28 oz)', quantity: 1, unit: 'bottle', category: 'Household', allowSubstitutions: true },
      { catalogItemId: 'laundry_detergent', name: 'Liquid Laundry Detergent (92 fl oz / 64 loads)', quantity: 1, unit: 'bottle', category: 'Household', allowSubstitutions: true },
      { catalogItemId: 'whole_milk', name: 'Whole Milk (1 Gallon)', quantity: 1, unit: 'gallon', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'unsalted_butter', name: 'Sweet Cream Unsalted Butter (1 lb)', quantity: 1, unit: 'box', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'ground_coffee', name: 'Medium Roast Ground Coffee (12 oz)', quantity: 1, unit: 'bag', category: 'Beverages & Snacks', allowSubstitutions: true },
      { catalogItemId: 'extra_virgin_olive_oil', name: 'Extra Virgin Olive Oil (1 Liter / 33.8 oz)', quantity: 1, unit: 'bottle', category: 'Pantry & Bakery', allowSubstitutions: true },
      { catalogItemId: 'chicken_breast', name: 'Boneless Skinless Chicken Breast', quantity: 3, unit: 'lb', category: 'Meat & Seafood', allowSubstitutions: true },
      { catalogItemId: 'bacon_thick_cut', name: 'Thick Cut Hardwood Smoked Bacon', quantity: 1, unit: 'pack', category: 'Meat & Seafood', allowSubstitutions: true },
      { catalogItemId: 'cheddar_cheese', name: 'Sharp Cheddar Cheese Block (16 oz)', quantity: 1, unit: 'block', category: 'Dairy & Eggs', allowSubstitutions: true },
      { catalogItemId: 'corn_tortilla_chips', name: 'Restaurant Style Tortilla Chips (13 oz)', quantity: 1, unit: 'bag', category: 'Beverages & Snacks', allowSubstitutions: true },
    ],
  },
];
