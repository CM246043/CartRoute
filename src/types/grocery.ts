import { RegionProfile } from '../data/regions';
export type { RegionProfile };

export type StoreId = 'walmart' | 'costco' | 'aldi' | 'kroger' | 'frys' | 'safeway' | 'bashas';

export type AvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StoreInfo {
  id: StoreId;
  name: string;
  brand: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  logoLetter: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  distanceMiles: number;
  drivingMinutes: number;
  mapCoords: { x: number; y: number }; // Relative map canvas coords (0-100)
  lat: number;
  lng: number;
  storeHours: string;
  perks: string[];
  loyaltyProgramName: string;
  membershipRequired: boolean;
  bulkDiscountAdvantage: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: 'Produce' | 'Dairy & Eggs' | 'Meat & Seafood' | 'Pantry & Bakery' | 'Beverages & Snacks' | 'Household';
  defaultUnit: string;
  defaultQty: number;
  description: string;
  standardSizeLabel: string;
}

export interface StoreItemPrice {
  storeId: StoreId;
  itemId: string;
  regularPrice: number;
  salePrice?: number;
  memberPrice?: number;
  isClubBulk?: boolean;
  packageDescription: string;
  unitPriceLabel: string;
  unitPriceEquivalent: number; // Normalized unit price for fair comparison
  availability: AvailabilityStatus;
  aisle: string;
  storeBrandAlternative?: string;
}

export interface StoreCoupon {
  id: string;
  storeId: StoreId;
  title: string;
  discountType: 'fixed' | 'percent' | 'bogo';
  discountValue: number; // e.g. 1.00 for $1 off or 0.20 for 20%
  appliedItemId: string; // Target catalog item
  description: string;
  code: string;
  expiration: string;
  category: string;
  minPurchaseQty?: number;
  isExclusive: boolean;
  exclusiveBadge?: string;
}

export interface UserShoppingItem {
  id: string;
  catalogItemId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  allowSubstitutions: boolean;
  notes?: string;
  checked?: boolean;
}

export interface StoreBasketSummary {
  storeId: StoreId;
  store: StoreInfo;
  itemsAvailableCount: number;
  itemsLowStockCount: number;
  itemsOutOfStockCount: number;
  regularTotal: number;
  couponSavings: number;
  finalTotal: number;
  missingItems: UserShoppingItem[];
  itemPrices: {
    userItem: UserShoppingItem;
    price: number;
    originalPrice: number;
    unitPriceLabel: string;
    couponApplied?: StoreCoupon;
    availability: AvailabilityStatus;
    isClubBulk?: boolean;
    packageLabel: string;
  }[];
}

export interface OptimizedStop {
  store: StoreInfo;
  stopNumber: number;
  items: {
    userItem: UserShoppingItem;
    price: number;
    savingsVsAverage: number;
    couponApplied?: StoreCoupon;
    aisle: string;
    checked: boolean;
  }[];
  subtotal: number;
  couponSavings: number;
  finalTotal: number;
  legDistanceMiles: number;
  legDrivingMinutes: number;
}

export interface RouteStrategyPlan {
  id: 'single_cheapest' | 'two_stop_optimal' | 'three_stop_max_savings' | 'custom';
  title: string;
  subtitle: string;
  description: string;
  stops: OptimizedStop[];
  groceryTotal: number;
  couponTotalSavings: number;
  totalDistanceMiles: number;
  totalDrivingMinutes: number;
  fuelCost: number;
  netCost: number; // groceryTotal + fuelCost
  netSavingsVsBaseline: number;
  allFulfilled: boolean;
}
