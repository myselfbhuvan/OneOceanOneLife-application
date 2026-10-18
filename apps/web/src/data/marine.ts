/**
 * Static marine fisheries dataset for the Southern India dashboard.
 *
 * Figures mirror the official/state reference data seeded by
 * `apps/api/locations/management/commands/seed_fisheries_profiles.py`
 * (verified against `docs/O3L_Southern_Coastal_States_FINAL_Database.xlsx`).
 * The dashboard renders this dataset directly (works without the API) and
 * merges live O3L contributor stats when `/api/v1/state-profiles/` is up.
 */

export type StateSlug = "andhra-pradesh" | "karnataka" | "kerala" | "tamil-nadu";

export type Confidence = "high" | "moderate" | "verify";

export const STATE_SLUGS: StateSlug[] = ["andhra-pradesh", "karnataka", "kerala", "tamil-nadu"];

export const STATE_COLORS: Record<StateSlug, string> = {
  "andhra-pradesh": "#38BDF8",
  karnataka: "#A78BFA",
  kerala: "#34D399",
  "tamil-nadu": "#F59E0B",
};

export const STATE_FILL: Record<StateSlug, string> = {
  "andhra-pradesh": "rgba(56,189,248,0.22)",
  karnataka: "rgba(167,139,250,0.22)",
  kerala: "rgba(52,211,153,0.22)",
  "tamil-nadu": "rgba(245,158,11,0.26)",
};

export interface AgencyItem {
  name: string;
  detail: string;
}

export interface LeanPeriod {
  district?: string;
  region: string;
  period: string;
  reason: string;
  confidence: Confidence;
  confidenceLabel: string;
}

export interface ReliefLine {
  label: string;
  value: string;
}

export interface StateProfile {
  slug: StateSlug;
  state: string;
  short: string;
  lat: number;
  lng: number;
  coastalLengthKm: string;
  eez: string;
  shelf: string;
  coastalDistricts: number;
  fishingVillages: string;
  fisherfolk: string;
  welfareRegistered: string;
  crafts: {
    mechanized: number;
    motorized: number;
    nonMotorized: number;
    total: number;
  };
  agencies: AgencyItem[];
  relief: {
    banRelief: ReliefLine[];
    period: string;
    highlights: string[];
    livelihood: string;
    qualification?: string;
  };
  lean: LeanPeriod[];
  dataNote: string;
}

export const DATA_NOTE =
  "Data are from the latest official/state sources available for each indicator. Reference years differ between states and indicators; figures should not be interpreted as a single-year census.";

export const SEASONAL_NOTE =
  "Seasonal information should be interpreted as indicative rather than a uniform district-level rule unless supported by a current official notification.";

