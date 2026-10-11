import {
  StoreId,
  StoreInfo,
  UserShoppingItem,
  StoreCoupon,
  StoreBasketSummary,
  RouteStrategyPlan,
  OptimizedStop,
  RegionProfile,
} from '../types/grocery';
import { STORES_DATA } from '../data/stores';
import { STORE_PRICING_TABLE } from '../data/catalog';
import { DEFAULT_REGION } from '../data/regions';

export interface RouteSettings {
  gasPricePerGallon: number;
  vehicleMpg: number;
  userHomeLabel: string;
  region: RegionProfile;
}

export const DEFAULT_ROUTE_SETTINGS: RouteSettings = {
  gasPricePerGallon: DEFAULT_REGION.gasPricePerGallon,
  vehicleMpg: 25.0,
  userHomeLabel: `Home (${DEFAULT_REGION.shortLabel})`,
  region: DEFAULT_REGION,
};

// Distance matrix estimation between home and stores, and store-to-store (in miles)
export function getStoreDistance(storeIdA: StoreId | 'home', storeIdB: StoreId | 'home'): number {
  if (storeIdA === storeIdB) return 0;

  if (storeIdA === 'home') {
    return STORES_DATA[storeIdB as StoreId]?.distanceMiles || 3.0;
  }
  if (storeIdB === 'home') {
    return STORES_DATA[storeIdA as StoreId]?.distanceMiles || 3.0;
  }

  const sA = STORES_DATA[storeIdA];
  const sB = STORES_DATA[storeIdB];
  if (!sA || !sB) return 3.5;

  // Approximate road distance based on coordinate delta
  const dx = (sA.mapCoords.x - sB.mapCoords.x) * 0.12;
  const dy = (sA.mapCoords.y - sB.mapCoords.y) * 0.12;
  const straight = Math.sqrt(dx * dx + dy * dy);
  return Math.max(1.2, +(straight * 1.3).toFixed(1));
}

// Compute total basket for a single store
export function calculateStoreBasket(
  storeId: StoreId,
  items: UserShoppingItem[],
  clippedCouponIds: Set<string>,
  couponsList: StoreCoupon[],
  region?: RegionProfile
): StoreBasketSummary {
  const store = STORES_DATA[storeId];
  const storePrices = STORE_PRICING_TABLE[storeId] || {};

  let regularTotal = 0;
  let couponSavings = 0;
  let availableCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const missingItems: UserShoppingItem[] = [];

  const itemPrices = items.map((userItem) => {
    const priceRecord = storePrices[userItem.catalogItemId];

    if (!priceRecord) {
      outOfStockCount++;
      missingItems.push(userItem);
      return {
        userItem,
        price: 0,
        originalPrice: 0,
        unitPriceLabel: 'Not stocked',
        availability: 'out_of_stock' as const,
        packageLabel: 'Item not carried at this location',
      };
    }

    if (priceRecord.availability === 'out_of_stock') {
      outOfStockCount++;
      missingItems.push(userItem);
    } else if (priceRecord.availability === 'low_stock') {
      lowStockCount++;
      availableCount++;
    } else {
      availableCount++;
    }

    // Regional price index adjustment
    let mult = 1.0;
    if (region) {
      if (userItem.category === 'Produce') mult = region.produceMultiplier;
      else if (userItem.category === 'Meat & Seafood') mult = region.meatMultiplier;
      else if (userItem.category === 'Dairy & Eggs') mult = region.dairyMultiplier;
      else mult = region.overallMultiplier;
    }

    // Base unit price: sale price if active, else regular price, scaled by regional index
    const baseUnitPrice = priceRecord.salePrice ?? priceRecord.regularPrice;
    const unitPrice = +(baseUnitPrice * mult).toFixed(2);
    const itemSubtotal = +(unitPrice * userItem.quantity).toFixed(2);
    regularTotal += itemSubtotal;

    // Check if user has an active clipped coupon for this store and item
    const applicableCoupon = couponsList.find(
      (c) =>
        c.storeId === storeId &&
        c.appliedItemId === userItem.catalogItemId &&
        clippedCouponIds.has(c.id)
    );

    let itemCouponSavings = 0;
    if (applicableCoupon) {
      if (applicableCoupon.discountType === 'fixed') {
        itemCouponSavings = Math.min(itemSubtotal, applicableCoupon.discountValue);
      } else if (applicableCoupon.discountType === 'percent') {
        itemCouponSavings = +(itemSubtotal * applicableCoupon.discountValue).toFixed(2);
      }
      couponSavings += itemCouponSavings;
    }

    const finalItemPrice = +(itemSubtotal - itemCouponSavings).toFixed(2);

    const regionalLabel = mult !== 1.0
      ? `$${unitPrice.toFixed(2)} (${region?.shortLabel})`
      : priceRecord.unitPriceLabel;

    return {
      userItem,
      price: finalItemPrice,
      originalPrice: itemSubtotal,
      unitPriceLabel: regionalLabel,
      couponApplied: applicableCoupon,
      availability: priceRecord.availability,
      isClubBulk: priceRecord.isClubBulk,
      packageLabel: priceRecord.packageDescription,
    };
  });

  const finalTotal = +(regularTotal - couponSavings).toFixed(2);

  return {
    storeId,
    store,
    itemsAvailableCount: availableCount,
    itemsLowStockCount: lowStockCount,
    itemsOutOfStockCount: outOfStockCount,
    regularTotal: +regularTotal.toFixed(2),
    couponSavings: +couponSavings.toFixed(2),
    finalTotal: Math.max(0, finalTotal),
    missingItems,
    itemPrices,
  };
}

