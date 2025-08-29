import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * -------------------------------------------------------
 * AI PIVOT Campaign Manager (React + TS)
 * -------------------------------------------------------
 * - Tailwind v4 zero-config compatible
 * - Uses global utilities: .card, .btn, .btn-primary, .btn-success, .h2, .h3
 * - Centered layout with max-w-7xl container
 * -------------------------------------------------------
 */

// -----------------------------
// Mock performance data (now includes explicit actual vs forecast fields)
// -----------------------------
type PerformancePoint = {
  cycle: string;
  actualCPA: number;
  actualConversions: number;
  forecastCPA: number;
  forecastConversions: number;
};

type AICycleActivity = {
  cycle: string;
  suggested: string[]; // what AI suggests should be changed
  implemented: string[]; // what AI actually changed for next cycle
  requestedButNotControlled: string[]; // what AI wanted to change but couldn't
};

const initialPerformanceData: PerformancePoint[] = [
  {
    cycle: "Cycle 1",
    // actual is better (lower CPA, higher conversions) than forecast
    actualCPA: 48,
    actualConversions: 150,
    forecastCPA: 50,
    forecastConversions: 125,
  },
  {
    cycle: "Cycle 2",
    actualCPA: 43,
    actualConversions: 155,
    forecastCPA: 45,
    forecastConversions: 150,
  },
  {
    cycle: "Cycle 3",
    actualCPA: 40,
    actualConversions: 175,
    forecastCPA: 42,
    forecastConversions: 165,
  },
  {
    cycle: "Cycle 4",
    actualCPA: 38,
    actualConversions: 195,
    forecastCPA: 40,
    forecastConversions: 190,
  },
];

// -----------------------------
// Subcategory improvements
// -----------------------------
const dataFeedSubcategories = [
  { name: "CDP Data (batch or real-time)", improvement: 5 },
  { name: "Product Catalog Data", improvement: 4 },
  { name: "Identity Data (personalization)", improvement: 6 },
  { name: "Variant Scaling Data (colors, headlines, CTAs)", improvement: 3 },
];

const mediaInventorySubcategories = [
  { name: "Out-of-Home (OOH)", improvement: 13.3 },
  { name: "TV", improvement: 10.2 },
  { name: "Digital", improvement: 3.9 },
  { name: "Connected TV", improvement: 2.2 },
];

// -----------------------------
// Coverage data (mocked)
// -----------------------------
// metric can be: "spend" | "impressions" | "identifiable"
const coverageData = {
  spend: {
    audienceTypes: [
      { label: "Prospecting", value: 62 },
      { label: "Remarketing", value: 28 },
      { label: "Loyalty", value: 10 },
    ],
    audienceByPartner: [
      { label: "Google", value: 40 },
      { label: "Meta", value: 35 },
      { label: "Yahoo DSP", value: 25 },
    ],
    landingPages: [
      { label: "Product Detail", value: 55 },
      { label: "Category", value: 25 },
      { label: "Promotion", value: 20 },
    ],
    mediaPartners: [
      { label: "YouTube", value: 32 },
      { label: "Instagram", value: 28 },
      { label: "Open Web DSP", value: 40 },
    ],
    identityByPartner: [
      { label: "Google", value: 78 },
      { label: "Meta", value: 74 },
      { label: "Yahoo DSP", value: 61 },
    ],
  },
  impressions: {
    audienceTypes: [
      { label: "Prospecting", value: 70 },
      { label: "Remarketing", value: 20 },
      { label: "Loyalty", value: 10 },
    ],
    audienceByPartner: [
      { label: "Google", value: 38 },
      { label: "Meta", value: 37 },
      { label: "Yahoo DSP", value: 25 },
    ],
    landingPages: [
      { label: "Product Detail", value: 50 },
      { label: "Category", value: 30 },
      { label: "Promotion", value: 20 },
    ],
    mediaPartners: [
      { label: "YouTube", value: 35 },
      { label: "Instagram", value: 30 },
      { label: "Open Web DSP", value: 35 },
    ],
    identityByPartner: [
      { label: "Google", value: 65 },
      { label: "Meta", value: 60 },
      { label: "Yahoo DSP", value: 54 },
    ],
  },
  identifiable: {
    audienceTypes: [
      { label: "Prospecting", value: 48 },
      { label: "Remarketing", value: 36 },
      { label: "Loyalty", value: 16 },
    ],
    audienceByPartner: [
      { label: "Google", value: 55 },
      { label: "Meta", value: 52 },
      { label: "Yahoo DSP", value: 41 },
    ],
    landingPages: [
      { label: "Product Detail", value: 58 },
      { label: "Category", value: 22 },
      { label: "Promotion", value: 20 },
    ],
    mediaPartners: [
      { label: "YouTube", value: 28 },
      { label: "Instagram", value: 26 },
      { label: "Open Web DSP", value: 46 },
    ],
    identityByPartner: [
      { label: "Google", value: 82 },
      { label: "Meta", value: 79 },
      { label: "Yahoo DSP", value: 68 },
    ],
  },
} as const;