export const STATE_PROFILES: StateProfile[] = [
  {
    slug: "andhra-pradesh",
    state: "Andhra Pradesh",
    short: "AP",
    lat: 15.8,
    lng: 80.7,
    coastalLengthKm: "974",
    eez: "~0.31 million km²",
    shelf: "~33,000",
    coastalDistricts: 9,
    fishingVillages: "533",
    fisherfolk: "~5.17 lakh",
    welfareRegistered: "Not verified from current official source",
    crafts: { mechanized: 6965, motorized: 12078, nonMotorized: 1176, total: 20219 },
    agencies: [
      { name: "AFCOF", detail: "Andhra Pradesh State Fishermen Cooperative Societies Federation" },
      { name: "FCS", detail: "Primary and district-level fishermen cooperative societies" },
      { name: "Matsya Mitra Groups (MMGs)", detail: "Fisherwomen/community livelihood groups" },
      {
        name: "Fishing Harbour & Landing Centre Development",
        detail: "Development and management of marine fisheries infrastructure",
      },
      {
        name: "Fisheries Extension & Welfare Services",
        detail: "Fishermen welfare, subsidies, fishing-ban relief and livelihood support",
      },
    ],
    relief: {
      banRelief: [
        { label: "Fishing Ban Relief", value: "₹20,000 per eligible sea-going fisher family" },
      ],
      period: "15 April – 14 June (61 days)",
      highlights: [
        "State assistance increased from ₹10,000 to ₹20,000 per family from 2025–26 (Department of Finance).",
        "Annual marine fishing ban of 61 days covers the entire Andhra coast.",
      ],
      livelihood: "PMMSY livelihood and nutritional support during the ban/lean period.",
    },
    lean: [
      {
        region: "Coastal Andhra – generally",
        period: "April–May",
        reason:
          "The annual fishing-ban period makes April–May a particularly low-activity period for mechanised fisheries. Historical CMFRI analysis identifies April–May as the lean period, while November–January is the peak season. (CMFRI Digital Repository)",
        confidence: "high",
        confidenceLabel:
          "Good – avoid assigning different months to every district without district-specific data",
      },
    ],
    dataNote: DATA_NOTE,
  },
  {
    slug: "karnataka",
    state: "Karnataka",
    short: "KA",
    lat: 13.5,
    lng: 74.7,
    coastalLengthKm: "300",
    eez: "87,000 km²",
    shelf: "27,000",
    coastalDistricts: 3,
    fishingVillages: "162",
    fisherfolk: "~1.58 lakh",
    welfareRegistered: "Not verified from current official source",
    crafts: { mechanized: 2225, motorized: 5879, nonMotorized: 3780, total: 11884 },
    agencies: [
      { name: "KFDC", detail: "Karnataka Fisheries Development Corporation" },
      { name: "KSCFF", detail: "Karnataka State Co-operative Fisheries Federation" },
      { name: "Directorate of Fisheries", detail: "Marine and inland fisheries development and welfare" },
      { name: "Fisheries Extension/District Offices", detail: "Field-level implementation and fisher services" },
      {
        name: "Fishing Harbour & Marine Infrastructure",
        detail: "Harbour, landing and related infrastructure development",
      },
    ],
    relief: {
      banRelief: [
        {
          label: "Matsya Asha Kiran",
          value: "State top-up/support for fishermen affected by seasonal fishing restrictions",
        },
        { label: "Savings-cum-Relief Scheme", value: "₹6,000 total (distributed during 3 lean months)" },
      ],
      period: "Lean months of the monsoon closed season (west coast 1 June – 31 July)",
      highlights: [
        "Savings-cum-Relief Scheme: fisher contribution ₹1,500 + Central ₹1,500 + State ₹3,000 = ₹6,000.",
        "Distribution is spread over three lean months.",
        "The State increased its contribution under Matsya Asha Kiran from ₹1,500 to ₹3,000 (Department of Finance).",
      ],
      livelihood: "Matsya Asha Kiran state support for fishers affected by seasonal restrictions.",
    },
    lean: [
      {
        district: "Uttara Kannada",
        region: "Uttara Kannada",
        period: "June–July",
        reason:
          "Southwest monsoon and seasonal fishing restrictions reduce fishing activity. The present uniform west-coast ban is 1 June – 31 July. (MPEDA)",
        confidence: "moderate",
        confidenceLabel: "Good for seasonal closure; moderate for “lean” classification",
      },
      {
        district: "Udupi",
        region: "Udupi",
        period: "June–July",
        reason: "Monsoon conditions and fishing restrictions.",
        confidence: "moderate",
        confidenceLabel: "Good for seasonal closure; moderate for “lean” classification",
      },
      {
        district: "Dakshina Kannada",
        region: "Dakshina Kannada",
        period: "June–July",
        reason: "Monsoon conditions and fishing restrictions.",
        confidence: "moderate",
        confidenceLabel: "Good for seasonal closure; moderate for “lean” classification",
      },
    ],
    dataNote: DATA_NOTE,
  },
  {
    slug: "kerala",
    state: "Kerala",
    short: "KL",
    lat: 9.4,
    lng: 76.4,
    coastalLengthKm: "589.5–590",
    eez: "218,536 km²",
    shelf: "39,139",
    coastalDistricts: 9,
    fishingVillages: "220–222",
    fisherfolk: "10.49 lakh",
    welfareRegistered: "3,09,806 registered fisherfolk",
    crafts: { mechanized: 4016, motorized: 13868, nonMotorized: 3800, total: 21684 },
    agencies: [
      { name: "Matsyafed", detail: "Kerala State Co-operative Federation for Fisheries Development Ltd" },
      { name: "KFWFB", detail: "Kerala Fishermen’s Welfare Fund Board" },
      { name: "ADAK", detail: "Agency for Development of Aquaculture" },
      { name: "SFMC", detail: "State Fisheries Management Council" },
      { name: "KSCADC", detail: "Kerala State Coastal Area Development Corporation" },
      { name: "SAF", detail: "Society for Assistance to Fisherwomen" },
      { name: "KAVIL", detail: "Kerala Aqua Ventures International Ltd" },
      { name: "Marine Enforcement Cell", detail: "Fisheries marine enforcement and surveillance" },
    ],
    relief: {
      banRelief: [
        {
          label: "Fishing / Trawl-Ban Relief",
          value:
            "Free ration support for workers of mechanised boats, peeling workers and allied workers during the trawl-ban period",
        },
        { label: "Savings-cum-Relief Scheme", value: "₹4,500 support (₹1,500 per month for three months)" },
      ],
      period: "Monsoon trawl-ban period (generally June–July; 2026 order covers the ban period)",
      highlights: [
        "Free ration during the 2026 trawl-ban period for mechanised-boat workers, peeling workers and allied workers (Fisheries Department Kerala).",
        "Savings-cum-Relief Scheme: ₹4,500 for marine fishers, paid as ₹1,500 in each of three months.",
      ],
      livelihood: "Monsoon fishing conditions and specific trawl-ban arrangements may vary.",
      qualification:
        "Monsoon fishing conditions and specific trawl-ban arrangements may vary — mud-bank (chakara) and other seasonal fisheries can provide good fishing opportunities.",
    },
    lean: [
      {
        region: "Kerala coast – generally",
        period: "June–July",
        reason:
          "Southwest monsoon, rough sea conditions and seasonal fishing restrictions. The present national west-coast closure is 1 June – 31 July, while Kerala's specific trawl-ban arrangements can differ. (MPEDA)",
        confidence: "moderate",
        confidenceLabel: "Good for seasonal restriction; moderate for general “lean” period",
      },
      {
        district: "Alappuzha",
        region: "Alappuzha",
        period: "Monsoon period, especially June–July",
        reason:
          "Important qualification: monsoon mud-bank (chakara) fisheries can provide good fishing opportunities, so “lean” is not uniform throughout Kerala. (Sage Journals)",
        confidence: "verify",
        confidenceLabel: "Use with qualification",
      },
      {
        district: "Ernakulam",
        region: "Ernakulam",
        period: "Monsoon period, especially June–July",
        reason:
          "Monsoon affects fishing activity, but mud-bank and prawn fisheries can provide alternative opportunities. (ResearchGate)",
        confidence: "verify",
        confidenceLabel: "Use with qualification",
      },
      {
        district: "Thrissur",
        region: "Thrissur",
        period: "Monsoon period, especially June–July",
        reason: "Seasonal/monsoon effects; local fisheries can vary. (ResearchGate)",
        confidence: "verify",
        confidenceLabel: "Use with qualification",
      },
    ],
    dataNote: DATA_NOTE,
  },
  {
    slug: "tamil-nadu",
    state: "Tamil Nadu",
    short: "TN",
    lat: 10.3,
    lng: 79.9,
    coastalLengthKm: "1,076",
    eez: "~190,000 km²",
    shelf: "41,412",
    coastalDistricts: 14,
    fishingVillages: "608",
    fisherfolk: "10.48 lakh",
    welfareRegistered: "4,38,906",
    crafts: { mechanized: 5824, motorized: 41716, nonMotorized: 4119, total: 51659 },
    agencies: [
      { name: "TNFDC", detail: "Tamil Nadu Fisheries Development Corporation" },
      { name: "TAFCOFED", detail: "Tamil Nadu State Apex Fisheries Co-operative Federation" },
      { name: "TNFWB", detail: "Tamil Nadu Fishermen Welfare Board" },
      { name: "MEW", detail: "Marine Enforcement Wing" },
      { name: "FHPC", detail: "Fishing Harbour Project Circle" },
    ],
    relief: {
      banRelief: [
        {
          label: "Fishing Ban Period Assistance",
          value: "₹8,000 per eligible marine fisher family",
        },
        {
          label: "Special Allowance during Fishing Lean Period",
          value: "₹7,000 per traditional fisher family (2026–27 budget)",
        },
      ],
      period: "East coast: 15 April – 14 June · Kanniyakumari west coast: 1 June – 31 July",
      highlights: [
        "Tamil Nadu's 2026–27 Budget increased lean-period assistance from ₹6,000 to ₹7,000.",
        "Ban-period assistance of ₹8,000 is paid to eligible marine fisher families.",
      ],
      livelihood: "Lean-period assistance is specifically intended for the northeast-monsoon lean period.",
    },
    lean: [
      {
        region: "Northern & central/eastern coast",
        period: "October–March, varying by district",
        reason:
          "Northeast monsoon, rough-sea conditions and weather warnings can reduce fishing days. The State's lean-period assistance is specifically intended for this period. (State budget reference)",
        confidence: "high",
        confidenceLabel: "Good",
      },
      {
        district: "Thoothukudi",
        region: "Thoothukudi",
        period: "Around April onward",
        reason:
          "Historical state policy documents indicate that the lean season in Thoothukudi begins around April.",
        confidence: "verify",
        confidenceLabel: "Good historical evidence; verify current district schedule",
      },
      {
        district: "Tirunelveli",
        region: "Tirunelveli",
        period: "Around April onward",
        reason:
          "Historical state policy documents similarly identify the lean season as commencing around April.",
        confidence: "verify",
        confidenceLabel: "Good historical evidence; verify current district schedule",
      },
      {
        district: "Kanniyakumari",
        region: "Kanniyakumari – east coast",
        period: "April–June fishing-ban period",
        reason: "East-coast seasonal closure applies. (MPEDA)",
        confidence: "high",
        confidenceLabel: "Good for ban period",
      },
      {
        district: "Kanniyakumari",
        region: "Kanniyakumari – west coast",
        period: "June–July",
        reason: "West-coast seasonal closure applies to the western part of Kanniyakumari.",
        confidence: "high",
        confidenceLabel: "Good for ban period",
      },
    ],
    dataNote: DATA_NOTE,
  },
];