// Compute fuel cost for given miles with bounds protection
export function calculateFuelCost(miles: number, settings: RouteSettings): number {
  const safeMiles = Math.max(0, Math.min(500, Number(miles) || 0));
  const safeMpg = Math.max(5, Math.min(150, Number(settings?.vehicleMpg) || 25));
  const safeGasPrice = Math.max(0.5, Math.min(25, Number(settings?.gasPricePerGallon) || 3.45));
  const gallons = safeMiles / safeMpg;
  return +(gallons * safeGasPrice).toFixed(2);
}

// Find optimal waypoint ordering starting and ending at 'home'
// Hardened against factorial permutation bomb
export function optimizeWaypoints(
  storeIds: StoreId[]
): { orderedIds: StoreId[]; totalMiles: number; totalMinutes: number } {
  // Deduplicate and filter valid stores
  const uniqueStores = Array.from(new Set(storeIds)).filter((id): id is StoreId => Boolean(STORES_DATA[id]));
  if (uniqueStores.length === 0) return { orderedIds: [], totalMiles: 0, totalMinutes: 0 };
  if (uniqueStores.length === 1) {
    const s = uniqueStores[0];
    const roundTripMiles = +(STORES_DATA[s].distanceMiles * 2).toFixed(1);
    const roundTripMins = STORES_DATA[s].drivingMinutes * 2;
    return { orderedIds: [s], totalMiles: roundTripMiles, totalMinutes: roundTripMins };
  }

  // If > 4 stores, use nearest neighbor heuristic to avoid factorial CPU lock
  if (uniqueStores.length > 4) {
    const remaining = [...uniqueStores];
    const ordered: StoreId[] = [];
    let current: StoreId | 'home' = 'home';
    let totalDist = 0;

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minD = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = getStoreDistance(current, remaining[i]);
        if (d < minD) {
          minD = d;
          nearestIdx = i;
        }
      }
      totalDist += minD;
      current = remaining[nearestIdx];
      ordered.push(remaining[nearestIdx]);
      remaining.splice(nearestIdx, 1);
    }
    totalDist += getStoreDistance(current, 'home');
    const totalMiles = +totalDist.toFixed(1);
    return { orderedIds: ordered, totalMiles, totalMinutes: Math.round(totalMiles * 2.3) };
  }

  // Exact TSP for small sets (<= 4 stores)
  const permutations = (arr: StoreId[]): StoreId[][] => {
    if (arr.length <= 1) return [arr];
    const result: StoreId[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const p of permutations(rest)) {
        result.push([arr[i], ...p]);
      }
    }
    return result;
  };

  const allPerms = permutations(uniqueStores);
  let bestPerm = allPerms[0];
  let minDistance = Infinity;

  for (const perm of allPerms) {
    let dist = getStoreDistance('home', perm[0]);
    for (let i = 0; i < perm.length - 1; i++) {
      dist += getStoreDistance(perm[i], perm[i + 1]);
    }
    dist += getStoreDistance(perm[perm.length - 1], 'home');

    if (dist < minDistance) {
      minDistance = dist;
      bestPerm = perm;
    }
  }

  const totalMiles = +minDistance.toFixed(1);
  const totalMinutes = Math.round(totalMiles * 2.3);

  return {
    orderedIds: bestPerm,
    totalMiles,
    totalMinutes,
  };
}

