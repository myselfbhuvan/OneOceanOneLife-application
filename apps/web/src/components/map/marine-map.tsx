"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MarineGeoData } from "@/hooks/use-marine-geo";
import {
  BIODIVERSITY_POINTS,
  CORAL_REEFS,
  ESTUARIES,
  FISHING_GROUNDS,
  MANGROVES,
  MARINE_MAMMALS,
  OCEAN_CONDITIONS,
  POLLUTION_POINTS,
  PROTECTED_AREAS,
  SEAGRASS,
  STATE_FILL,
  STATE_PROFILES,
  TURTLE_OBSERVATIONS,
  getProfile,
  type MarinePoint,
  type ProfileView,
  type StateSlug,
} from "@/data/marine";
import { hotspots as legacyHotspots, zones as legacyZones } from "@/lib/data";

export type BasemapMode = "satellite" | "streets";

interface MarineMapProps {
  geo?: MarineGeoData;
  activeLayers: string[];
  basemap: BasemapMode;
  onBasemapChange: (mode: BasemapMode) => void;
  selectedState: StateSlug;
  onSelectState: (slug: StateSlug) => void;
  onOpenProfile: (slug: StateSlug, view: ProfileView) => void;
}

const CENTER: [number, number] = [79.2, 12.6];
const INITIAL_ZOOM = 5.1;
const REGION_BOUNDS = new maplibregl.LngLatBounds([71.5, 4.5, 86.5, 19.5]);
const COPERNICUS_WMTS_URL = "https://wmts.marine.copernicus.eu/teroWmts";

interface CopernicusField {
  id: string;
  layerId: string;
  sourceId: string;
  dataset: string;
  dataVariable: string;
  style: string;
  tileLayerId: string;
  label: string;
  units: string;
  swatch: string;
  temporalDescription: string;
  renderMode: "raster" | "vector";
}

const COPERNICUS_FIELDS: CopernicusField[] = [
  {
    id: "temperature",
    layerId: "Live Sea Temperature",
    sourceId: "copernicus-sea-temperature",
    dataset: "GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy_anfc_0.083deg_PT1H-m_202406",
    dataVariable: "thetao",
    style: "cmap:thermal",
    tileLayerId: "layer-sea-temperature",
    label: "Sea surface temperature",
    units: "°C",
    swatch: "linear-gradient(90deg, #313695, #74add1, #ffffbf, #f46d43, #a50026)",
    temporalDescription: "Hourly model field, updated daily",
    renderMode: "raster",
  },
  {
    id: "salinity",
    layerId: "Live Sea Salinity",
    sourceId: "copernicus-sea-salinity",
    dataset: "GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy_anfc_0.083deg_PT1H-m_202406",
    dataVariable: "so",
    style: "cmap:haline",
    tileLayerId: "layer-sea-salinity",
    label: "Sea surface salinity",
    units: "PSU",
    swatch: "linear-gradient(90deg, #440154, #31688e, #35b779, #fde725)",
    temporalDescription: "Hourly model field, updated daily",
    renderMode: "raster",
  },
  {
    id: "chlorophyll",
    layerId: "Live Chlorophyll",
    sourceId: "copernicus-chlorophyll",
    dataset:
      "OCEANCOLOUR_GLO_BGC_L3_NRT_009_101/cmems_obs-oc_glo_bgc-plankton_nrt_l3-multi-4km_P1D_202411",
    dataVariable: "CHL",
    style: "cmap:algae",
    tileLayerId: "layer-chlorophyll",
    label: "Chlorophyll-a concentration",
    units: "mg/m³",
    swatch: "linear-gradient(90deg, #440154, #31688e, #35b779, #fde725)",
    temporalDescription: "Daily near-real-time satellite observation",
    renderMode: "raster",
  },
  {
    id: "swell",
    layerId: "Live Ocean Swell",
    sourceId: "copernicus-ocean-swell",
    dataset: "GLOBAL_ANALYSISFORECAST_WAV_001_027/cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411",
    dataVariable: "VHM0_SW1",
    style: "cmap:amp",
    tileLayerId: "layer-ocean-swell",
    label: "Primary swell significant wave height",
    units: "m",
    swatch: "linear-gradient(90deg, #313695, #74add1, #ffffbf, #f46d43, #a50026)",
    temporalDescription: "3-hourly global wave model analysis and forecast",
    renderMode: "raster",
  },
  {
    id: "current-eastward",
    layerId: "Live Ocean Currents",
    sourceId: "",
    dataset: "GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy_anfc_0.083deg_PT1H-m_202406",
    dataVariable: "uo",
    style: "cmap:balance",
    tileLayerId: "",
    label: "Eastward current",
    units: "m/s",
    swatch: "#06B6D4",
    temporalDescription: "Hourly ocean-current model, updated daily",
    renderMode: "vector",
  },
  {
    id: "current-northward",
    layerId: "Live Ocean Currents",
    sourceId: "",
    dataset: "GLOBAL_ANALYSISFORECAST_PHY_001_024/cmems_mod_glo_phy_anfc_0.083deg_PT1H-m_202406",
    dataVariable: "vo",
    style: "cmap:balance",
    tileLayerId: "",
    label: "Northward current",
    units: "m/s",
    swatch: "#06B6D4",
    temporalDescription: "Hourly ocean-current model, updated daily",
    renderMode: "vector",
  },
];

interface CopernicusResponse {
  features?: Array<{
    properties?: {
      lat?: unknown;
      lon?: unknown;
      value?: unknown;
    };
  }>;
}

function copernicusTileUrl(field: CopernicusField): string {
  const layer = `${field.dataset}/${field.dataVariable}`;
  return (
    `${COPERNICUS_WMTS_URL}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0` +
    `&LAYER=${encodeURIComponent(layer)}&STYLE=${encodeURIComponent(field.style)}&FORMAT=image%2Fpng` +
    "&TILEMATRIXSET=EPSG%3A3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
  );
}

function copernicusFeatureInfoUrl(field: CopernicusField, lng: number, lat: number, zoom: number): string {
  const tileCount = 2 ** Math.floor(zoom);
  const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const latRadians = (clampedLat * Math.PI) / 180;
  const tileX = ((lng + 180) / 360) * tileCount;
  const tileY = ((1 - Math.asinh(Math.tan(latRadians)) / Math.PI) / 2) * tileCount;
  const column = Math.floor(tileX);
  const row = Math.floor(tileY);
  const pixelX = Math.min(255, Math.floor((tileX - column) * 256));
  const pixelY = Math.min(255, Math.floor((tileY - row) * 256));
  const layer = `${field.dataset}/${field.dataVariable}`;
  const params = new URLSearchParams({
    SERVICE: "WMTS",
    REQUEST: "GetFeatureInfo",
    VERSION: "1.0.0",
    LAYER: layer,
    STYLE: field.style,
    INFOFORMAT: "application/json",
    TILEMATRIXSET: "EPSG:3857",
    TILEMATRIX: String(Math.floor(zoom)),
    TILEROW: String(row),
    TILECOL: String(column),
    I: String(pixelX),
    J: String(pixelY),
  });
  return `${COPERNICUS_WMTS_URL}?${params.toString()}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function currentDirectionDegrees(eastward: number, northward: number): number {
  return (Math.atan2(eastward, northward) * 180) / Math.PI;
}

async function fetchCopernicusValue(
  field: CopernicusField,
  lng: number,
  lat: number,
  zoom: number,
  signal: AbortSignal
): Promise<number | null> {
  const response = await fetch(copernicusFeatureInfoUrl(field, lng, lat, zoom), { signal });
  if (!response.ok) throw new Error(`Copernicus Marine returned HTTP ${response.status}.`);
  const data = (await response.json()) as CopernicusResponse;
  const value = data.features?.[0]?.properties?.value;
  return isFiniteNumber(value) ? value : null;
}

const STATE_COLORS: Record<StateSlug, string> = {
  "andhra-pradesh": "#38BDF8",
  karnataka: "#A78BFA",
  kerala: "#34D399",
  "tamil-nadu": "#F59E0B",
};

const STATE_STRONG_FILL: Record<StateSlug, string> = {
  "andhra-pradesh": "rgba(56,189,248,0.42)",
  karnataka: "rgba(167,139,250,0.42)",
  kerala: "rgba(52,211,153,0.42)",
  "tamil-nadu": "rgba(245,158,11,0.48)",
};

const KIND_META: Record<string, { label: string; emoji: string; color: string; layer: string }> = {
  harbour: { label: "Fishing harbour", emoji: "⚓", color: "#0F766E", layer: "Fishing Harbours" },
  village: { label: "Marine fishing village", emoji: "●", color: "#2563EB", layer: "Marine Fishing Villages" },
  landing: { label: "Landing centre", emoji: "⚑", color: "#0891B2", layer: "Landing Centres" },
};

const CONF_META: Record<string, { icon: string; color: string; label: string }> = {
  high: { icon: "🟢", color: "#10B981", label: "Verified / high confidence" },
  moderate: { icon: "🟡", color: "#F59E0B", label: "Good historical evidence / moderate confidence" },
  verify: { icon: "🟠", color: "#F97316", label: "Requires current district-level verification" },
};

function confChip(confidence?: string) {
  const c = CONF_META[String(confidence || "")];
  if (!c) return "";
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:${c.color};font-weight:600">${c.icon} ${c.label}</span>`;
}