export function getProfile(slug: StateSlug): StateProfile {
  return STATE_PROFILES.find((p) => p.slug === slug)!;
}

/* ------------------------------------------------------------------ */
/* Comparison table                                                    */
/* ------------------------------------------------------------------ */

export interface ComparisonRow {
  indicator: string;
  unit?: string;
  values: Record<StateSlug, string>;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    indicator: "Coastal length",
    unit: "km",
    values: {
      "andhra-pradesh": "974",
      karnataka: "300",
      kerala: "589.5–590",
      "tamil-nadu": "1,076",
    },
  },
  {
    indicator: "Exclusive Economic Zone",
    values: {
      "andhra-pradesh": "~0.31 million km²",
      karnataka: "87,000 km²",
      kerala: "218,536 km²",
      "tamil-nadu": "~190,000 km²",
    },
  },
  {
    indicator: "Continental shelf",
    unit: "km²",
    values: {
      "andhra-pradesh": "~33,000",
      karnataka: "27,000",
      kerala: "39,139",
      "tamil-nadu": "41,412",
    },
  },
  {
    indicator: "Coastal districts",
    values: {
      "andhra-pradesh": "9",
      karnataka: "3",
      kerala: "9",
      "tamil-nadu": "14",
    },
  },
  {
    indicator: "Marine fishing villages",
    values: {
      "andhra-pradesh": "533",
      karnataka: "162",
      kerala: "220–222",
      "tamil-nadu": "608",
    },
  },
  {
    indicator: "Marine fisherfolk population",
    values: {
      "andhra-pradesh": "~5.17 lakh",
      karnataka: "~1.58 lakh",
      kerala: "10.49 lakh",
      "tamil-nadu": "10.48 lakh",
    },
  },
  {
    indicator: "Mechanized crafts",
    values: {
      "andhra-pradesh": "6,965",
      karnataka: "2,225",
      kerala: "4,016",
      "tamil-nadu": "5,824",
    },
  },
  {
    indicator: "Motorized crafts",
    values: {
      "andhra-pradesh": "12,078",
      karnataka: "5,879",
      kerala: "13,868",
      "tamil-nadu": "41,716",
    },
  },
  {
    indicator: "Non-motorized crafts",
    values: {
      "andhra-pradesh": "1,176",
      karnataka: "3,780",
      kerala: "3,800",
      "tamil-nadu": "4,119",
    },
  },
  {
    indicator: "Total fishing crafts",
    values: {
      "andhra-pradesh": "20,219",
      karnataka: "11,884",
      kerala: "21,684",
      "tamil-nadu": "51,659",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Map layers                                                          */
/* ------------------------------------------------------------------ */

export type LayerGroup =
  | "Administrative & Boundaries"
  | "Fisheries Infrastructure"
  | "Fishing Activity"
  | "Seasonal Restrictions"
  | "Habitats & Ecosystems"
  | "Biodiversity & Observations"
  | "Ocean & Environment"
  | "Platform Layers";

export interface MarineLayerDef {
  id: string;
  label: string;
  group: LayerGroup;
  symbol: string;
  swatch?: string;
  defaultOn: boolean;
  source: "map" | "derived" | "workbook" | "indicative" | "platform" | "copernicus";
}

export const MARINE_LAYERS: MarineLayerDef[] = [
  // Administrative & Boundaries
  { id: "Coastal States", label: "Coastal States", group: "Administrative & Boundaries", symbol: "▣", swatch: "rgba(56,189,248,0.45)", defaultOn: true, source: "map" },
  { id: "Coastal Districts", label: "Coastal Districts", group: "Administrative & Boundaries", symbol: "▢", swatch: "rgba(255,255,255,0.7)", defaultOn: true, source: "map" },
  { id: "Coastal Length", label: "Coastal Length", group: "Administrative & Boundaries", symbol: "↔", swatch: "#22D3EE", defaultOn: true, source: "derived" },
  // Fisheries infrastructure
  { id: "Marine Fishing Villages", label: "Marine Fishing Villages", group: "Fisheries Infrastructure", symbol: "●", swatch: "#2563EB", defaultOn: true, source: "workbook" },
  { id: "Fishing Harbours", label: "Fishing Harbours", group: "Fisheries Infrastructure", symbol: "⚓", swatch: "#0F766E", defaultOn: true, source: "workbook" },
  { id: "Landing Centres", label: "Landing Centres", group: "Fisheries Infrastructure", symbol: "⚑", swatch: "#0891B2", defaultOn: false, source: "workbook" },
  { id: "Fisheries Agencies", label: "Fisheries Agencies", group: "Fisheries Infrastructure", symbol: "🏛", swatch: "#334155", defaultOn: false, source: "platform" },
  // Fishing activity
  { id: "Fishing Grounds", label: "Fishing Grounds", group: "Fishing Activity", symbol: "◎", swatch: "#7C3AED", defaultOn: true, source: "indicative" },
  { id: "Potential Fishing Zones", label: "Potential Fishing Zones (Indicative)", group: "Fishing Activity", symbol: "◉", swatch: "radial-gradient(circle, #A3E635, #16A34A)", defaultOn: false, source: "derived" },
  { id: "Fishing Crafts", label: "Fishing Crafts", group: "Fishing Activity", symbol: "🚤", swatch: "#0E7490", defaultOn: true, source: "derived" },
  { id: "Fishing Seasons", label: "Fishing Seasons", group: "Fishing Activity", symbol: "📅", swatch: "#F97316", defaultOn: false, source: "platform" },
  // Seasonal restrictions
  { id: "Fishing Ban Areas", label: "Fishing Ban Areas", group: "Seasonal Restrictions", symbol: "🔴", swatch: "rgba(220,38,38,0.55)", defaultOn: true, source: "derived" },
  { id: "Lean Fishing Periods", label: "Lean Fishing Periods", group: "Seasonal Restrictions", symbol: "🟡", swatch: "rgba(250,204,21,0.55)", defaultOn: true, source: "derived" },
  // Habitats
  { id: "Marine Habitats", label: "Marine Habitats", group: "Habitats & Ecosystems", symbol: "🌿", swatch: "rgba(163,230,53,0.4)", defaultOn: false, source: "indicative" },
  { id: "Coral Reefs", label: "Coral Reefs", group: "Habitats & Ecosystems", symbol: "🟠", swatch: "#FB923C", defaultOn: true, source: "indicative" },
  { id: "Seagrass", label: "Seagrass", group: "Habitats & Ecosystems", symbol: "🌱", swatch: "#10B981", defaultOn: false, source: "indicative" },
  { id: "Mangroves", label: "Mangroves", group: "Habitats & Ecosystems", symbol: "🌳", swatch: "#16A34A", defaultOn: true, source: "indicative" },
  { id: "Estuaries", label: "Estuaries", group: "Habitats & Ecosystems", symbol: "🌊", swatch: "#0EA5E9", defaultOn: false, source: "indicative" },
  { id: "Marine Protected Areas", label: "Marine Protected Areas", group: "Habitats & Ecosystems", symbol: "🛡", swatch: "#8B5CF6", defaultOn: true, source: "indicative" },
  // Biodiversity
  { id: "Marine Biodiversity", label: "Marine Biodiversity", group: "Biodiversity & Observations", symbol: "🧬", swatch: "#84CC16", defaultOn: false, source: "indicative" },
  { id: "Marine Mammals", label: "Marine Mammals", group: "Biodiversity & Observations", symbol: "🐬", swatch: "#6366F1", defaultOn: true, source: "indicative" },
  { id: "Sea Turtle Observations", label: "Sea Turtle Observations", group: "Biodiversity & Observations", symbol: "🐢", swatch: "#0D9488", defaultOn: true, source: "indicative" },
  // Ocean & environment
  { id: "Ocean Conditions", label: "Ocean Conditions", group: "Ocean & Environment", symbol: "🛰", swatch: "#06B6D4", defaultOn: false, source: "indicative" },
  { id: "Live Sea Temperature", label: "Sea Surface Temperature", group: "Ocean & Environment", symbol: "🌡", swatch: "linear-gradient(90deg, #313695, #74add1, #ffffbf, #f46d43, #a50026)", defaultOn: false, source: "copernicus" },
  { id: "Live Sea Salinity", label: "Sea Surface Salinity", group: "Ocean & Environment", symbol: "🧂", swatch: "linear-gradient(90deg, #440154, #31688e, #35b779, #fde725)", defaultOn: false, source: "copernicus" },
  { id: "Live Chlorophyll", label: "Chlorophyll-a", group: "Ocean & Environment", symbol: "🧪", swatch: "linear-gradient(90deg, #440154, #31688e, #35b779, #fde725)", defaultOn: false, source: "copernicus" },
  { id: "Live Ocean Swell", label: "Ocean Swell Height", group: "Ocean & Environment", symbol: "〰", swatch: "linear-gradient(90deg, #313695, #74add1, #ffffbf, #f46d43, #a50026)", defaultOn: false, source: "copernicus" },
  { id: "Live Ocean Currents", label: "Ocean Currents", group: "Ocean & Environment", symbol: "➤", swatch: "#06B6D4", defaultOn: false, source: "copernicus" },
  { id: "Marine Pollution", label: "Marine Pollution", group: "Ocean & Environment", symbol: "⚠", swatch: "#EF4444", defaultOn: false, source: "indicative" },
  // Platform (legacy O3L layers)
  { id: "Hotspots", label: "O3L Hotspots", group: "Platform Layers", symbol: "🔥", swatch: "#F97316", defaultOn: false, source: "platform" },
  { id: "Zones", label: "O3L Zones", group: "Platform Layers", symbol: "🏷", swatch: "#0E7490", defaultOn: false, source: "platform" },
  { id: "State Profiles", label: "State Profile Pins", group: "Platform Layers", symbol: "📍", swatch: "#087EA4", defaultOn: false, source: "platform" },
];

export const LAYER_GROUPS: LayerGroup[] = [
  "Administrative & Boundaries",
  "Fisheries Infrastructure",
  "Fishing Activity",
  "Seasonal Restrictions",
  "Habitats & Ecosystems",
  "Biodiversity & Observations",
  "Ocean & Environment",
  "Platform Layers",
];

export const DEFAULT_LAYERS: string[] = MARINE_LAYERS.filter((l) => l.defaultOn).map((l) => l.id);

/* ------------------------------------------------------------------ */
/* Curated indicative points (habitats, observations, grounds, …)       */
/* ------------------------------------------------------------------ */

export interface MarinePoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  state?: StateSlug;
  note?: string;
}

export const FISHING_GROUNDS: MarinePoint[] = [
  { id: "g1", name: "Srikakulam Offshore Ground", lng: 84.6, lat: 18.6, state: "andhra-pradesh", note: "Demersal & penaeid shrimp grounds along the north Andhra shelf." },
  { id: "g2", name: "Visakhapatnam Offshore Ground", lng: 83.7, lat: 17.4, state: "andhra-pradesh", note: "Shelf-edge grounds popular with mechanised trawlers." },
  { id: "g3", name: "Krishna–Godavari Offshore Ground", lng: 82.4, lat: 16.2, state: "andhra-pradesh", note: "Rich prawn and finfish grounds off the Krishna–Godavari delta." },
  { id: "g4", name: "Prakasam–Nellore Ground", lng: 80.4, lat: 15.2, state: "andhra-pradesh", note: "Central Andhra coastal fishing ground." },
  { id: "g5", name: "Karwar Ground", lng: 74.1, lat: 14.9, state: "karnataka", note: "Northern Karnataka shelf ground." },
  { id: "g6", name: "Malpe–Kapu Ground", lng: 74.7, lat: 13.3, state: "karnataka", note: "Udupi coast fishing ground used by motorised craft." },
  { id: "g7", name: "Mangalore Offshore Ground", lng: 74.8, lat: 12.8, state: "karnataka", note: "Dakshina Kannada inshore and shelf ground." },
  { id: "g8", name: "Kollam–Kochi Mid-Shelf Ground", lng: 76.0, lat: 9.4, state: "kerala", note: "Kerala mid-shelf fishing ground (50–100 m depth zone)." },
  { id: "g9", name: "Kozhikode Offshore Ground", lng: 75.6, lat: 11.3, state: "kerala", note: "North Kerala coastal fishing ground." },
  { id: "g10", name: "Kannur–Kasaragod Ground", lng: 75.1, lat: 12.4, state: "kerala", note: "Northern Kerala inshore ground." },
  { id: "g11", name: "Palk Bay Ground", lng: 79.5, lat: 9.5, state: "tamil-nadu", note: "Sheltered bay grounds for trawlers and mechanised craft." },
  { id: "g12", name: "Gulf of Mannar Ground", lng: 78.9, lat: 8.8, state: "tamil-nadu", note: "Embankment and channel grounds between Mannar Island and the TN coast." },
  { id: "g13", name: "Cuddalore–Nagapattinam Ground", lng: 80.1, lat: 11.0, state: "tamil-nadu", note: "Central Tamil Nadu coastal fishing ground." },
  { id: "g14", name: "Chennai–Ennore Offshore Ground", lng: 80.5, lat: 13.2, state: "tamil-nadu", note: "North Chennai inshore and offshore ground." },
  { id: "g15", name: "Kanyakumari Ground", lng: 77.3, lat: 7.9, state: "tamil-nadu", note: "Confluence-zone ground fished from both coasts." },
];

export const CORAL_REEFS: MarinePoint[] = [
  { id: "c1", name: "Palk Bay Coral Areas", lng: 79.4, lat: 9.3, state: "tamil-nadu", note: "Patch reefs and coral communities of Palk Bay (indicative extent)." },
  { id: "c2", name: "Gulf of Mannar Reefs", lng: 78.8, lat: 8.9, state: "tamil-nadu", note: "Fringing and patch reefs around the Gulf of Mannar islands (indicative extent)." },
  { id: "c3", name: "Mannar Channel Reefs", lng: 79.8, lat: 9.1, note: "Reef areas along the Palk Strait channel (indicative extent)." },
  { id: "c4", name: "Vaadi Reef (Pulicat–Ennore)", lng: 80.3, lat: 13.3, state: "tamil-nadu", note: "Northernmost reported coral occurrence on the east coast (indicative)." },
];

export const SEAGRASS: MarinePoint[] = [
  { id: "s1", name: "Palk Bay Seagrass Meadows", lng: 79.4, lat: 9.4, state: "tamil-nadu", note: "Seagrass beds supporting dugong grazing (indicative extent)." },
  { id: "s2", name: "Gulf of Mannar Seagrass", lng: 78.7, lat: 8.8, state: "tamil-nadu", note: "Extensive seagrass meadows between mainland and island chain." },
  { id: "s3", name: "Vembanad Seagrass", lng: 76.4, lat: 9.6, state: "kerala", note: "Backwater and estuarine seagrass patches (indicative)." },
  { id: "s4", name: "Muthupet Seagrass", lng: 79.75, lat: 10.4, state: "tamil-nadu", note: "Lagoon seagrass beds adjoining the Palk Bay coast." },
];

export const MANGROVES: MarinePoint[] = [
  { id: "m1", name: "Pichavaram Mangroves", lng: 79.8, lat: 11.4, state: "tamil-nadu", note: "One of the largest mangrove blocks of the east coast (indicative extent)." },
  { id: "m2", name: "Muthupet Mangroves", lng: 79.78, lat: 10.38, state: "tamil-nadu", note: "Lagoon mangrove system at the southern end of Palk Bay." },
  { id: "m3", name: "Vedaranyam Mangroves", lng: 79.85, lat: 10.28, state: "tamil-nadu", note: "Coastal mangrove patches along the Vedaranyam coast." },
  { id: "m4", name: "Coringa Mangroves", lng: 82.3, lat: 16.8, state: "andhra-pradesh", note: "Coringa Wildlife Sanctuary mangroves near the Godavari estuary." },
  { id: "m5", name: "Godavari Delta Mangroves", lng: 81.8, lat: 16.5, state: "andhra-pradesh", note: "Delta-front mangrove stands (indicative extent)." },
  { id: "m6", name: "Vembanad Mangroves", lng: 76.35, lat: 9.7, state: "kerala", note: "Backwater mangrove fringes of the Vembanad system." },
  { id: "m7", name: "Kadinamkulam Mangroves", lng: 76.8, lat: 8.6, state: "kerala", note: "Southern Kerala estuarine mangrove patches." },
  { id: "m8", name: "Kalkuli–Shirur Mangroves", lng: 74.9, lat: 12.9, state: "karnataka", note: "Estuarine mangrove patches of the Karnataka coast." },
];

export const ESTUARIES: MarinePoint[] = [
  { id: "e1", name: "Godavari Estuary", lng: 82.3, lat: 16.7, state: "andhra-pradesh" },
  { id: "e2", name: "Krishna Estuary", lng: 81.1, lat: 15.9, state: "andhra-pradesh" },
  { id: "e3", name: "Pulicat Estuary", lng: 80.3, lat: 13.5, state: "tamil-nadu" },
  { id: "e4", name: "Vellar–Cuddalore Estuary", lng: 79.8, lat: 11.7, state: "tamil-nadu" },
  { id: "e5", name: "Vaigai–Muthupet Lagoon", lng: 79.75, lat: 10.4, state: "tamil-nadu" },
  { id: "e6", name: "Kaveri Delta Estuary", lng: 79.85, lat: 10.7, state: "tamil-nadu" },
  { id: "e7", name: "Thamirabarani Estuary", lng: 78.1, lat: 8.8, state: "tamil-nadu" },
  { id: "e8", name: "Vembanad Estuary", lng: 76.3, lat: 9.8, state: "kerala" },
  { id: "e9", name: "Chaliyar Estuary", lng: 75.85, lat: 11.2, state: "kerala" },
  { id: "e10", name: "Bharathapuzha Estuary", lng: 75.8, lat: 10.8, state: "kerala" },
  { id: "e11", name: "Netravathi Estuary", lng: 74.85, lat: 12.85, state: "karnataka" },
  { id: "e12", name: "Sharavathi Estuary", lng: 74.5, lat: 14.1, state: "karnataka" },
];

export const PROTECTED_AREAS: MarinePoint[] = [
  { id: "p1", name: "Gulf of Mannar Marine National Park", lng: 79.2, lat: 9.1, state: "tamil-nadu", note: "Island-chain marine national park; coral, seagrass and dugong habitat (indicative extent)." },
  { id: "p2", name: "Point Calimere Wildlife Sanctuary", lng: 79.87, lat: 10.29, state: "tamil-nadu", note: "Mudflats, mangroves and olive-ridley nesting coast (indicative extent)." },
  { id: "p3", name: "Muthupet Mangrove Sanctuary", lng: 79.78, lat: 10.4, state: "tamil-nadu", note: "Protected lagoon mangrove ecosystem (indicative extent)." },
  { id: "p4", name: "Vembanad Kol Wetland Sanctuary", lng: 76.4, lat: 9.65, state: "kerala", note: "Ramsar-listed wetland of the Vembanad system (indicative extent)." },
  { id: "p5", name: "Kadalundi–Vallikkunnu Sanctuary", lng: 75.85, lat: 11.05, state: "kerala", note: "Estuarine bird and mangrove sanctuary (indicative extent)." },
  { id: "p6", name: "Coringa Wildlife Sanctuary", lng: 82.3, lat: 16.8, state: "andhra-pradesh", note: "Mangrove sanctuary and estuarine fisheries nursery (indicative extent)." },
  { id: "p7", name: "Kudremukh–Kaas Kodachadri Coastal Reserve", lng: 74.3, lat: 13.9, state: "karnataka", note: "Coastal and estuarine reserve references (indicative extent)." },
];

export const TURTLE_OBSERVATIONS: MarinePoint[] = [
  { id: "t1", name: "Dhanushkodi–Rameswaram Nesting", lng: 79.4, lat: 9.17, state: "tamil-nadu", note: "Olive ridley and green turtle nesting references (indicative)." },
  { id: "t2", name: "Marina–Ennore Nesting", lng: 80.3, lat: 13.15, state: "tamil-nadu", note: "Olive ridley nesting records along the north Chennai coast (indicative)." },
  { id: "t3", name: "Serankulam–Velankanni Nesting", lng: 79.85, lat: 10.7, state: "tamil-nadu", note: "Documented nesting beach of the Cuddalore–Nagapattinam coast (indicative)." },
  { id: "t4", name: "Point Calimere Nesting", lng: 79.87, lat: 10.3, state: "tamil-nadu", note: "Major olive-ridley nesting concentration (indicative)." },
  { id: "t5", name: "Thoothukudi Coast", lng: 78.15, lat: 8.76, state: "tamil-nadu", note: "Turtle sighting and nesting records (indicative)." },
  { id: "t6", name: "Kanniyakumari Coast", lng: 77.55, lat: 8.05, state: "tamil-nadu", note: "Green and olive ridley records at the sea-confluence coast (indicative)." },
  { id: "t7", name: "Vypin–Chellanam Coast", lng: 76.23, lat: 10.05, state: "kerala", note: "Occasional turtle stranding/nesting references (indicative)." },
  { id: "t8", name: "Karwar–Kumta Coast", lng: 74.15, lat: 14.8, state: "karnataka", note: "Occasional turtle observations (indicative)." },
  { id: "t9", name: "Kakinada–Dr. B.R. Ambedkar Coast", lng: 82.3, lat: 16.9, state: "andhra-pradesh", note: "Olive ridley records along the north Andhra coast (indicative)." },
];

export const MARINE_MAMMALS: MarinePoint[] = [
  { id: "mm1", name: "Dugong – Gulf of Mannar", lng: 78.6, lat: 8.9, state: "tamil-nadu", note: "Indian Ocean dugong population feeding on seagrass meadows (indicative)." },
  { id: "mm2", name: "Dugong – Palk Bay", lng: 79.5, lat: 9.4, state: "tamil-nadu", note: "Occasional dugong sightings over Palk Bay seagrass (indicative)." },
  { id: "mm3", name: "Dugong – Point Calimere", lng: 79.9, lat: 10.3, state: "tamil-nadu", note: "Historic dugong records along the central TN coast (indicative)." },
  { id: "mm4", name: "Dolphins – Kasimedu", lng: 80.28, lat: 13.1, state: "tamil-nadu", note: "Coastal dolphin sightings off north Chennai (indicative)." },
  { id: "mm5", name: "Dolphins – Kadalundi", lng: 75.85, lat: 11.05, state: "kerala", note: "Regular dolphin observations at the estuary mouth (indicative)." },
  { id: "mm6", name: "Dolphins – Kochi Coast", lng: 76.15, lat: 9.95, state: "kerala", note: "Coastal and estuarine dolphin sightings (indicative)." },
  { id: "mm7", name: "Dolphins – Karwar", lng: 74.1, lat: 14.85, state: "karnataka", note: "Pod sightings along the north Karnataka coast (indicative)." },
  { id: "mm8", name: "Dolphins – Kakinada Bay", lng: 82.3, lat: 16.95, state: "andhra-pradesh", note: "Coastal dolphin records in Kakinada bay (indicative)." },
  { id: "mm9", name: "Whale & Dolphin Sightings – Mandapam", lng: 79.35, lat: 9.3, state: "tamil-nadu", note: "Occasional whale and dolphin sightings along the Palk Strait channel (indicative)." },
];

export const BIODIVERSITY_POINTS: MarinePoint[] = [
  { id: "b1", name: "Gulf of Mannar Biosphere", lng: 79.0, lat: 9.0, state: "tamil-nadu", note: "Coral–seagrass–dugong assemblage; among the richest marine biodiversity of the south coast (indicative)." },
  { id: "b2", name: "Palk Bay Assemblage", lng: 79.6, lat: 9.6, state: "tamil-nadu", note: "Bay-wide finfish, crustacean and reef assemblage (indicative)." },
  { id: "b3", name: "Krishna–Godavari Nursery", lng: 82.2, lat: 16.4, state: "andhra-pradesh", note: "Estuarine nursery grounds for prawns and finfish (indicative)." },
  { id: "b4", name: "Kerala Mid-Shelf Community", lng: 75.9, lat: 9.7, state: "kerala", note: "Upwelling-driven productivity zone of the south-west shelf (indicative)." },
  { id: "b5", name: "Karwar Deep Reef", lng: 74.05, lat: 14.9, state: "karnataka", note: "Rocky reef and slope biodiversity reference (indicative)." },
  { id: "b6", name: "Vembanad Backwater System", lng: 76.35, lat: 9.75, state: "kerala", note: "Brackish productivity and bird diversity (indicative)." },
];

export const OCEAN_CONDITIONS: MarinePoint[] = [
  { id: "o1", name: "Chennai Ocean Reference Station", lng: 80.45, lat: 13.1, state: "tamil-nadu", note: "Wave, current and SST observation reference point (indicative)." },
  { id: "o2", name: "Mandapam Observation Point", lng: 79.3, lat: 9.3, state: "tamil-nadu", note: "Palk Strait oceanographic reference (indicative)." },
  { id: "o3", name: "Kochi Ocean Reference Station", lng: 76.1, lat: 9.9, state: "kerala", note: "Upwelling and chlorophyll observation reference (indicative)." },
  { id: "o4", name: "Karwar Ocean Reference Station", lng: 74.1, lat: 14.8, state: "karnataka", note: "Monsoon current observation reference (indicative)." },
  { id: "o5", name: "Kakinada Ocean Reference Station", lng: 82.35, lat: 16.9, state: "andhra-pradesh", note: "Bay of Bengal coastal observation reference (indicative)." },
];

export const POLLUTION_POINTS: MarinePoint[] = [
  { id: "pl1", name: "Ennore Creek Corridor", lng: 80.32, lat: 13.28, state: "tamil-nadu", note: "Industrial effluent pressure reported along the Ennore creek–estuary system (indicative)." },
  { id: "pl2", name: "Kasimedu Harbour Area", lng: 80.27, lat: 13.1, state: "tamil-nadu", note: "Harbour waste and urban runoff pressure (indicative)." },
  { id: "pl3", name: "Kakinada Fishing Harbour", lng: 82.25, lat: 16.95, state: "andhra-pradesh", note: "Harbour waste handling pressure (indicative)." },
  { id: "pl4", name: "Kochi Harbour Area", lng: 76.25, lat: 9.95, state: "kerala", note: "Port and urban effluent pressure (indicative)." },
  { id: "pl5", name: "Tuticorin Harbour Area", lng: 78.14, lat: 8.78, state: "tamil-nadu", note: "Port, industrial and harbour waste pressure (indicative)." },
];

/* ------------------------------------------------------------------ */
/* Bottom summary modules                                              */
/* ------------------------------------------------------------------ */

export interface SummaryModule {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: string;
}

export const SUMMARY_MODULES: SummaryModule[] = [
  { id: "coastal", label: "Coastal Length", value: "2,939 km", sub: "combined coastline of 4 states", icon: "↔" },
  { id: "eez", label: "EEZ", value: "≈0.81 M km²", sub: "combined exclusive economic zone", icon: "◎" },
  { id: "villages", label: "Fishing Villages", value: "≈1,524", sub: "marine fishing villages", icon: "●" },
  { id: "harbours", label: "Fishing Harbours", value: "44", sub: "harbours & landing centres mapped", icon: "⚓" },
  { id: "crafts", label: "Fishing Crafts", value: "1,05,446", sub: "mechanised + motorised + non-motorised", icon: "🚤" },
  { id: "seasons", label: "Fishing Seasons", value: "Apr – Jul", sub: "state ban & lean windows", icon: "📅" },
  { id: "agencies", label: "Fisheries Agencies", value: "23", sub: "key divisions & agencies", icon: "🏛" },
  { id: "welfare", label: "Fisher Welfare & Relief", value: "₹4.5k – ₹20k", sub: "support per fisher family", icon: "🤝" },
];

/* ------------------------------------------------------------------ */
/* Marine information inputs (data sources)                            */
/* ------------------------------------------------------------------ */

export const INPUT_SOURCES: { name: string; icon: string; detail: string }[] = [
  { name: "Fishermen & Fishing Communities", icon: "🎣", detail: "First-hand knowledge from fishing families and villages" },
  { name: "Fish Landing Centres", icon: "🏬", detail: "Landings, effort and price observations" },
  { name: "Fishing Harbours", icon: "⚓", detail: "Vessel movements, landings and infrastructure" },
  { name: "State Fisheries Departments", icon: "🏢", detail: "Official statistics, welfare and policy records" },
  { name: "Fisheries Cooperatives", icon: "🤝", detail: "Cooperative societies and federations" },
  { name: "ICAR-CMFRI", icon: "🔬", detail: "Stock assessment, seed and stock enhancement" },
  { name: "NIOT", icon: "🌊", detail: "Oceanographic and coastal observation systems" },
  { name: "Universities", icon: "🎓", detail: "Research stations and long-term studies" },
  { name: "Oceanographic Observations", icon: "🌡", detail: "Wave, current, SST and productivity data" },
  { name: "Satellite / Remote Sensing", icon: "🛰", detail: "Chlorophyll, SST, turbidity and habitat mapping" },
  { name: "Marine Biodiversity Monitoring", icon: "🧬", detail: "Species, habitat and protected-area observations" },
  { name: "Fishing Vessel / Fleet Information", icon: "🚤", detail: "Registry, gear and effort information" },
  { name: "Community Knowledge", icon: "🗣", detail: "Local ecological knowledge and seasonal calendars" },
];

/* ------------------------------------------------------------------ */
/* Data quality & confidence                                           */
/* ------------------------------------------------------------------ */

export interface QualityLevel {
  level: Confidence;
  icon: string;
  color: string;
  label: string;
  detail: string;
}

export const QUALITY_LEVELS: QualityLevel[] = [
  {
    level: "high",
    icon: "🟢",
    color: "#10B981",
    label: "Verified / high confidence",
    detail: "Official or cross-checked sources with a current reference period.",
  },
  {
    level: "moderate",
    icon: "🟡",
    color: "#F59E0B",
    label: "Good historical evidence / moderate confidence",
    detail: "Documented historical or research evidence; confirm before site-level decisions.",
  },
  {
    level: "verify",
    icon: "🟠",
    color: "#F97316",
    label: "Requires current district-level verification",
    detail: "Seasonal or district rules that should be checked against the latest official notification.",
  },
];

/* ------------------------------------------------------------------ */
/* Dashboard navigation tabs                                           */
/* ------------------------------------------------------------------ */

export interface DashTab {
  id: string;
  label: string;
  href: string;
}

export const DASH_TABS: DashTab[] = [
  { id: "map", label: "Map", href: "#map" },
  { id: "data", label: "Data", href: "#data" },
  { id: "profile", label: "Marine Profile", href: "#marine-profile" },
  { id: "agencies", label: "Fisheries Agencies", href: "#agencies" },
  { id: "seasons", label: "Fishing Seasons", href: "#seasons" },
  { id: "relief", label: "Relief & Schemes", href: "#relief" },
  { id: "reports", label: "Reports", href: "#reports" },
];

export type ProfileView = "data" | "districts" | "villages" | "harbours" | "seasons" | "agencies";
