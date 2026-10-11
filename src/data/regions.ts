export interface RegionProfile {
  id: string;
  name: string;
  shortLabel: string;
  stateCode: string;
  city: string;
  zipCode: string;
  overallMultiplier: number;
  produceMultiplier: number;
  meatMultiplier: number;
  dairyMultiplier: number;
  gasPricePerGallon: number;
  description: string;
  regionalNotes: string;
  bannerNotes: {
    frys: string;
    safeway: string;
    bashas: string;
  };
}

export const REGIONS_DATA: RegionProfile[] = [
  {
    id: 'az_phoenix',
    name: 'Phoenix Metro, Arizona',
    shortLabel: 'Phoenix, AZ',
    stateCode: 'AZ',
    city: 'Phoenix',
    zipCode: '85008',
    overallMultiplier: 1.0,
    produceMultiplier: 1.0,
    meatMultiplier: 1.0,
    dairyMultiplier: 1.0,
    gasPricePerGallon: 3.45,
    description: 'Hometown market where all 7 banners operate locally in the same market radius.',
    regionalNotes: 'Central distribution hub. Bananas ~$0.58/lb, whole milk ~$2.98/gal.',
    bannerNotes: {
      frys: "Fry's Food Stores (Kroger division primary Southwest banner)",
      safeway: 'Safeway Southwest division',
      bashas: "Bashas' Supermarkets (Arizona homegrown since 1932)",
    },
  },
  {
    id: 'ca_los_angeles',
    name: 'Greater Los Angeles, California',
    shortLabel: 'Los Angeles, CA',
    stateCode: 'CA',
    city: 'Los Angeles',
    zipCode: '90012',
    overallMultiplier: 1.22,
    produceMultiplier: 1.16,
    meatMultiplier: 1.25,
    dairyMultiplier: 1.28,
    gasPricePerGallon: 4.89,
    description: 'High cost of living market with elevated dairy, meat, and statewide transport fuel costs.',
    regionalNotes: 'Bananas ~$0.79/lb, whole milk ~$4.19/gal, gas ~$4.89/gal.',
    bannerNotes: {
      frys: "Ralphs / Food 4 Less (California Kroger banner equivalent to Fry's)",
      safeway: 'Vons / Safeway (Albertsons Southern California division)',
      bashas: "Stater Bros / Bristol Farms (California regional butcher grocer equivalent to Bashas')",
    },
  },
  {
    id: 'il_chicago',
    name: 'Chicago Metro, Illinois',
    shortLabel: 'Chicago, IL',
    stateCode: 'IL',
    city: 'Chicago',
    zipCode: '60601',
    overallMultiplier: 1.04,
    produceMultiplier: 1.02,
    meatMultiplier: 1.05,
    dairyMultiplier: 0.98,
    gasPricePerGallon: 3.68,
    description: 'Midwest agricultural basin with strong dairy/grain pricing, moderate fuel costs.',
    regionalNotes: 'Bananas ~$0.59/lb, whole milk ~$2.89/gal, gas ~$3.68/gal.',
    bannerNotes: {
      frys: "Mariano's / Kroger (Chicago Kroger division equivalent to Fry's)",
      safeway: 'Jewel-Osco (Albertsons flagship Midwest division)',
      bashas: "Sunset Foods / Pete's Fresh Market (Midwest regional grocer equivalent to Bashas')",
    },
  },
  {
    id: 'tx_dallas',
    name: 'Dallas-Fort Worth, Texas',
    shortLabel: 'Dallas, TX',
    stateCode: 'TX',
    city: 'Dallas',
    zipCode: '75201',
    overallMultiplier: 0.93,
    produceMultiplier: 0.94,
    meatMultiplier: 0.92,
    dairyMultiplier: 0.95,
    gasPricePerGallon: 2.95,
    description: 'Low-tax market with significant refinery fuel savings and competitive supermarket density.',
    regionalNotes: 'Bananas ~$0.52/lb, whole milk ~$2.69/gal, gas ~$2.95/gal.',
    bannerNotes: {
      frys: "Kroger Texas division (Direct Kroger counterpart)",
      safeway: 'Tom Thumb / Albertsons (Texas division)',
      bashas: "Brookshire's / H-E-B partner tier (Independent regional grocer equivalent)",
    },
  },
  {
    id: 'ny_metro',
    name: 'New York Metro / Tri-State, NY',
    shortLabel: 'New York, NY',
    stateCode: 'NY',
    city: 'New York',
    zipCode: '10001',
    overallMultiplier: 1.26,
    produceMultiplier: 1.24,
    meatMultiplier: 1.30,
    dairyMultiplier: 1.25,
    gasPricePerGallon: 3.85,
    description: 'High distribution and store real estate overhead market with top-tier retail prices.',
    regionalNotes: 'Bananas ~$0.89/lb, whole milk ~$4.39/gal, gas ~$3.85/gal.',
    bannerNotes: {
      frys: 'Kroger Delivery / Stop & Shop regional network',
      safeway: 'Acme Markets / Kings (Albertsons Northeast banner)',
      bashas: "Fairway / Key Food (Tri-state independent grocer equivalent)",
    },
  },
  {
    id: 'wa_seattle',
    name: 'Seattle-Bellevue, Washington',
    shortLabel: 'Seattle, WA',
    stateCode: 'WA',
    city: 'Seattle',
    zipCode: '98101',
    overallMultiplier: 1.18,
    produceMultiplier: 1.12,
    meatMultiplier: 1.22,
    dairyMultiplier: 1.20,
    gasPricePerGallon: 4.45,
    description: 'Pacific Northwest market with high minimum wage and West Coast shipping costs.',
    regionalNotes: 'Bananas ~$0.72/lb, whole milk ~$3.89/gal, gas ~$4.45/gal.',
    bannerNotes: {
      frys: 'QFC / Fred Meyer (Pacific Northwest Kroger banner)',
      safeway: 'Safeway Seattle / Albertsons Northwest',
      bashas: "Metropolitan Market / Town & Country (Regional PNW grocer)",
    },
  },
];

export const DEFAULT_REGION = REGIONS_DATA[0];