function popupShell(title: string, subtitle: string, body: string) {
  return `
    <div style="min-width:230px;max-width:300px;font-family:inherit">
      <div style="background:#082A38;color:#fff;padding:8px 10px;margin:-8px -10px 8px;border-radius:8px 8px 0 0">
        <div style="font-size:13px;font-weight:700;letter-spacing:.2px">${title}</div>
        <div style="font-size:11px;opacity:.75">${subtitle}</div>
      </div>
      ${body}
    </div>`;
}

function metricRow(label: string, value: string) {
  return `<div style="display:flex;justify-content:space-between;gap:10px;font-size:11.5px;padding:3px 0;border-bottom:1px dashed #e5eaf0">
    <span style="color:#5b6b78">${label}</span><span style="font-weight:700;color:#082A38;text-align:right">${value}</span></div>`;
}

const PROFILE_VIEWS: { label: string; view: ProfileView }[] = [
  { label: "Districts", view: "districts" },
  { label: "Villages", view: "villages" },
  { label: "Harbours", view: "harbours" },
  { label: "Seasons", view: "seasons" },
  { label: "Agencies", view: "agencies" },
  { label: "Data", view: "data" },
];

function statePopupBodyHTML(slug: StateSlug): string {
  const p = getProfile(slug);
  const metrics = [
    metricRow("Coastal length", `${p.coastalLengthKm} km`),
    metricRow("EEZ", p.eez),
    metricRow("Coastal districts", String(p.coastalDistricts)),
    metricRow("Fishing villages", p.fishingVillages),
    metricRow("Fisherfolk", p.fisherfolk),
    metricRow("Total crafts", p.crafts.total.toLocaleString("en-IN")),
  ].join("");
  const buttons = PROFILE_VIEWS.map(
    (v) =>
      `<button class="mp-btn" data-view="${v.view}" style="border:1px solid #cbd5e1;background:#fff;color:#082A38;font-size:11px;font-weight:600;padding:4px 8px;border-radius:6px;cursor:pointer">${v.label}</button>`
  ).join("");
  return `${metrics}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${buttons}</div>
    <div style="font-size:10px;color:#8aa0b0;margin-top:8px">${p.dataNote}</div>`;
}

interface MarkerRecord {
  marker: maplibregl.Marker;
  layer: string;
}

interface PillOptions {
  bg: string;
  fg?: string;
  border?: string;
  bold?: boolean;
  large?: boolean;
}