// Build plan for a given set of allowed stores
export function buildRoutePlanForStoreSet(
  planId: RouteStrategyPlan['id'],
  title: string,
  subtitle: string,
  description: string,
  allowedStores: StoreId[],
  items: UserShoppingItem[],
  clippedCouponIds: Set<string>,
  couponsList: StoreCoupon[],
  baselineMaxCost: number,
  settings: RouteSettings
): RouteStrategyPlan {
  if (items.length === 0 || allowedStores.length === 0) {
    return {
      id: planId,
      title,
      subtitle,
      description,
      stops: [],
      groceryTotal: 0,
      couponTotalSavings: 0,
      totalDistanceMiles: 0,
      totalDrivingMinutes: 0,
      fuelCost: 0,
      netCost: 0,
      netSavingsVsBaseline: 0,
      allFulfilled: false,
    };
  }

  const activeRegion = settings?.region || DEFAULT_REGION;

  // Pre-calculate prices per item at each allowed store
  const storeBaskets = allowedStores.map((storeId) =>
    calculateStoreBasket(storeId, items, clippedCouponIds, couponsList, activeRegion)
  );

  // Group items to the best store among allowed stores
  const storeAllocations: Record<
    StoreId,
    {
      userItem: UserShoppingItem;
      price: number;
      savingsVsAverage: number;
      couponApplied?: StoreCoupon;
      aisle: string;
      checked: boolean;
    }[]
  > = {
    walmart: [],
    costco: [],
    aldi: [],
    kroger: [],
    frys: [],
    safeway: [],
    bashas: [],
  };

  let allFulfilled = true;

  items.forEach((userItem) => {
    let cheapestStoreId: StoreId | null = null;
    let lowestPrice = Infinity;
    let bestCoupon: StoreCoupon | undefined = undefined;
    let aisle = 'General';

    // Find cheapest available price among allowed stores
    for (const b of storeBaskets) {
      const pRecord = b.itemPrices.find((ip) => ip.userItem.id === userItem.id);
      if (pRecord && pRecord.availability !== 'out_of_stock') {
        if (pRecord.price < lowestPrice) {
          lowestPrice = pRecord.price;
          cheapestStoreId = b.storeId;
          bestCoupon = pRecord.couponApplied;
          const rawPrice = STORE_PRICING_TABLE[b.storeId]?.[userItem.catalogItemId];
          aisle = rawPrice?.aisle || 'Grocery';
        }
      }
    }

    if (!cheapestStoreId) {
      // Not in stock anywhere in this subset: pick first allowed as fallback
      cheapestStoreId = allowedStores[0];
      lowestPrice = 0;
      allFulfilled = false;
    }

    // Calculate savings vs average across all stores
    const avgPrice =
      storeBaskets.reduce((acc, b) => {
        const ip = b.itemPrices.find((p) => p.userItem.id === userItem.id);
        return acc + (ip ? ip.price : 0);
      }, 0) / (storeBaskets.length || 1);

    const savingsVsAverage = Math.max(0, +(avgPrice - lowestPrice).toFixed(2));

    storeAllocations[cheapestStoreId].push({
      userItem,
      price: lowestPrice,
      savingsVsAverage,
      couponApplied: bestCoupon,
      aisle,
      checked: false,
    });
  });

  // Keep only stores that actually have items allocated to them
  const activeStoreIds = allowedStores.filter((sid) => storeAllocations[sid].length > 0);

  // Waypoint optimization
  const { orderedIds, totalMiles, totalMinutes } = optimizeWaypoints(activeStoreIds);

  let groceryTotal = 0;
  let couponTotalSavings = 0;

  const stops: OptimizedStop[] = orderedIds.map((sid, idx) => {
    const store = STORES_DATA[sid];
    const stopItems = storeAllocations[sid];
    const stopSubtotal = +stopItems.reduce((acc, i) => acc + i.price, 0).toFixed(2);
    const stopCouponSavings = +stopItems
      .filter((i) => i.couponApplied)
      .reduce((acc, i) => acc + (i.couponApplied?.discountValue || 0), 0)
      .toFixed(2);

    groceryTotal += stopSubtotal;
    couponTotalSavings += stopCouponSavings;

    const prevStop = idx === 0 ? 'home' : orderedIds[idx - 1];
    const legMiles = getStoreDistance(prevStop, sid);
    const legMins = Math.round(legMiles * 2.3);

    return {
      store,
      stopNumber: idx + 1,
      items: stopItems,
      subtotal: stopSubtotal,
      couponSavings: stopCouponSavings,
      finalTotal: stopSubtotal,
      legDistanceMiles: legMiles,
      legDrivingMinutes: legMins,
    };
  });

  const fuelCost = calculateFuelCost(totalMiles, settings);
  const netCost = +(groceryTotal + fuelCost).toFixed(2);
  const netSavingsVsBaseline = Math.max(0, +(baselineMaxCost - netCost).toFixed(2));

  return {
    id: planId,
    title,
    subtitle,
    description,
    stops,
    groceryTotal: +groceryTotal.toFixed(2),
    couponTotalSavings: +couponTotalSavings.toFixed(2),
    totalDistanceMiles: totalMiles,
    totalDrivingMinutes: totalMinutes,
    fuelCost,
    netCost,
    netSavingsVsBaseline,
    allFulfilled,
  };
}