// -----------------------------
// Panels & Insights
// -----------------------------
const PANELS = [
  "Overview",
  "Coverage",
  "Audience",
  "Landing Page",
  "Media Inventory",
  "Creative",
  "Data Feed Optimization",
  "AI Activities", // <-- added new left-nav panel
] as const;

type Panel = (typeof PANELS)[number];

type Insight = {
  text: string;
  improvement: number; // % improvement the AI estimates
  aiControl: string[]; // things AI can change now
  aiRequest: string[]; // things AI wants permission/control for
};

const baseInsights: Record<Exclude<Panel, "Overview" | "Coverage">, Insight> = {
  Audience: {
    text: "Refine audience targeting towards high converters to reduce CPA.",
    improvement: 8,
    aiControl: ["Lookalike audience expansion", "Demographic targeting refinements"],
    aiRequest: ["Access to CRM segments", "Geo-location targeting permissions"],
  },
  "Landing Page": {
    text: "Run A/B tests with simplified layouts to improve conversion rates.",
    improvement: 10,
    aiControl: ["Headline/CTA suggestions", "Layout recommendations"],
    aiRequest: ["Ability to modify landing page templates", "Access to form conversion data"],
  },
  "Media Inventory": {
    text:
      "Shift spend towards publishers delivering the lowest CPA. Based on goals (e.g., awareness), some channels are more effective than others.",
    improvement: 6,
    aiControl: ["Budget allocation recommendations", "Channel performance analysis"],
    aiRequest: ["Authority to adjust media mix", "Direct DSP access"],
  },
  Creative: {
    text: "Test new ad concepts with different CTAs and visuals to boost engagement.",
    improvement: 12,
    aiControl: ["Automated creative variant generation", "Dynamic CTA testing"],
    aiRequest: ["Direct integration with creative approval workflows", "Access to DAM for assets"],
  },
  "Data Feed Optimization": {
    text: "Leverage DCO to personalize creative with real-time product data.",
    improvement: 7,
    aiControl: ["Real-time feed monitoring", "Automated variant insertion"],
    aiRequest: ["Permission to modify product catalog fields", "Deeper CDP integration"],
  },
};

// -----------------------------
// Helpers + Dev-time tests
// -----------------------------
export function computeForecast(
  last: { CPA: number; Conversions: number },
  improvement: number
) {
  const newCPA = +(last.CPA * (1 - improvement / 100)).toFixed(2);
  const newConversions = Math.round(last.Conversions * (1 + improvement / 100));
  return { CPA: newCPA, Conversions: newConversions };
}