export default function MarineMap({
  geo,
  activeLayers,
  basemap,
  onBasemapChange,
  selectedState,
  onSelectState,
  onOpenProfile,
}: MarineMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<MarkerRecord[]>([]);
  const currentMarkersRef = useRef<maplibregl.Marker[]>([]);
  const pfzMarkersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const temperaturePopupRef = useRef<maplibregl.Popup | null>(null);
  const temperatureRequestRef = useRef(0);
  const handlersRef = useRef({ onSelectState, onOpenProfile });
  useEffect(() => {
    handlersRef.current = { onSelectState, onOpenProfile };
  }, [onSelectState, onOpenProfile]);

  const [mapReady, setMapReady] = useState(false);
  const [dataAdded, setDataAdded] = useState(false);
  const [currentDataWarning, setCurrentDataWarning] = useState(false);
  const [pfzStatus, setPfzStatus] = useState<
    "idle" | "loading" | "ready" | "partial" | "empty" | "unavailable"
  >("idle");
  const [pfzCoverage, setPfzCoverage] = useState("");

  const activeSet = useMemo(() => new Set(activeLayers), [activeLayers]);
  const has = useCallback((id: string) => activeSet.has(id), [activeSet]);

  /* ---------------- helpers ---------------- */

  const closePopup = useCallback(() => {
    const popup = popupRef.current;
    popupRef.current = null;
    if (temperaturePopupRef.current === popup) temperaturePopupRef.current = null;
    popup?.remove();
  }, []);

  const openPopupRoot = useCallback((lngLat: [number, number], root: HTMLElement) => {
    const map = mapRef.current;
    if (!map) return null;
    closePopup();
    popupRef.current = new maplibregl.Popup({ offset: 14, maxWidth: "320px" }).setLngLat(lngLat).setDOMContent(root).addTo(map);
    return popupRef.current;
  }, [closePopup]);

  const buildStateRoot = (slug: StateSlug, onDone?: () => void) => {
    const p = getProfile(slug);
    const root = document.createElement("div");
    root.innerHTML = popupShell(
      p.state,
      `${p.coastalLengthKm} km coast · ${p.coastalDistricts} coastal districts · ${p.fishingVillages} villages`,
      statePopupBodyHTML(slug)
    );
    root.querySelectorAll<HTMLButtonElement>(".mp-btn").forEach((b) =>
      b.addEventListener("click", () => {
        handlersRef.current.onSelectState(slug);
        handlersRef.current.onOpenProfile(slug, b.dataset.view as ProfileView);
        onDone?.();
        closePopup();
      })
    );
    return root;
  };

  /* ---------------- map init ---------------- */

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "satellite-tiles": {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics",
          },
          "street-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
          ...Object.fromEntries(
            COPERNICUS_FIELDS.filter((field) => field.renderMode === "raster").map((field) => [
              field.sourceId,
              {
                type: "raster" as const,
                tiles: [copernicusTileUrl(field)],
                tileSize: 256,
                attribution: `${field.label} © European Union, Copernicus Marine Service`,
              },
            ])
          ),
        },
        layers: [
          {
            id: "basemap-satellite",
            type: "raster",
            source: "satellite-tiles",
            layout: { visibility: basemap === "satellite" ? "visible" : "none" },
          },
          {
            id: "basemap-streets",
            type: "raster",
            source: "street-tiles",
            layout: { visibility: basemap === "streets" ? "visible" : "none" },
          },
          ...COPERNICUS_FIELDS.filter((field) => field.renderMode === "raster").map((field) => ({
            id: field.tileLayerId,
            type: "raster" as const,
            source: field.sourceId,
            layout: { visibility: "none" as const },
            paint: { "raster-opacity": 0.66, "raster-fade-duration": 250 },
          })),
        ],
      },
      center: CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 4,
      maxZoom: 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const applyZoomVisibility = () => {
      const z = map.getZoom();
      markersRef.current.forEach(({ marker }) => {
        const el = marker.getElement();
        const min = Number(el.dataset.minZoom || 0);
        el.style.display = z >= min ? "" : "none";
      });
    };
    map.on("zoomend", applyZoomVisibility);
    map.on("load", () => {
      setMapReady(true);
      applyZoomVisibility();
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      setMapReady(false);
      setDataAdded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- basemap switch ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (map.getLayer("basemap-satellite")) {
      map.setLayoutProperty("basemap-satellite", "visibility", basemap === "satellite" ? "visible" : "none");
    }
    if (map.getLayer("basemap-streets")) {
      map.setLayoutProperty("basemap-streets", "visibility", basemap === "streets" ? "visible" : "none");
    }
  }, [basemap, mapReady]);

  /* ---------------- Copernicus sea conditions ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const requestRef = temperatureRequestRef;

    const activeFields = COPERNICUS_FIELDS.filter((field) => has(field.layerId));
    const pfzActive = has("Potential Fishing Zones");
    const readingFields = [...activeFields];
    if (pfzActive) {
      ["temperature", "chlorophyll"].forEach((id) => {
        const field = COPERNICUS_FIELDS.find((candidate) => candidate.id === id);
        if (field && !readingFields.some((activeField) => activeField.id === id)) readingFields.push(field);
      });
    }
    COPERNICUS_FIELDS.filter((field) => field.renderMode === "raster").forEach((field) => {
      map.setLayoutProperty(field.tileLayerId, "visibility", has(field.layerId) ? "visible" : "none");
    });
    if (readingFields.length === 0) return;

    const handleOceanClick = async (event: maplibregl.MapMouseEvent) => {
      const landLayers = ["layer-states-fill", "layer-districts-fill"].filter((id) => map.getLayer(id));
      if (landLayers.length && map.queryRenderedFeatures(event.point, { layers: landLayers }).length) {
        return;
      }

      const requestId = ++requestRef.current;
      const root = document.createElement("div");
      const currentFields = activeFields.filter((field) => field.layerId === "Live Ocean Currents");
      const readingRows = readingFields
        .map(
          (field) =>
            `<div style="display:flex;justify-content:space-between;gap:10px;font-size:11.5px;padding:5px 0;border-bottom:1px dashed #e5eaf0">
              <span style="color:#5b6b78">${field.label}</span>
              <span data-copernicus-status="${field.id}" role="status" style="font-weight:700;color:#082A38;text-align:right">Loading…</span>
            </div>`
        )
        .join("");
      root.innerHTML = popupShell(
        "Ocean conditions",
        "Copernicus Marine Data Store",
        `${readingRows}
         ${currentFields.length ? '<div data-current-summary style="font-size:11.5px;font-weight:700;color:#082A38;padding:5px 0"></div>' : ""}
         ${pfzActive ? '<div style="font-size:10px;color:#92400e;margin-top:6px">Indicative relative chlorophyll hotspot screening; temperature fronts add support where detected. Not an official PFZ advisory or catch forecast.</div>' : ""}
         <div data-copernicus-location style="font-size:10px;color:#8aa0b0;margin-top:6px"></div>
         <div style="font-size:10px;color:#8aa0b0;margin-top:6px">${Array.from(new Set(readingFields.map((field) => field.temporalDescription))).join(" · ")}.</div>
         <a href="https://marine.copernicus.eu/" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-size:10px;color:#087EA4;margin-top:5px">Source: Copernicus Marine Data Store</a>`
      );
      temperaturePopupRef.current = openPopupRoot([event.lngLat.lng, event.lngLat.lat], root);

      const values = new Map<string, number>();
      await Promise.all(
        readingFields.map(async (field) => {
          const status = root.querySelector<HTMLElement>(`[data-copernicus-status="${field.id}"]`);
          try {
            const response = await fetch(
              copernicusFeatureInfoUrl(field, event.lngLat.lng, event.lngLat.lat, map.getZoom())
            );
            if (!response.ok) {
              throw new Error(`Copernicus Marine returned HTTP ${response.status}.`);
            }
            const data = (await response.json()) as CopernicusResponse;
            if (requestId !== requestRef.current) return;

            const reading = data.features?.[0]?.properties;
            if (!reading || !isFiniteNumber(reading.value)) {
              if (status) status.textContent = "No reading";
              return;
            }

            values.set(field.id, reading.value);
            if (status) status.textContent = `${reading.value.toFixed(1)} ${field.units}`;
            const location = root.querySelector<HTMLElement>("[data-copernicus-location]");
            if (
              location &&
              typeof reading.lat === "number" &&
              typeof reading.lon === "number" &&
              Number.isFinite(reading.lat) &&
              Number.isFinite(reading.lon)
            ) {
              location.textContent = `Nearest grid cell: ${reading.lat.toFixed(2)}°, ${reading.lon.toFixed(2)}°`;
            }
          } catch (error) {
            if (requestId !== requestRef.current) return;
            if (status) {
              status.textContent =
                error instanceof Error ? `Unavailable (${error.message})` : "Unavailable (request failed)";
            }
          }
        })
      );

      const eastward = values.get("current-eastward");
      const northward = values.get("current-northward");
      const currentSummary = root.querySelector<HTMLElement>("[data-current-summary]");
      if (
        requestId === requestRef.current &&
        currentSummary &&
        eastward !== undefined &&
        northward !== undefined
      ) {
        const speed = Math.hypot(eastward, northward);
        const direction = ((currentDirectionDegrees(eastward, northward) + 360) % 360).toFixed(0);
        currentSummary.textContent = `Speed ${speed.toFixed(2)} m/s · flowing toward ${direction}°`;
      }
    };

    map.on("click", handleOceanClick);
    return () => {
      requestRef.current++;
      map.off("click", handleOceanClick);
      if (popupRef.current === temperaturePopupRef.current) closePopup();
      temperaturePopupRef.current = null;
    };
  }, [activeSet, closePopup, has, mapReady, openPopupRoot]);

  /* ---------------- indicative fishing-zone screening ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    const chlorophyllField = COPERNICUS_FIELDS.find((field) => field.id === "chlorophyll");
    const temperatureField = COPERNICUS_FIELDS.find((field) => field.id === "temperature");
    if (!map || !mapReady || !has("Potential Fishing Zones")) {
      pfzMarkersRef.current.forEach((marker) => marker.remove());
      pfzMarkersRef.current = [];
      setPfzStatus("idle");
      setPfzCoverage("");
      return;
    }
    if (!chlorophyllField || !temperatureField) {
      throw new Error("Potential fishing-zone screening requires chlorophyll and temperature fields.");
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    const clearPfzMarkers = () => {
      pfzMarkersRef.current.forEach((marker) => marker.remove());
      pfzMarkersRef.current = [];
    };
    const quantile = (values: number[], percentile: number) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * percentile))];
    };

    const refreshPfz = async () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      clearPfzMarkers();
      setPfzStatus("loading");
      setPfzCoverage("");

      const bounds = map.getBounds();
      const columns = 6;
      const rows = 4;
      const zoom = map.getZoom();
      const samples: Array<{ lng: number; lat: number; row: number; column: number }> = [];
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const lng = bounds.getWest() + ((column + 0.5) / columns) * (bounds.getEast() - bounds.getWest());
          const lat = bounds.getNorth() - ((row + 0.5) / rows) * (bounds.getNorth() - bounds.getSouth());
          samples.push({ lng, lat, row, column });
        }
      }

      type PfzReading = {
        lng: number;
        lat: number;
        row: number;
        column: number;
        chlorophyll: number;
        temperature: number | null;
      };
      const readings = new Map<string, PfzReading>();
      const temperatures = new Map<string, { lng: number; lat: number; row: number; column: number; value: number }>();
      let nextSample = 0;
      let failedSamples = 0;
      let missingSamples = 0;
      const loadSamples = async () => {
        while (!signal.aborted && nextSample < samples.length) {
          const sample = samples[nextSample++];
          const sampleController = new AbortController();
          const timeout = setTimeout(() => sampleController.abort(), 7000);
          const sampleSignal = AbortSignal.any([signal, sampleController.signal]);
          try {
            const [chlorophyllResult, temperatureResult] = await Promise.allSettled([
              fetchCopernicusValue(chlorophyllField, sample.lng, sample.lat, zoom, sampleSignal),
              fetchCopernicusValue(temperatureField, sample.lng, sample.lat, zoom, sampleSignal),
            ]);
            if (signal.aborted) return;
            if (chlorophyllResult.status === "rejected" || temperatureResult.status === "rejected") failedSamples++;
            const chlorophyll = chlorophyllResult.status === "fulfilled" ? chlorophyllResult.value : null;
            const temperature = temperatureResult.status === "fulfilled" ? temperatureResult.value : null;
            if (chlorophyll === null || temperature === null) missingSamples++;
            const key = `${sample.row}:${sample.column}`;
            if (chlorophyll !== null) readings.set(key, { ...sample, chlorophyll, temperature });
            if (temperature !== null) temperatures.set(key, { ...sample, value: temperature });
          } catch {
            if (signal.aborted) return;
            failedSamples++;
          } finally {
            clearTimeout(timeout);
          }
        }
      };

      await Promise.all(Array.from({ length: Math.min(4, samples.length) }, () => loadSamples()));
      if (signal.aborted) return;

      const sampleDistanceKm = (a: { lng: number; lat: number }, b: { lng: number; lat: number }) => {
        const meanLatRadians = ((a.lat + b.lat) / 2) * (Math.PI / 180);
        const eastKm = (b.lng - a.lng) * 111.32 * Math.cos(meanLatRadians);
        const northKm = (b.lat - a.lat) * 111.32;
        return Math.hypot(eastKm, northKm);
      };
      const gradients = new Map<string, number>();
      temperatures.forEach((reading, key) => {
        const neighborGradients: number[] = [];
        [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([rowDelta, columnDelta]) => {
          const neighbor = temperatures.get(`${reading.row + rowDelta}:${reading.column + columnDelta}`);
          if (!neighbor) return;
          const distance = sampleDistanceKm(reading, neighbor);
          if (distance > 0) neighborGradients.push((Math.abs(reading.value - neighbor.value) / distance) * 100);
        });
        if (neighborGradients.length) gradients.set(key, Math.max(...neighborGradients));
      });

      if (readings.size < 2) {
        setPfzStatus(failedSamples > 0 || missingSamples > 0 ? "partial" : "unavailable");
        setPfzCoverage(`Only ${readings.size} valid chlorophyll readings from ${samples.length} sampled points.`);
        return;
      }

      const chlorophyllThreshold = quantile([...readings.values()].map((reading) => reading.chlorophyll), 0.6);
      const frontThreshold = gradients.size ? quantile([...gradients.values()], 0.35) : Number.POSITIVE_INFINITY;
      const frontCandidates = [...readings.entries()].filter(
        ([key, reading]) =>
          reading.chlorophyll > 0 &&
          reading.chlorophyll >= chlorophyllThreshold &&
          (gradients.get(key) ?? 0) > 0 &&
          (gradients.get(key) ?? 0) >= frontThreshold
      ).map(([, reading]) => reading);
      const topChlorophyllCount = Math.max(1, Math.ceil(readings.size * 0.25));
      const chlorophyllFallback = [...readings.values()]
        .filter((reading) => reading.chlorophyll > 0)
        .sort((a, b) => b.chlorophyll - a.chlorophyll)
        .slice(0, topChlorophyllCount);
      const candidates = frontCandidates.length
        ? frontCandidates.map((reading) => ({ reading, nearTemperatureFront: true }))
        : chlorophyllFallback.map((reading) => ({ reading, nearTemperatureFront: false }));

      candidates.forEach(({ reading, nearTemperatureFront }) => {
        const element = document.createElement("div");
        const markerLabel = nearTemperatureFront
          ? "Indicative chlorophyll hotspot near a sea-surface temperature front"
          : "Indicative relative chlorophyll hotspot";
        element.setAttribute("aria-label", markerLabel);
        element.title =
          `Indicative ${nearTemperatureFront ? "front-associated " : ""}chlorophyll hotspot · ${reading.chlorophyll.toFixed(2)} mg/m³ · ` +
          `sea-surface temperature ${reading.temperature === null ? "unavailable" : `${reading.temperature.toFixed(1)} °C`}`;
        element.style.cssText =
          "width:30px;height:30px;border:2px solid rgba(220,252,231,.95);border-radius:50%;" +
          "background:radial-gradient(circle,rgba(190,242,100,.95) 0%,rgba(34,197,94,.75) 38%,rgba(16,185,129,.12) 75%);" +
          "box-shadow:0 0 0 4px rgba(34,197,94,.18),0 0 12px rgba(34,197,94,.75);pointer-events:none;";
        const marker = new maplibregl.Marker({ element, anchor: "center" }).setLngLat([reading.lng, reading.lat]).addTo(map);
        marker.getElement().setAttribute("role", "img");
        marker.getElement().setAttribute("aria-label", markerLabel);
        pfzMarkersRef.current.push(marker);
      });
      setPfzStatus(
        failedSamples > 0 || missingSamples > 0 ? "partial" : candidates.length > 0 ? "ready" : "empty"
      );
      setPfzCoverage(
        `${candidates.length} hotspot${candidates.length === 1 ? "" : "s"} from ${readings.size} valid chlorophyll readings.`
      );
    };

    const schedulePfzRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void refreshPfz(), 500);
    };

    schedulePfzRefresh();
    map.on("moveend", schedulePfzRefresh);
    return () => {
      if (timer) clearTimeout(timer);
      map.off("moveend", schedulePfzRefresh);
      controller?.abort();
      clearPfzMarkers();
    };
  }, [has, mapReady]);

  /* ---------------- Copernicus current vectors ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    const currentFields = COPERNICUS_FIELDS.filter((field) => field.layerId === "Live Ocean Currents");
    if (!map || !mapReady || !has("Live Ocean Currents")) {
      currentMarkersRef.current.forEach((marker) => marker.remove());
      currentMarkersRef.current = [];
      setCurrentDataWarning(false);
      return;
    }

    const eastwardField = currentFields.find((field) => field.id === "current-eastward");
    const northwardField = currentFields.find((field) => field.id === "current-northward");
    if (!eastwardField || !northwardField) {
      throw new Error("Copernicus current vector components are not configured.");
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let requestId = 0;
    const clearCurrentMarkers = () => {
      currentMarkersRef.current.forEach((marker) => marker.remove());
      currentMarkersRef.current = [];
    };

    const drawCurrentVectors = () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      const thisRequest = ++requestId;
      clearCurrentMarkers();
      setCurrentDataWarning(false);

      const bounds = map.getBounds();
      const columns = 6;
      const rows = 5;
      const zoom = map.getZoom();
      const samples: Array<{ lng: number; lat: number }> = [];
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const lng = bounds.getWest() + ((column + 0.5) / columns) * (bounds.getEast() - bounds.getWest());
          const lat = bounds.getNorth() - ((row + 0.5) / rows) * (bounds.getNorth() - bounds.getSouth());
          const point = map.project([lng, lat]);
          const landLayers = ["layer-states-fill", "layer-districts-fill"].filter((id) => map.getLayer(id));
          if (landLayers.length && map.queryRenderedFeatures(point, { layers: landLayers }).length) continue;
          samples.push({ lng, lat });
        }
      }

      let nextSample = 0;
      let failedSamples = 0;
      const loadSamples = async () => {
        while (!signal.aborted && nextSample < samples.length) {
          const { lng, lat } = samples[nextSample++];
          try {
            const [eastward, northward] = await Promise.all([
              fetchCopernicusValue(eastwardField, lng, lat, zoom, signal),
              fetchCopernicusValue(northwardField, lng, lat, zoom, signal),
            ]);
            if (signal.aborted || thisRequest !== requestId || eastward === null || northward === null) return;

            const speed = Math.hypot(eastward, northward);
            if (speed < 0.01) return;

            const direction = currentDirectionDegrees(eastward, northward);
            const element = document.createElement("div");
            const flowColor = speed < 0.15 ? "#22D3EE" : speed < 0.45 ? "#A3E635" : speed < 0.8 ? "#FACC15" : "#FB7185";
            element.className = "current-flow-marker";
            element.setAttribute("aria-label", `Ocean current ${speed.toFixed(2)} meters per second`);
            element.title = `Ocean current: ${speed.toFixed(2)} m/s`;
            element.style.setProperty("--current-color", flowColor);
            element.style.opacity = String(Math.min(1, 0.72 + speed * 0.2));
            const flow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            flow.setAttribute("viewBox", "0 0 64 24");
            flow.setAttribute("aria-hidden", "true");
            flow.classList.add("current-flow-svg");
            flow.style.transform = `rotate(${direction - 90}deg) scale(${Math.min(1.3, 0.9 + speed * 0.2)})`;
            flow.innerHTML =
              '<path class="current-flow-halo" d="M2 12 C12 2 22 22 32 12 S52 2 60 12" />' +
              '<path class="current-flow-dash" d="M2 12 C12 2 22 22 32 12 S52 2 60 12" />' +
              '<path class="current-flow-head" d="M54 6 L62 12 L54 18" />';
            element.appendChild(flow);
            const marker = new maplibregl.Marker({ element, anchor: "center" }).setLngLat([lng, lat]).addTo(map);
            currentMarkersRef.current.push(marker);
          } catch (error) {
            if (signal.aborted) return;
            failedSamples++;
          }
        }
      };

      void Promise.all(
        Array.from({ length: Math.min(3, samples.length) }, () => loadSamples())
      ).then(() => {
        if (!signal.aborted && thisRequest === requestId) {
          setCurrentDataWarning(failedSamples > 0);
        }
      });
    };

    const scheduleVectorRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(drawCurrentVectors, 450);
    };

    scheduleVectorRefresh();
    map.on("moveend", scheduleVectorRefresh);
    return () => {
      if (timer) clearTimeout(timer);
      map.off("moveend", scheduleVectorRefresh);
      controller?.abort();
      requestId++;
      clearCurrentMarkers();
    };
  }, [dataAdded, has, mapReady]);

  /* ---------------- vector sources & layers ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !geo || dataAdded) return;

    const addSource = (id: string, data: GeoJSON.FeatureCollection) => {
      if (!map.getSource(id)) map.addSource(id, { type: "geojson", data });
    };

    addSource("src-states", geo.states);
    addSource("src-eez", geo.eez);
    addSource("src-districts", geo.districts);
    addSource("src-bands", geo.bands);

    if (!map.getLayer("layer-states-fill")) {
      map.addLayer({
        id: "layer-states-fill",
        type: "fill",
        source: "src-states",
        paint: { "fill-color": STATE_FILL[selectedState], "fill-opacity": 1 },
      });
    }
    if (!map.getLayer("layer-states-outline")) {
      map.addLayer({
        id: "layer-states-outline",
        type: "line",
        source: "src-states",
        paint: { "line-color": "#FFFFFF", "line-width": 1.1, "line-opacity": 0.9 },
      });
    }
    if (!map.getLayer("layer-eez")) {
      map.addLayer({
        id: "layer-eez",
        type: "line",
        source: "src-eez",
        paint: { "line-color": "#38BDF8", "line-width": 1.6, "line-dasharray": [4, 2], "line-opacity": 0.85 },
      });
    }
    if (!map.getLayer("layer-districts-fill")) {
      map.addLayer({
        id: "layer-districts-fill",
        type: "fill",
        source: "src-districts",
        paint: { "fill-color": "#FFFFFF", "fill-opacity": 0.05 },
      });
    }
    if (!map.getLayer("layer-districts-outline")) {
      map.addLayer({
        id: "layer-districts-outline",
        type: "line",
        source: "src-districts",
        paint: { "line-color": "#E2E8F0", "line-width": 0.9, "line-opacity": 0.7 },
      });
    }
    if (!map.getLayer("layer-bands-ban")) {
      map.addLayer({
        id: "layer-bands-ban",
        type: "fill",
        source: "src-bands",
        paint: { "fill-color": "#DC2626", "fill-opacity": 0.22 },
      });
    }
    if (!map.getLayer("layer-bands-ban-line")) {
      map.addLayer({
        id: "layer-bands-ban-line",
        type: "line",
        source: "src-bands",
        paint: { "line-color": "#DC2626", "line-width": 1.4, "line-opacity": 0.8 },
      });
    }
    if (!map.getLayer("layer-bands-lean")) {
      map.addLayer({
        id: "layer-bands-lean",
        type: "line",
        source: "src-bands",
        paint: { "line-color": "#FACC15", "line-width": 2.2, "line-dasharray": [3, 2], "line-opacity": 0.95 },
      });
    }

    const setCursor = (v: string) => (map.getCanvas().style.cursor = v);
    ["layer-states-fill", "layer-districts-fill", "layer-bands-ban", "layer-bands-ban-line"].forEach((id) => {
      map.on("mouseenter", id, () => setCursor("pointer"));
      map.on("mouseleave", id, () => setCursor(""));
    });

    map.on("click", "layer-states-fill", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const slug = f.properties?.slug as StateSlug;
      handlersRef.current.onSelectState(slug);
      const p = getProfile(slug);
      const root = buildStateRoot(slug);
      openPopupRoot([p.lng > 79 ? p.lng - 1.3 : p.lng + 1.3, p.lat], root);
    });

    map.on("click", "layer-districts-fill", (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties || {};
      const inDistrict = geo.locations.features.filter(
        (lf) => lf.properties?.district === p.district && lf.properties?.state === p.state
      );
      const counts = (["harbour", "village", "landing"] as const)
        .map((k) => {
          const n = inDistrict.filter((lf) => lf.properties?.kind === k).length;
          if (!n) return null;
          return k === "harbour" ? `${n} harbours` : k === "village" ? `${n} villages` : `${n} landing centres`;
        })
        .filter(Boolean)
        .join(" · ");
      const band = geo.bands.features.find(
        (bf) => bf.properties?.district === p.district && bf.properties?.state === p.state
      );
      const body = `
        <div style="font-size:11.5px;color:#5b6b78;margin-bottom:6px">${counts || "No mapped locations"}</div>
        ${band ? metricRow("Fishing ban", String(band.properties?.ban_period || "—")) : ""}
        ${band ? metricRow("Lean period", String(band.properties?.lean_period || "—")) : ""}
        ${band ? `<div style="margin-top:6px">${confChip(String(band.properties?.confidence || ""))}</div>` : ""}
        <button class="mp-btn" data-view="districts" style="margin-top:10px;border:1px solid #cbd5e1;background:#fff;color:#082A38;font-size:11px;font-weight:600;padding:4px 8px;border-radius:6px;cursor:pointer">Open state profile</button>
      `;
      const root = document.createElement("div");
      root.innerHTML = popupShell(String(p.district), `${p.state} · coastal district`, body);
      root.querySelectorAll<HTMLButtonElement>(".mp-btn").forEach((b) =>
        b.addEventListener("click", () => {
          const slug = p.state_slug as StateSlug;
          handlersRef.current.onSelectState(slug);
          handlersRef.current.onOpenProfile(slug, b.dataset.view as ProfileView);
          closePopup();
        })
      );
      openPopupRoot([e.lngLat.lng, e.lngLat.lat], root);
    });

    const bandClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties || {};
      const body = `
        ${metricRow("Fishing ban", String(p.ban_period || "—"))}
        ${metricRow("Lean period", String(p.lean_period || "—"))}
        <div style="font-size:11px;color:#5b6b78;margin-top:6px;line-height:1.45">${String(p.lean_reason || "")}</div>
        <div style="margin-top:8px">${confChip(String(p.confidence || ""))}</div>
        <div style="font-size:10px;color:#8aa0b0;margin-top:6px">${String(p.confidence_label || "")}</div>
      `;
      const root = document.createElement("div");
      root.innerHTML = popupShell(String(p.district), `${p.state} · seasonal restrictions`, body);
      openPopupRoot([e.lngLat.lng, e.lngLat.lat], root);
    };
    map.on("click", "layer-bands-ban", bandClick);
    map.on("click", "layer-bands-ban-line", bandClick);

    setDataAdded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, geo]);

  /* ---------------- selected state paint ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !dataAdded) return;
    const entries = (Object.keys(STATE_FILL) as StateSlug[]).flatMap((slug) => [
      slug,
      slug === selectedState ? STATE_STRONG_FILL[slug] : STATE_FILL[slug],
    ]);
    if (map.getLayer("layer-states-fill")) {
      map.setPaintProperty("layer-states-fill", "fill-color", [
        "match",
        ["get", "slug"],
        ...entries,
        STATE_FILL[selectedState],
      ]);
    }
    if (map.getLayer("layer-states-outline")) {
      map.setPaintProperty("layer-states-outline", "line-width", ["match", ["get", "slug"], selectedState, 2.6, 1.1]);
    }
  }, [selectedState, dataAdded]);

  /* ---------------- markers ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !geo) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    const add = (marker: maplibregl.Marker, layer: string, minZoom = 0) => {
      const el = marker.getElement();
      el.dataset.layer = layer;
      el.dataset.minZoom = String(minZoom);
      if (map.getZoom() < minZoom) el.style.display = "none";
      markersRef.current.push({ marker, layer });
    };

    const badgeMarker = (
      lngLat: [number, number],
      emoji: string,
      color: string,
      layer: string,
      popupHtml?: string,
      size = 26,
      minZoom = 0
    ) => {
      const el = document.createElement("div");
      el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:${Math.round(
        size * 0.5
      )}px;cursor:pointer;transition:transform .15s;`;
      el.textContent = emoji;
      el.onmouseenter = () => (el.style.transform = "scale(1.25)");
      el.onmouseleave = () => (el.style.transform = "scale(1)");
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .setPopup(
          popupHtml ? new maplibregl.Popup({ offset: 12, maxWidth: "300px" }).setHTML(popupHtml) : undefined
        );
      marker.addTo(map);
      add(marker, layer, minZoom);
      return marker;
    };

    const pillMarker = (
      lngLat: [number, number],
      text: string,
      opts: PillOptions,
      layer: string,
      popupRoot?: () => HTMLElement,
      minZoom = 0
    ) => {
      const el = document.createElement("div");
      const pad = opts.large ? "6px 13px" : "4px 9px";
      const radius = opts.large ? "16px" : "12px";
      const fontSize = opts.large ? "13px" : "11px";
      el.style.cssText = `background:${opts.bg};color:${opts.fg || "#fff"};border:${
        opts.border || "1px solid rgba(255,255,255,.7)"
      };padding:${pad};border-radius:${radius};font-size:${fontSize};font-weight:${opts.bold === false ? 500 : 700};white-space:nowrap;cursor:default;box-shadow:0 2px 8px rgba(0,0,0,.3);letter-spacing:.3px;`;
      el.textContent = text;
      let popup: maplibregl.Popup | undefined;
      if (popupRoot) {
        const root = popupRoot();
        root.addEventListener("click", (e) => {
          const t = e.target as HTMLElement;
          if (t.classList.contains("mp-btn")) setTimeout(() => popup?.remove(), 0);
        });
        popup = new maplibregl.Popup({ offset: 10, maxWidth: "320px" }).setDOMContent(root);
      }
      const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(lngLat).setPopup(popup);
      marker.addTo(map);
      add(marker, layer, minZoom);
      return marker;
    };

    const pointPopup = (title: string, subtitle: string, p: Record<string, unknown>) =>
      popupShell(
        title,
        subtitle,
        [
          p.state ? metricRow("State", String(p.state)) : "",
          p.district ? metricRow("District", String(p.district)) : "",
          p.town ? metricRow("Town / village", String(p.town)) : "",
          p.region ? metricRow("Coastal region", String(p.region)) : "",
          p.note
            ? `<div style="font-size:11.5px;color:#5b6b78;margin-top:6px;line-height:1.5">${String(p.note)}</div>`
            : "",
          p.confidence ? `<div style="margin-top:8px">${confChip(String(p.confidence))}</div>` : "",
          p.source ? `<div style="font-size:10px;color:#8aa0b0;margin-top:6px">Source: ${String(p.source)}</div>` : "",
        ].join("")
      );

    const addPointSet = (
      points: MarinePoint[],
      layer: string,
      emoji: string,
      color: string,
      subtitle: string,
      minZoom = 6.4
    ) => {
      if (!has(layer)) return;
      points.forEach((pt) =>
        badgeMarker(
          [pt.lng, pt.lat],
          emoji,
          color,
          layer,
          pointPopup(pt.name, subtitle, {
            state: pt.state ? getProfile(pt.state).state : undefined,
            note: pt.note,
          }),
          24,
          minZoom
        )
      );
    };

    /* --- administrative --- */
    if (has("Coastal States")) {
      STATE_PROFILES.forEach((p) => {
        pillMarker(
          [p.lng, p.lat],
          p.state,
          { bg: "rgba(8,42,56,.9)", large: true, border: `2px solid ${STATE_COLORS[p.slug]}` },
          "Coastal States",
          () => buildStateRoot(p.slug)
        );
      });
    }

    if (has("Coastal Length")) {
      STATE_PROFILES.forEach((p) => {
        pillMarker(
          [p.lng > 79 ? p.lng + 1.5 : p.lng - 1.5, p.lat + 0.2],
          `${p.coastalLengthKm} km`,
          { bg: "rgba(8,126,164,.92)", border: "2px solid #67E8F9" },
          "Coastal Length"
        );
      });
    }

    if (has("Coastal Districts")) {
      geo.districts.features.forEach((f) => {
        const p = f.properties!;
        pillMarker(
          [Number(p.label_lng), Number(p.label_lat)],
          String(p.district),
          { bg: "rgba(15,23,42,.78)", border: "1px solid rgba(255,255,255,.55)", bold: false },
          "Coastal Districts",
          undefined,
          6.2
        );
      });
    }

    /* --- infrastructure & points --- */
    geo.locations.features.forEach((f) => {
      const p = f.properties!;
      const meta = KIND_META[String(p.kind)] || KIND_META.landing;
      if (!has(meta.layer)) return;
      const coords = (f.geometry as GeoJSON.Point).coordinates;
      badgeMarker(
        [coords[0], coords[1]],
        meta.emoji,
        meta.color,
        meta.layer,
        pointPopup(String(p.name), `${meta.label} · ${p.state}`, {
          district: p.district,
          town: p.town,
          region: p.region,
          confidence: p.confidence,
          source: p.source,
        }),
        p.kind === "harbour" ? 26 : 22,
        6.6
      );
    });

    if (has("Fishing Grounds"))
      addPointSet(FISHING_GROUNDS, "Fishing Grounds", "◎", "#7C3AED", "Indicative fishing ground", 6.0);
    if (has("Coral Reefs")) addPointSet(CORAL_REEFS, "Coral Reefs", "🟠", "#F97316", "Coral reef (indicative extent)");
    if (has("Seagrass")) addPointSet(SEAGRASS, "Seagrass", "🌱", "#059669", "Seagrass meadow (indicative extent)");
    if (has("Mangroves")) addPointSet(MANGROVES, "Mangroves", "🌳", "#16A34A", "Mangrove block (indicative extent)");
    if (has("Estuaries")) addPointSet(ESTUARIES, "Estuaries", "🌊", "#0EA5E9", "Estuary mouth (indicative)");
    if (has("Marine Protected Areas"))
      addPointSet(PROTECTED_AREAS, "Marine Protected Areas", "🛡", "#8B5CF6", "Marine/coastal protected area", 6.0);
    if (has("Marine Biodiversity"))
      addPointSet(BIODIVERSITY_POINTS, "Marine Biodiversity", "🧬", "#65A30D", "Biodiversity reference area");
    if (has("Marine Mammals"))
      addPointSet(MARINE_MAMMALS, "Marine Mammals", "🐬", "#6366F1", "Marine mammal observation (indicative)");
    if (has("Sea Turtle Observations"))
      addPointSet(TURTLE_OBSERVATIONS, "Sea Turtle Observations", "🐢", "#0D9488", "Sea turtle observation (indicative)");
    if (has("Ocean Conditions"))
      addPointSet(OCEAN_CONDITIONS, "Ocean Conditions", "🛰", "#0891B2", "Ocean observation reference point", 6.0);
    if (has("Marine Pollution"))
      addPointSet(POLLUTION_POINTS, "Marine Pollution", "⚠️", "#DC2626", "Pollution pressure area (indicative)");

    if (has("Marine Habitats")) {
      [...CORAL_REEFS, ...SEAGRASS, ...MANGROVES, ...ESTUARIES].forEach((pt) => {
        const el = document.createElement("div");
        el.style.cssText =
          "width:64px;height:64px;border-radius:50%;background:radial-gradient(circle,rgba(163,230,53,.3) 0%,rgba(163,230,53,.06) 65%,transparent 72%);border:1px dashed rgba(163,230,53,.55);pointer-events:none;";
        const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([pt.lng, pt.lat]);
        marker.addTo(map);
        add(marker, "Marine Habitats", 5.5);
      });
    }

    const chipPlace = (p: (typeof STATE_PROFILES)[number], kind: "crafts" | "agencies" | "seasons"): [number, number] => {
      const dx = p.lng > 79 ? -0.6 : 0.6;
      if (kind === "crafts") return [p.lng + dx, p.lat + 0.55];
      if (kind === "agencies") return [p.lng + dx, p.lat - 0.4];
      return [p.lng + dx, p.lat + 1.2];
    };

    if (has("Fishing Crafts")) {
      STATE_PROFILES.forEach((p) => {
        badgeMarker(
          chipPlace(p, "crafts"),
          "🚤",
          "#0E7490",
          "Fishing Crafts",
          popupShell(
            `${p.state} · fishing crafts`,
            `${p.crafts.total.toLocaleString("en-IN")} total marine crafts`,
            metricRow("Mechanised", p.crafts.mechanized.toLocaleString("en-IN")) +
              metricRow("Motorised", p.crafts.motorized.toLocaleString("en-IN")) +
              metricRow("Non-motorised", p.crafts.nonMotorized.toLocaleString("en-IN")) +
              metricRow("Total", p.crafts.total.toLocaleString("en-IN"))
          ),
          26,
          5
        );
      });
    }

    if (has("Fisheries Agencies")) {
      STATE_PROFILES.forEach((p) => {
        const body = p.agencies
          .map(
            (a) =>
              `<div style="font-size:11.5px;padding:4px 0;border-bottom:1px dashed #e5eaf0"><b style="color:#082A38">${a.name}</b><div style="color:#5b6b78">${a.detail}</div></div>`
          )
          .join("");
        badgeMarker(
          chipPlace(p, "agencies"),
          "🏛",
          "#334155",
          "Fisheries Agencies",
          popupShell(p.state, `${p.agencies.length} fisheries agencies & divisions`, body),
          26,
          5
        );
      });
    }

    if (has("Fishing Seasons")) {
      STATE_PROFILES.forEach((p) => {
        const body =
          p.relief.period
            .split("·")
            .map((seg) => seg.trim())
            .filter(Boolean)
            .map((seg) => `<div style="font-size:12px;font-weight:600;color:#082A38;margin:4px 0">📅 ${seg}</div>`)
            .join("") +
          p.lean
            .slice(0, 3)
            .map(
              (l) =>
                `<div style="font-size:11px;color:#5b6b78;margin:3px 0">${l.region}: <b>${l.period}</b> ${confChip(l.confidence)}</div>`
            )
            .join("");
        badgeMarker(
          chipPlace(p, "seasons"),
          "📅",
          "#F97316",
          "Fishing Seasons",
          popupShell(`${p.state} · fishing seasons`, "Ban windows & lean periods", body),
          26,
          5
        );
      });
    }

    if (has("State Profiles")) {
      STATE_PROFILES.forEach((p) => {
        pillMarker([p.lng, p.lat - 1.1], `📍 ${p.state}`, { bg: "rgba(14,116,144,.92)", border: "2px solid #fff" }, "State Profiles", () =>
          buildStateRoot(p.slug)
        );
      });
    }

    /* --- legacy platform layers --- */
    if (has("Hotspots")) {
      const densityColors: Record<string, string> = {
        low: "#3b82f6",
        medium: "#eab308",
        high: "#f97316",
        very_high: "#ef4444",
      };
      legacyHotspots.forEach((hs) => {
        const color = densityColors[hs.density] || "#3b82f6";
        const size = hs.density === "very_high" ? 26 : hs.density === "high" ? 22 : hs.density === "medium" ? 18 : 14;
        const el = document.createElement("div");
        el.style.cssText = `width:${size}px;height:${size}px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.35);cursor:pointer;transition:transform .15s;`;
        el.onmouseenter = () => (el.style.transform = "scale(1.3)");
        el.onmouseleave = () => (el.style.transform = "scale(1)");
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([hs.lng, hs.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 12 }).setHTML(
              popupShell(
                hs.name,
                `${hs.density.replace("_", " ")} density · O3L hotspot`,
                metricRow("Contributions", hs.contributions.toLocaleString("en-IN"))
              )
            )
          );
        marker.addTo(map);
        add(marker, "Hotspots", 5.5);
      });
    }

    if (has("Zones")) {
      legacyZones.forEach((zone) => {
        const zoneHotspots = legacyHotspots.filter((h) => h.zone_id === zone.id);
        if (!zoneHotspots.length) return;
        const avgLat = zoneHotspots.reduce((s, h) => s + h.lat, 0) / zoneHotspots.length;
        const avgLng = zoneHotspots.reduce((s, h) => s + h.lng, 0) / zoneHotspots.length;
        pillMarker([avgLng, avgLat], `${zone.name} (${zone.score})`, { bg: "rgba(14,65,110,.85)", bold: false }, "Zones");
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, geo, activeSet]);

  /* ---------------- vector layer visibility ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !dataAdded) return;
    const setVis = (id: string, on: boolean) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none");
    };
    setVis("layer-states-fill", has("Coastal States"));
    setVis("layer-states-outline", has("Coastal States"));
    setVis("layer-districts-fill", has("Coastal Districts"));
    setVis("layer-districts-outline", has("Coastal Districts"));
    setVis("layer-bands-ban", has("Fishing Ban Areas"));
    setVis("layer-bands-ban-line", has("Fishing Ban Areas"));
    setVis("layer-bands-lean", has("Lean Fishing Periods"));
  }, [activeSet, dataAdded, has]);

  /* ---------------- controls ---------------- */

  const fitBoundsOf = (coords: unknown, padding = 50) => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = new maplibregl.LngLatBounds();
    const walk = (c: unknown): void => {
      if (!Array.isArray(c)) return;
      if (typeof c[0] === "number") bounds.extend([c[0], c[1]]);
      else c.forEach(walk);
    };
    walk(coords);
    map.fitBounds(bounds, { padding, duration: 1100, maxZoom: 8.5 });
  };

  const fitRegion = () => mapRef.current?.fitBounds(REGION_BOUNDS, { padding: 30, duration: 1000 });

  const fitSelected = () => {
    const feature = geo?.states.features.find((f) => f.properties?.slug === selectedState);
    if (feature) fitBoundsOf((feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon).coordinates);
  };

  return (
    <div className="relative w-full h-full">
      {/* maplibre-gl.css forces `.maplibregl-map { position: relative }`, which would defeat
          Tailwind's `absolute inset-0` — size the container explicitly with w-full h-full. */}
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* basemap switch */}
      <div className="absolute top-3 left-3 z-10 flex rounded-lg overflow-hidden shadow-lg border border-slate-200 bg-white/95 backdrop-blur">
        {(["satellite", "streets"] as BasemapMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onBasemapChange(mode)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              basemap === mode ? "bg-ocean-navy text-white" : "text-ocean-navy hover:bg-ocean-light"
            }`}
          >
            {mode === "satellite" ? "🛰 Satellite" : "🗺 Streets"}
          </button>
        ))}
      </div>

      {/* fit controls */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 hidden md:flex gap-2">
        <button
          onClick={fitRegion}
          className="px-3 py-1.5 text-xs font-semibold bg-white/95 hover:bg-white text-ocean-navy rounded-lg shadow-lg border border-slate-200"
        >
          ⤢ Region
        </button>
        <button
          onClick={fitSelected}
          className="px-3 py-1.5 text-xs font-semibold bg-white/95 hover:bg-white text-ocean-navy rounded-lg shadow-lg border border-slate-200"
        >
          ⤢ {STATE_PROFILES.find((p) => p.slug === selectedState)?.state}
        </button>
      </div>

      {/* legend */}
      <div className="absolute bottom-10 left-3 z-10 bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-lg px-3 py-2 max-w-[236px] max-h-[45vh] overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Legend</div>
        <div className="space-y-1">
          {LEGEND_ITEMS.filter((item) => item.layer === "__base__" || has(item.layer)).map((item) => (
            <div key={item.layer + item.label} className="flex items-center gap-2 text-[11px] text-slate-700">
              <span
                className="inline-block w-3.5 h-3.5 rounded-sm border border-white shadow-sm shrink-0"
                style={{ background: item.swatch }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        {(COPERNICUS_FIELDS.some((field) => has(field.layerId)) || has("Potential Fishing Zones")) && (
          <p className="mt-2 border-t border-slate-200 pt-2 text-[10px] leading-relaxed text-slate-500">
            Copernicus Marine · model and satellite data. Layer update frequency and measurement type vary by product.
            {has("Potential Fishing Zones") &&
              " Potential fishing-zone markers show relative chlorophyll hotspots; temperature fronts add support where detected. They are not official INCOIS advisories or catch forecasts."}
            {has("Live Ocean Currents") &&
              " Animated flow trails show modeled current direction; color indicates speed. Click the sea for speed and bearing. © European Union, Copernicus Marine Service."}
          </p>
        )}
        {has("Potential Fishing Zones") && pfzStatus !== "idle" && (
          <p
            role="status"
            className={`mt-2 text-[10px] leading-relaxed ${pfzStatus === "partial" || pfzStatus === "unavailable" ? "text-amber-700" : "text-slate-600"}`}
          >
            {pfzStatus === "loading" && "Screening the visible sea area with Copernicus data…"}
            {pfzStatus === "ready" &&
                "Showing relative chlorophyll hotspots; temperature fronts add support where detected."}
            {pfzStatus === "partial" && `Copernicus coverage is incomplete. ${pfzCoverage}`}
            {pfzStatus === "empty" && `No relative hotspots identified. ${pfzCoverage}`}
            {pfzStatus === "unavailable" && `Not enough valid Copernicus readings. ${pfzCoverage}`}
          </p>
        )}
        {has("Live Ocean Currents") && currentDataWarning && (
          <p role="status" className="mt-2 text-[10px] leading-relaxed text-amber-700">
            Some current flow lines could not be loaded. Pan or zoom the map to retry.
          </p>
        )}
      </div>
    </div>
  );
}

interface LegendItem {
  layer: string;
  label: string;
  swatch: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { layer: "__base__", label: "EEZ / marine boundary", swatch: "#38BDF8" },
  { layer: "Coastal States", label: "State boundary & fill", swatch: "rgba(56,189,248,0.45)" },
  { layer: "Coastal Districts", label: "Coastal district", swatch: "rgba(226,232,240,0.9)" },
  { layer: "Coastal Length", label: "Coastal length", swatch: "#087EA4" },
  { layer: "Marine Fishing Villages", label: "Marine fishing village", swatch: "#2563EB" },
  { layer: "Fishing Harbours", label: "Fishing harbour ⚓", swatch: "#0F766E" },
  { layer: "Landing Centres", label: "Landing centre ⚑", swatch: "#0891B2" },
  { layer: "Fishing Grounds", label: "Fishing ground", swatch: "#7C3AED" },
  { layer: "Fishing Crafts", label: "Fishing crafts 🚤", swatch: "#0E7490" },
  { layer: "Fisheries Agencies", label: "Fisheries agency 🏛", swatch: "#334155" },
  { layer: "Fishing Seasons", label: "Fishing season 📅", swatch: "#F97316" },
  { layer: "Fishing Ban Areas", label: "Fishing ban area 🔴", swatch: "rgba(220,38,38,0.55)" },
  { layer: "Lean Fishing Periods", label: "Lean period 🟡", swatch: "#FACC15" },
  { layer: "Potential Fishing Zones", label: "Indicative fishing-zone hotspot", swatch: "radial-gradient(circle, #A3E635, #16A34A)" },
  { layer: "Marine Habitats", label: "Marine habitat halo", swatch: "rgba(163,230,53,0.4)" },
  { layer: "Coral Reefs", label: "Coral reef 🟠", swatch: "#F97316" },
  { layer: "Seagrass", label: "Seagrass 🌱", swatch: "#059669" },
  { layer: "Mangroves", label: "Mangrove 🌳", swatch: "#16A34A" },
  { layer: "Estuaries", label: "Estuary 🌊", swatch: "#0EA5E9" },
  { layer: "Marine Protected Areas", label: "Marine protected area 🛡", swatch: "#8B5CF6" },
  { layer: "Marine Biodiversity", label: "Biodiversity reference", swatch: "#65A30D" },
  { layer: "Marine Mammals", label: "Marine mammal 🐬", swatch: "#6366F1" },
  { layer: "Sea Turtle Observations", label: "Sea turtle 🐢", swatch: "#0D9488" },
  { layer: "Ocean Conditions", label: "Ocean condition 🛰", swatch: "#0891B2" },
  { layer: "Live Sea Temperature", label: "Sea surface temperature (°C)", swatch: "linear-gradient(90deg, #313695, #74add1, #ffffbf, #f46d43, #a50026)" },
  { layer: "Live Sea Salinity", label: "Sea surface salinity (PSU)", swatch: "linear-gradient(90deg, #440154, #31688e, #35b779, #fde725)" },
  { layer: "Live Chlorophyll", label: "Chlorophyll-a concentration (mg/m³)", swatch: "linear-gradient(90deg, #440154, #31688e, #35b779, #fde725)" },
  { layer: "Live Ocean Swell", label: "Primary swell height (m)", swatch: "linear-gradient(90deg, #313695, #74add1, #ffffbf, #f46d43, #a50026)" },
  { layer: "Live Ocean Currents", label: "Ocean current flow & speed (m/s)", swatch: "linear-gradient(90deg, #22D3EE, #A3E635, #FACC15, #FB7185)" },
  { layer: "Marine Pollution", label: "Pollution pressure ⚠️", swatch: "#DC2626" },
  { layer: "Hotspots", label: "O3L hotspot 🔥", swatch: "#F97316" },
  { layer: "Zones", label: "O3L zone 🏷", swatch: "#0E7490" },
  { layer: "State Profiles", label: "State profile pin 📍", swatch: "#0E7490" },
];