// Generate all standard plans: Single Cheapest, 2-Stop Optimal, 3-Stop Max Savings
export function generateAllRoutePlans(
  items: UserShoppingItem[],
  clippedCouponIds: Set<string>,
  couponsList: StoreCoupon[],
  settings: RouteSettings = DEFAULT_ROUTE_SETTINGS
): {
  singleCheapest: RouteStrategyPlan;
  twoStopOptimal: RouteStrategyPlan;
  threeStopMax: RouteStrategyPlan;
  storeSummaries: StoreBasketSummary[];
} {
  const allStoreIds: StoreId[] = ['walmart', 'costco', 'aldi', 'kroger', 'frys', 'safeway', 'bashas'];

  const activeRegion = settings?.region || DEFAULT_REGION;
  const storeSummaries = allStoreIds.map((sid) =>
    calculateStoreBasket(sid, items, clippedCouponIds, couponsList, activeRegion)
  );

  // Find baseline highest price (worst single store)
  const maxStoreTotal = Math.max(...storeSummaries.map((s) => s.finalTotal), 10);
  const baselineMaxCost = +(maxStoreTotal + 5.0).toFixed(2); // with fuel buffer

  // 1. Single Cheapest Store
  const sortedSingle = [...storeSummaries].sort((a, b) => {
    // Favor availability first, then total
    if (b.itemsAvailableCount !== a.itemsAvailableCount) {
      return b.itemsAvailableCount - a.itemsAvailableCount;
    }
    return a.finalTotal - b.finalTotal;
  });

  const bestSingleStoreId = sortedSingle[0]?.storeId || 'aldi';
  const singleCheapest = buildRoutePlanForStoreSet(
    'single_cheapest',
    'Single-Stop Quick Run',
    `Shop 100% at ${STORES_DATA[bestSingleStoreId].name}`,
    'Fastest overall trip. Minimal drive time and zero multi-store parking hassles.',
    [bestSingleStoreId],
    items,
    clippedCouponIds,
    couponsList,
    baselineMaxCost,
    settings
  );

  // 2. Best 2-Stop Pair (Evaluate all pairs to maximize net savings including gas)
  let bestPair: [StoreId, StoreId] = ['aldi', 'walmart'];
  let lowestTwoNetCost = Infinity;

  for (let i = 0; i < allStoreIds.length; i++) {
    for (let j = i + 1; j < allStoreIds.length; j++) {
      const pair: [StoreId, StoreId] = [allStoreIds[i], allStoreIds[j]];
      const trialPlan = buildRoutePlanForStoreSet(
        'two_stop_optimal',
        '2-Stop',
        '',
        '',
        pair,
        items,
        clippedCouponIds,
        couponsList,
        baselineMaxCost,
        settings
      );
      if (trialPlan.netCost < lowestTwoNetCost) {
        lowestTwoNetCost = trialPlan.netCost;
        bestPair = pair;
      }
    }
  }

  const twoStopOptimal = buildRoutePlanForStoreSet(
    'two_stop_optimal',
    'Balanced 2-Stop Sweet Spot',
    `Split between ${STORES_DATA[bestPair[0]].name} & ${STORES_DATA[bestPair[1]].name}`,
    'The sweet spot between steep grocery discounts and reasonable driving mileage.',
    bestPair,
    items,
    clippedCouponIds,
    couponsList,
    baselineMaxCost,
    settings
  );

  // 3. Best 3-Stop Combo (Maximum grocery price savings)
  // High-synergy triad: ALDI (produce & staples) + Costco (bulk meats/dairy) + Fry's/Walmart (brand deals)
  const threeStoreSubset: StoreId[] = ['aldi', 'costco', 'frys'];
  const threeStopMax = buildRoutePlanForStoreSet(
    'three_stop_max_savings',
    'Maximum Savings 3-Stop Tour',
    `Split across ${STORES_DATA[threeStoreSubset[0]].brand}, ${STORES_DATA[threeStoreSubset[1]].brand} & ${STORES_DATA[threeStoreSubset[2]].brand}`,
    'Captures the absolute rock-bottom shelf price on every item on your list.',
    threeStoreSubset,
    items,
    clippedCouponIds,
    couponsList,
    baselineMaxCost,
    settings
  );

  return {
    singleCheapest,
    twoStopOptimal,
    threeStopMax,
    storeSummaries,
  };
}