function clampPercent(n: number) {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

// helper: try to infer missed % for a historical activity by parsing implemented entries
function getMissedPercentFromActivity(act: AICycleActivity): number {
  // look for an entry like "Applied forecast change: +8% → Audience"
  for (const impl of act.implemented) {
    const m = impl.match(/Applied forecast change:\s*\+([\d.]+)%\s*→\s*(.+)/);
    if (m) {
      const panelLabel = m[2].trim();
      // baseInsights keys are panel labels; fallback to 0 if not found
      const info = (baseInsights as any)[panelLabel] as Insight | undefined;
      if (info && typeof info.improvement === "number") return info.improvement;
      // if panelLabel isn't a top-level insight, try to coerce numeric percent from capture
      const parsed = Number(m[1]);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

// new helper: present a conservative / adjusted estimate so it does NOT match "Potential Improvement"
function computeAdjustedImprovement(pct: number): number {
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  // conservative multiplier (adjust as needed) and round to integer
  return Math.round(pct * 0.75);
}

(function runDevTests() {
  try {
    // computeForecast tests
    const base = { CPA: 100, Conversions: 200 };
    const a = computeForecast(base, 10);
    console.assert(a.CPA === 90 && a.Conversions === 220, "10% forecast math");

    const b = computeForecast(base, 0);
    console.assert(b.CPA === 100 && b.Conversions === 200, "0% forecast math");

    const c = computeForecast({ CPA: 40, Conversions: 190 }, 2.5);
    console.assert(c.CPA === 39 && c.Conversions === 195, "2.5% rounding forecast math");

    // NEW tests
    const d = computeForecast({ CPA: 80, Conversions: 50 }, 100);
    console.assert(d.CPA === 0 && d.Conversions === 100, "100% improvement edge case");

    console.assert(clampPercent(105) === 100, "clamp > 100");
    console.assert(clampPercent(-5) === 0, "clamp < 0");
    console.assert(clampPercent(49.6) === 50, "clamp round");
    // NaN handling
    console.assert(clampPercent(Number("foo")) === 0, "clamp NaN");
  } catch (e) {
    console.warn("Dev tests failed:", e);
  }
})();

// -----------------------------
// Small UI atoms
// -----------------------------
function ProgressRow({ label, value }: { label: string; value: number }) {
  const w = clampPercent(value);
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{w}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded">
        <div className="h-2 rounded bg-blue-600" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

// -----------------------------
// App
// -----------------------------
export default function App() {
  const [active, setActive] = useState<Panel>("Overview");
  // pre-populated AI activity history for Cycles 1-4
  const [aiActivities, setAiActivities] = useState<AICycleActivity[]>([
    {
      cycle: "Cycle 1",
      suggested: [
        "Refine audience targeting towards high converters to reduce CPA.",
        "Expand lookalike audiences focused on recent purchasers.",
      ],
      implemented: [
        "Did: Lookalike audience expansion",
        "Did: Demographic targeting refinements",
        "Applied forecast change: +8% → Audience",
      ],
      requestedButNotControlled: [
        "Requested: Access to CRM segments",
        "Requested: Geo-location targeting permissions",
      ],
    },
    {
      cycle: "Cycle 2",
      suggested: [
        "Run A/B tests with simplified layouts to improve conversion rates.",
        "Prioritize headline and CTA variants on high-traffic pages.",
      ],
      implemented: [
        "Did: Headline/CTA suggestions",
        "Did: Layout recommendations (A/B setup)",
        "Applied forecast change: +10% → Landing Page",
      ],
      requestedButNotControlled: [
        "Requested: Ability to modify landing page templates",
        "Requested: Access to form conversion data",
      ],
    },
    {
      cycle: "Cycle 3",
      suggested: [
        "Shift spend towards publishers delivering the lowest CPA.",
        "Rebalance budget to increase delivery on top-performing channels.",
      ],
      implemented: [
        "Did: Budget allocation recommendations",
        "Did: Channel performance analysis and reweighting",
        "Applied forecast change: +6% → Media Inventory",
      ],
      requestedButNotControlled: [
        "Requested: Authority to adjust media mix",
        "Requested: Direct DSP access",
      ],
    },
    {
      cycle: "Cycle 4",
      suggested: [
        "Test new ad concepts with different CTAs and visuals to boost engagement.",
        "Introduce dynamic CTAs for high-value segments.",
      ],
      implemented: [
        "Did: Automated creative variant generation",
        "Did: Dynamic CTA testing",
        "Applied forecast change: +12% → Creative",
      ],
      requestedButNotControlled: [
        "Requested: Direct integration with creative approval workflows",
        "Requested: Access to DAM for assets",
      ],
    },
  ]);
  const [variants, setVariants] = useState([
    { id: 1, headline: "Shop Now for Exclusive Deals!", cta: "Buy Now" },
    { id: 2, headline: "Limited Time Offer – Save Big Today!", cta: "Shop Today" },
  ]);
  const [performanceData, setPerformanceData] = useState<PerformancePoint[]>(initialPerformanceData);
  const [coverageMetric] = useState<"spend" | "impressions" | "identifiable">("spend");

  // Campaign goal options + selected goal state
  const goalOptions = [
    { value: "Awareness", label: "Awareness" },
    { value: "Consideration", label: "Consideration" },
    { value: "Traffic", label: "Traffic" },
    { value: "Engagement", label: "Engagement" },
    { value: "Lead Generation", label: "Lead Generation" },
    { value: "Conversion", label: "Conversion" },
    { value: "Catalog Sales", label: "Catalog Sales" },
    { value: "Store Traffic", label: "Store Traffic" },
  ];
  const goalKpiMap: Record<string, string> = {
    Awareness: "KPIs: reach, impressions, CPM",
    Consideration: "KPIs: video views, time on site, view-through rate",
    Traffic: "KPIs: link clicks, landing page views, CPC",
    Engagement:
      "KPIs: post reactions/comments/shares, engagement rate, cost per engagement",
    "Lead Generation": "KPIs: leads, CPL, form completion rate",
    Conversion: "KPIs: purchases, conversion rate, CPA",
    "Catalog Sales": "KPIs: purchases from product catalog, ROAS, AOV",
    "Store Traffic": "KPIs: store visits, directions, offline conversions",
  };
  const [selectedGoal, setSelectedGoal] = useState<string>(goalOptions[0].value);

  // new: media allocation sliders state (unchanged shape)
  const [mediaAlloc, setMediaAlloc] = useState({
    OOH: 30,
    TV: 30,
    Digital: 25,
    CTV: 15,
  });

  // single-slider editor: which channel is currently being adjusted
  const [selectedChannel, setSelectedChannel] = useState<"OOH" | "TV" | "Digital" | "CTV">("OOH");

  // helper: update selected channel to newVal and redistribute remaining 100% to others
  function setAllocForChannel(channel: "OOH" | "TV" | "Digital" | "CTV", rawVal: number) {
    const val = Math.max(0, Math.min(100, Math.round(rawVal)));
    const keys: ("OOH" | "TV" | "Digital" | "CTV")[] = ["OOH", "TV", "Digital", "CTV"];
    const others = keys.filter((k) => k !== channel);

    const prevOthersSum = others.reduce((s, k) => s + (mediaAlloc as any)[k], 0);
    const remaining = Math.max(0, 100 - val);

    const newAlloc: any = { ...mediaAlloc, [channel]: val };

    if (prevOthersSum > 0) {
      for (const o of others) {
        newAlloc[o] = Math.round(((mediaAlloc as any)[o] / prevOthersSum) * remaining);
      }
    } else {
      // distribute equally if previous others sum to 0
      const per = Math.floor(remaining / others.length);
      others.forEach((o) => (newAlloc[o] = per));
      // fix remainder
      const sumNow = others.reduce((s, o) => s + newAlloc[o], 0);
      const rem = remaining - sumNow;
      if (rem > 0) newAlloc[others[0]] += rem;
    }

    // fix rounding so total === 100
    const total = Object.values(newAlloc).reduce((s: number, n: any) => s + Number(n || 0), 0);
    if (total !== 100) {
      const delta = 100 - total;
      // apply delta to first key that's not the selected channel
      const firstAdjustKey = keys.find((k) => k !== channel) || channel;
      newAlloc[firstAdjustKey] = Math.max(0, (newAlloc[firstAdjustKey] || 0) + delta);
    }

    setMediaAlloc({
      OOH: newAlloc.OOH,
      TV: newAlloc.TV,
      Digital: newAlloc.Digital,
      CTV: newAlloc.CTV,
    });
  }

  // new helper: compute composite weighted improvement from allocations
  function computeCompositeImprovement(alloc: { OOH: number; TV: number; Digital: number; CTV: number }) {
    const mapping: { [key: string]: number } = {
      "Out-of-Home (OOH)": alloc.OOH,
      TV: alloc.TV,
      Digital: alloc.Digital,
      "Connected TV": alloc.CTV,
    };
    const total = Object.values(mapping).reduce((s, v) => s + v, 0);
    if (total <= 0) return 0;
    let weighted = 0;
    for (const s of mediaInventorySubcategories) {
      const pct = mapping[s.name] ?? 0;
      weighted += (pct / total) * s.improvement;
    }
    return Math.round(weighted * 10) / 10; // one decimal
  }

  function findParentPanel(label: string): Exclude<Panel, "Overview" | "Coverage"> | undefined {
    // direct panel name
    if ((Object.keys(baseInsights) as string[]).includes(label)) {
      return label as Exclude<Panel, "Overview" | "Coverage">;
    }
    // check subcategories
    if (mediaInventorySubcategories.some((s) => s.name === label)) return "Media Inventory";
    if (dataFeedSubcategories.some((s) => s.name === label)) return "Data Feed Optimization";
    return undefined;
  }

  const generateVariant = () => {
    const newVariant = {
      id: variants.length + 1,
      headline: `AI Generated Headline ${variants.length + 1}`,
      cta: "Learn More",
    };
    setVariants((v) => [...v, newVariant]);
  };

  const applyImprovement = (label: string, improvement?: number) => {
    const last = performanceData[performanceData.length - 1] as any;
    const panelKey = findParentPanel(label);
    const imp =
      improvement ??
      (panelKey ? baseInsights[panelKey as Exclude<Panel, "Overview" | "Coverage">]?.improvement || 0 : 0);
    // compute forecast from the last forecast values so forecasts chain predictably
    const { CPA: forecastCPA, Conversions: forecastConversions } = computeForecast(
      { CPA: last.forecastCPA, Conversions: last.forecastConversions },
      imp
    );

    // append a new row containing both the carried-forward actual (no new actual yet)
    // and the newly computed forecast values
    setPerformanceData((d) => [
      ...d,
      {
        cycle: `Forecast: ${label}`,
        actualCPA: last.actualCPA,
        actualConversions: last.actualConversions,
        forecastCPA,
        forecastConversions,
      },
    ]);

    // Build AI activity record for the cycle
    const suggested: string[] = [];
    const implemented: string[] = [];
    const requestedButNotControlled: string[] = [];

    if (panelKey && baseInsights[panelKey as Exclude<Panel, "Overview" | "Coverage">]) {
      const info = baseInsights[panelKey as Exclude<Panel, "Overview" | "Coverage">];
      suggested.push(info.text);
      // what AI can change now
      implemented.push(...info.aiControl.map((i) => `Did: ${i}`));
      // what AI asked for but couldn't control
      requestedButNotControlled.push(...info.aiRequest.map((r) => `Requested: ${r}`));
    }
    // record the concrete change we applied (subcategory or panel)
    implemented.push(`Applied forecast change: +${imp}% → ${label}`);

    const activity: AICycleActivity = {
      cycle: `Forecast: ${label}`,
      suggested,
      implemented,
      requestedButNotControlled,
    };
    setAiActivities((a) => [...a, activity]);
  };

  const renderPanelContent = (
    title: Exclude<Panel, "Overview" | "Coverage">,
    insight: Insight
  ) => (
    <motion.div whileHover={{ scale: 1.01 }} className="card">
      <h3 className="h3 mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{insight.text}</p>

      {/* Extra UI for certain panels */}
      {title === "Media Inventory" && (
        <div>
          <ul className="list-disc ml-5 mt-2 text-gray-700">
            {mediaInventorySubcategories.map((sub) => {
              // map subcategory label to internal channel key
              const key =
                sub.name === "Out-of-Home (OOH)"
                  ? "OOH"
                  : sub.name === "TV"
                  ? "TV"
                  : sub.name === "Digital"
                  ? "Digital"
                  : "CTV";
              return (
                <li key={sub.name} className="mb-1">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel(key as "OOH" | "TV" | "Digital" | "CTV")}
                      className={`text-left px-2 py-1 rounded-md focus:outline-none ${
                        selectedChannel === key ? "ring-2 ring-blue-400 bg-blue-50" : ""
                      }`}
                    >
                      {sub.name}
                    </button>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{(mediaAlloc as any)[key]}%</span>
                      {/*
                      <button
                        onClick={() => applyImprovement(sub.name, sub.improvement)}
                        title={`Forecast (+${sub.improvement}%)`}
                        className="ml-2 inline-flex items-center px-2 py-1 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors duration-150"
                      >
                        +{sub.improvement}%
                      </button>
                      */}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* New: Media Mix Simulator — single slider + 4-section segmented bar */}
          <div className="card mt-4">
            <h4 className="font-semibold mb-3">Media Mix Simulator</h4>

            <div className="space-y-3 text-sm">
              {/* segmented bar (display-only now) */}
              <div className="w-full h-8 rounded overflow-hidden flex border select-none" aria-hidden>
                <div
                  className={`h-full`}
                  style={{ width: `${mediaAlloc.OOH}%`, background: "#FDE68A" }}
                  title={`OOH ${mediaAlloc.OOH}%`}
                />
                <div
                  className={`h-full`}
                  style={{ width: `${mediaAlloc.TV}%`, background: "#BFDBFE" }}
                  title={`TV ${mediaAlloc.TV}%`}
                />
                <div
                  className={`h-full`}
                  style={{ width: `${mediaAlloc.Digital}%`, background: "#C7F9CC" }}
                  title={`Digital ${mediaAlloc.Digital}%`}
                />
                <div
                  className={`h-full`}
                  style={{ width: `${mediaAlloc.CTV}%`, background: "#FBCFE8" }}
                  title={`CTV ${mediaAlloc.CTV}%`}
                />
              </div>

              {/* selected channel label + single slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">
                    Adjusting:{" "}
                    {selectedChannel === "OOH"
                      ? "Out-of-Home (OOH)"
                      : selectedChannel === "TV"
                      ? "TV"
                      : selectedChannel === "Digital"
                      ? "Digital"
                      : "Connected TV"}
                  </div>
                  <div className="font-medium">{(mediaAlloc as any)[selectedChannel]}%</div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={(mediaAlloc as any)[selectedChannel]}
                  onChange={(e) => setAllocForChannel(selectedChannel, Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Summary row: total and computed composite improvement */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-gray-600">
                  Total allocation:{" "}
                  <span className={Object.values(mediaAlloc).reduce((a, b) => a + b, 0) !== 100 ? "text-red-600" : "font-medium"}>
                    {Object.values(mediaAlloc).reduce((a, b) => a + b, 0)}%
                  </span>
                  {Object.values(mediaAlloc).reduce((a, b) => a + b, 0) !== 100 && (
                    <span className="ml-2 text-xs"> (should sum to 100%)</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm">Composite forecasted improvement</div>
                  <div className="text-green-600 font-semibold text-lg">
                    {computeCompositeImprovement(mediaAlloc)}%
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => applyImprovement("Media Composite", computeCompositeImprovement(mediaAlloc))}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors duration-150"
                >
                  Forecast Composite (+{computeCompositeImprovement(mediaAlloc)}%)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3 required sections */}
      <div className="mt-4">
        <h4 className="font-semibold">AI Has Control Over:</h4>
        <ul className="list-disc ml-5 text-gray-700">
          {insight.aiControl.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Opportunity Misses:</h4>
        <ul className="list-disc ml-5 text-gray-700">
          {insight.aiRequest.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
          {/* changed label and show adjusted estimate (doesn't match Potential Improvement) */}
          <li className="mt-2 font-semibold">
            Estimated improvement if granted: {computeAdjustedImprovement(insight.improvement)}%
          </li>
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Forecasted Improvement</h4>
        <p className="text-green-600 font-semibold">Potential Improvement: {insight.improvement}%</p>
        <button
          onClick={() => applyImprovement(title)}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors duration-150"
        >
          Forecast Impact
        </button>
      </div>
    </motion.div>
  );

  const CoverageSummaryCard = () => {
    const d = coverageData[coverageMetric];
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="h3">Coverage (Summary)</h3>
          {/* Metric selector intentionally hidden for now */}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-1">Audience by Type</h4>
            {d.audienceTypes.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-1">Audience by Media Partner</h4>
            {d.audienceByPartner.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-1">Landing Pages by Type</h4>
            {d.landingPages.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div>
            <h4 className="font-semibold mb-1">Media Inventory by Partner</h4>
            {d.mediaPartners.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-1">Identity Coverage by Partner</h4>
            {d.identityByPartner.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CoveragePanel = () => {
    const d = coverageData[coverageMetric];
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="h2">Coverage</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Metric:</span>
              {/* Metric selector intentionally hidden for now */}
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            Current AI coverage across audience types, landing pages, media partners, and identity by partner.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-2">Audience by Type</h3>
            {d.audienceTypes.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Audience by Media Partner</h3>
            {d.audienceByPartner.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Landing Pages by Type</h3>
            {d.landingPages.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div className="card">
            <h3 className="font-semibold mb-2">Media Inventory by Partner</h3>
            {d.mediaPartners.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div className="card md:col-span-2">
            <h3 className="font-semibold mb-2">Identity Coverage by Partner</h3>
            {d.identityByPartner.map((r) => (
              <ProgressRow key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // New panel component: AI Activities (each cycle shows three separate cards)
  const AIActivitiesPanel = () => {
    if (aiActivities.length === 0) {
      return (
        <div className="card">
          <h3 className="h3">AI Activities</h3>
          <p className="text-gray-700">No AI activity cycles recorded yet. Trigger forecasts to create activity records.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="h2">AI Activities</h2>
        {aiActivities.map((act) => (
          <div key={act.cycle} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{act.cycle}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h4 className="font-semibold mb-2">AI Suggested</h4>
                {act.suggested.length > 0 ? (
                  <ul className="list-disc ml-5 text-gray-700">
                    {act.suggested.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No suggestions recorded.</p>
                )}
              </div>

              <div className="card">
                <h4 className="font-semibold mb-2">AI Implemented for Next Cycle</h4>
                {act.implemented.length > 0 ? (
                  <ul className="list-disc ml-5 text-gray-700">
                    {act.implemented.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No implementations recorded.</p>
                )}
              </div>

              <div className="card">
                <h4 className="font-semibold mb-2">Opportunity Misses</h4>
                {act.requestedButNotControlled.length > 0 ? (
                  <ul className="list-disc ml-5 text-gray-700">
                    {act.requestedButNotControlled.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                    {/* changed label and show adjusted estimate (doesn't match Potential Improvement) */}
                    <li className="mt-2 font-semibold">
                      Estimated improvement if granted: {computeAdjustedImprovement(getMissedPercentFromActivity(act))}%
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No external requests recorded.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Aureon Campaign Manager</h1>

        {/* Performance Chart */}
        <div className="card mb-6">
          <h2 className="h2 mb-4">Campaign CPA Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cycle" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Actual lines */}
              <Line
                type="monotone"
                dataKey="actualCPA"
                name="Actual CPA"
                stroke="#1f78d1"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="actualConversions"
                name="Actual Conversions"
                stroke="#6b7280"
                dot={false}
              />

              {/* Forecast lines */}
              <Line
                type="monotone"
                dataKey="forecastCPA"
                name="Forecast CPA"
                stroke="#10b981"
                strokeDasharray="5 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecastConversions"
                name="Forecast Conversions"
                stroke="#f59e0b"
                strokeDasharray="5 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Removed the previous inline AI activity cards here.
            Activities are now accessed via the "AI Activities" left-nav panel. */}

        {/* Layout: left nav + right content */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left nav */}
          <nav className="md:w-64 card h-max p-2">
            <ul className="space-y-2 list-plain">
              {PANELS.map((p) => (
                <li key={p}>
                  <button
                    onClick={() => setActive(p)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition border ${
                      active === p
                        ? "bg-blue-600 text-white border-blue-700"
                        : "bg-white hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right content area */}
          <section className="flex-1 space-y-6">
            {/* Overview */}
            {active === "Overview" && (
              <div className="space-y-6">
                <motion.div whileHover={{ scale: 1.01 }} className="card">
                  <h3 className="h3 mb-2">Active Methodology: <strong>PIVOT</strong></h3>
                  <p className="text-gray-700">
                    PIVOT (Perpetual, Iterative, Velocity-Oriented Testing) is a methodology that emphasizes
                    continuous experimentation and optimization. Rather than relying on guesswork, campaigns are
                    treated as ongoing test environments where audiences, creatives, media, landing pages, and data
                    are perpetually refined. The goal is to maximize velocity of learning, minimize wasted spend,
                    and drive measurable improvements in CPA and overall business outcomes.
                  </p>
                </motion.div>

                {/* Campaign Goal selector (added) */}
                <div className="card mb-4">
                  <label className="block text-sm font-semibold mb-2">Campaign Goal</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <select
                      value={selectedGoal}
                      onChange={(e) => setSelectedGoal(e.target.value)}
                      className="border rounded px-3 py-2 bg-white"
                    >
                      {goalOptions.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <div className="text-sm text-gray-600">
                      {goalKpiMap[selectedGoal] && <span>{goalKpiMap[selectedGoal]}</span>}
                    </div>
                  </div>
                </div>

                <CoverageSummaryCard />

                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(baseInsights).map(([title, insight]) => (
                    <motion.button
                      key={title}
                      onClick={() => setActive(title as Exclude<Panel, "Overview" | "Coverage">)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.99 }}
                      className="card text-left cursor-pointer border border-transparent hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="h3 mb-1">{title}</h3>
                          <p className="text-gray-700">{insight.text}</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">Open →</span>
                      </div>
                      <p className="text-green-600 font-semibold mt-3">
                        Potential Improvement: {insight.improvement}%
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Coverage Tab */}
            {active === "Coverage" && <CoveragePanel />}

            {/* AI Activities Tab */}
            {active === "AI Activities" && <AIActivitiesPanel />}

            {/* Single-panel view (non-Creative, non-Coverage) */}
            {active !== "Overview" && active !== "Coverage" && active !== "Creative" && active !== "AI Activities" && (
              <div>
                {renderPanelContent(
                  active as Exclude<Panel, "Overview" | "Coverage" | "Creative">,
                  baseInsights[active as Exclude<Panel, "Overview" | "Coverage">]
                )}
              </div>
            )}

            {/* Creative panel */}
            {active === "Creative" && (
              <div className="space-y-6">
                {renderPanelContent("Creative", baseInsights["Creative"])}

                <div className="card">
                  <h2 className="h2 mb-4">Creative Variants Lab</h2>
                  <button onClick={generateVariant} className="btn btn-primary mb-4">
                    Generate New Variant
                  </button>
                  <ul>
                    {variants.map((variant) => (
                      <li key={variant.id} className="border-b py-2">
                        <span className="font-semibold">Headline:</span> {variant.headline} {" | "}
                        <span className="font-semibold">CTA:</span> {variant.cta}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
