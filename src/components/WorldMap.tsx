import React, { useEffect, useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Loader2, Server } from 'lucide-react';
import { ServerLocation } from '@/hooks/useServerLocations';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const markerColors = [
  { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' }, // blue
  { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' }, // green
  { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }, // amber
  { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' }, // pink
  { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' }, // violet
  { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' }, // cyan
];

const truncateDomain = (domain: string, limit = 26) =>
  domain.length > limit ? `${domain.slice(0, limit - 3)}...` : domain;

const mapThemes = {
  mylight: {
    legendBackground: 'rgba(255, 255, 255, 0.98)',
    legendBorder: '#e2e8f0',
    legendHeading: '#0f172a',
    legendMuted: '#475569',
    sectionBackground: '#f4f6fb',
    sectionBorder: '#e5e7eb',
    oceanFill: '#f4f6fb',
    landFill: '#d6dae3',
    landHover: 'rgba(234, 88, 12, 0.2)',
    landStroke: '#dee2eb',
    tooltipBackground: '#ffffff',
    tooltipText: '#1f2937',
    tooltipMuted: '#475569',
  },
  mydark: {
    legendBackground: 'rgba(15, 23, 42, 0.9)',
    legendBorder: '#334155',
    legendHeading: '#f1f5f9',
    legendMuted: '#94a3b8',
    sectionBackground: '#0b1424',
    sectionBorder: '#334155',
    oceanFill: '#0b1424',
    landFill: '#2f3f57',
    landHover: 'rgba(234, 88, 12, 0.35)',
    landStroke: '#3e4d66',
    tooltipBackground: '#0f172a',
    tooltipText: '#e2e8f0',
    tooltipMuted: '#94a3b8',
  },
} as const;

type MapThemeKey = keyof typeof mapThemes;

interface WorldMapProps {
  locations: ServerLocation[];
  loading?: boolean;
}

const deriveInitialView = (
  groups: {
    coordinates: [number, number];
  }[]
) => {
  if (groups.length === 0) {
    return {
      coordinates: [110, 5] as [number, number],
      zoom: 2,
    };
  }

  const longitudes = groups.map((group) => group.coordinates[0]);
  const latitudes = groups.map((group) => group.coordinates[1]);
  const lonMin = Math.min(...longitudes);
  const lonMax = Math.max(...longitudes);
  const latMin = Math.min(...latitudes);
  const latMax = Math.max(...latitudes);

  const lonSpan = Math.max(10, lonMax - lonMin);
  const latSpan = Math.max(8, latMax - latMin);
  const span = Math.max(lonSpan, latSpan * 1.4);
  const zoom = Math.min(4.5, Math.max(1.4, 220 / span));

  const center: [number, number] = [
    Math.max(-10, Math.min(10, (lonMin + lonMax) / 2)),
    Math.max(-20, Math.min(20, (latMin + latMax) / 2)),
  ];

  return {
    coordinates: center,
    zoom,
  };
};

export const WorldMap: React.FC<WorldMapProps> = ({ locations, loading }) => {
  const { theme } = useTheme();
  const themeKey: MapThemeKey = theme === 'mydark' ? 'mydark' : 'mylight';
  const palette = mapThemes[themeKey];
  const mapHeightClass =
    "h-[240px] sm:h-[340px] md:h-[420px] lg:h-[500px]";

  const groupedLocations = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        coordinates: [number, number];
        city: string;
        country: string;
        endpoints: string[];
        ips: string[];
      }
    >();

    locations.forEach((location) => {
      const key = `${location.city}-${location.country}-${location.coordinates[0]}-${location.coordinates[1]}`;
      const current = groups.get(key);

      if (current) {
        current.endpoints.push(location.endpoint);
        if (location.ip) current.ips.push(location.ip);
      } else {
        groups.set(key, {
          key,
          coordinates: location.coordinates,
          city: location.city,
          country: location.country,
          endpoints: [location.endpoint],
          ips: location.ip ? [location.ip] : [],
        });
      }
    });

    return Array.from(groups.values());
  }, [locations]);

  const maxEndpoints = useMemo(() => {
    if (groupedLocations.length === 0) return 1;
    return Math.max(...groupedLocations.map((loc) => loc.endpoints.length));
  }, [groupedLocations]);

  const [activeRegionKey, setActiveRegionKey] = useState<string | null>(null);
  const initialView = useMemo(() => deriveInitialView(groupedLocations), [groupedLocations]);
  const [mapPosition, setMapPosition] = useState(initialView);

  useEffect(() => {
    setMapPosition(initialView);
  }, [initialView]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border transition-colors",
            mapHeightClass
          )}
          style={{
            background: palette.sectionBackground,
            borderColor: palette.sectionBorder,
          }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "relative w-full rounded-lg border transition-all duration-500 shadow-xl overflow-hidden"
        )}
        style={{
          background: palette.sectionBackground,
          borderColor: palette.sectionBorder,
        }}
      >
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex justify-center pointer-events-none">
          <div
            className="pointer-events-auto inline-flex items-center gap-4 rounded-2xl border px-5 py-3 shadow-lg"
            style={{
              background: palette.legendBackground,
              borderColor: palette.legendBorder,
              color: palette.legendHeading,
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Server className="w-5 h-5 text-primary" />
              <span>Server Locations</span>
            </div>
            <div className="text-xs font-medium" style={{ color: palette.legendMuted }}>
              Total: <span className="text-primary font-bold text-sm">{locations.length}</span> active{' '}
              {locations.length === 1 ? 'server' : 'servers'}
            </div>
          </div>
        </div>

        <div className="relative z-10 p-0 sm:p-4">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 150,
            }}
          className={cn("w-full", mapHeightClass)}
          style={{ background: palette.sectionBackground }}
          >
          <ZoomableGroup
            center={mapPosition.coordinates}
            zoom={mapPosition.zoom}
            translateExtent={[
              [-820, -420],
              [820, 420],
            ]}
            onMoveEnd={(position) => {
              const zoom = Math.max(0.7, Math.min(4, position.zoom));
              const clampedCoordinates: [number, number] = [
                Math.max(-180, Math.min(180, position.coordinates[0])),
                Math.max(-70, Math.min(70, position.coordinates[1])),
              ];
              setMapPosition({
                coordinates: clampedCoordinates,
                zoom,
              });
            }}
          >
              {/* Ocean background */}
              <rect
                x={-800}
                y={-400}
                width={1600}
                height={800}
                fill={palette.oceanFill}
              />
            
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => {
                    const name = (geo.properties?.name as string | undefined) ?? '';
                    return name.toLowerCase() !== 'antarctica';
                  })
                  .map((geo) => {
                    const countryName = (geo.properties?.name as string | undefined) ?? '';
                  const matchedGroup = groupedLocations.find(
                    (group) =>
                      group.country &&
                      countryName.toLowerCase().includes(group.country.toLowerCase())
                  );
                  const colorIndex = matchedGroup
                    ? groupedLocations.indexOf(matchedGroup) % markerColors.length
                    : null;
                  const fillColor =
                    colorIndex !== null ? markerColors[colorIndex].primary : palette.landFill;
                  const fillOpacity =
                    matchedGroup && activeRegionKey === matchedGroup.key
                      ? 0.7
                      : matchedGroup
                      ? 0.3
                      : 1;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      stroke={palette.landStroke}
                      strokeWidth={0.5}
                      className="outline-none transition-[fill] duration-300"
                      style={{
                        default: {
                          fill: matchedGroup ? fillColor : palette.landFill,
                          fillOpacity,
                          outline: 'none',
                        },
                        hover: {
                          fill: matchedGroup ? fillColor : palette.landHover,
                          fillOpacity: matchedGroup ? 0.85 : 1,
                          outline: 'none',
                        },
                        pressed: { fill: palette.landFill, outline: 'none' },
                      }}
                    />
                  );
                  })
              }
            </Geographies>
            
            {groupedLocations.map((location, index) => {
              const color = markerColors[index % markerColors.length];
              const count = location.endpoints.length;
              const dotRadius = 5 + Math.min(count, 4);
              const emphasisWeight = Math.min(900, 500 + count * 60);
              const tooltipHeight = 48 + count * 14;
              const tooltipWidth = 200;
              const tooltipY = -(tooltipHeight + 12);
              const isActive = activeRegionKey === location.key;
              const scale = 1 / (mapPosition.zoom || 1);
              return (
                <Marker key={`${location.key}-${index}`} coordinates={location.coordinates}>
                  <g
                    className="group/marker cursor-pointer"
                    onMouseEnter={() => setActiveRegionKey(location.key)}
                    onMouseLeave={() => setActiveRegionKey(null)}
                    transform={`scale(${scale})`}
                  >
                    <circle
                      r={dotRadius + 6}
                      fill={color.primary}
                      className="animate-ping"
                      style={{ opacity: isActive ? 0.6 : 0.35 }}
                    />
                    <circle
                      r={dotRadius + 2}
                      fill={color.primary}
                      className="opacity-40"
                    />
                    <circle
                      r={dotRadius}
                      fill={color.primary}
                      className="shadow-lg animate-pulse"
                      style={{ filter: `drop-shadow(0 0 10px ${color.glow})` }}
                    />
                  
                    {/* Tooltip on hover */}
                    <g className="opacity-0 group-hover/marker:opacity-100 transition-all duration-300 pointer-events-none">
                      <rect
                        x={15}
                        y={tooltipY}
                        width={tooltipWidth}
                        height={tooltipHeight}
                        rx={6}
                        fill={palette.tooltipBackground}
                        stroke={color.primary}
                        strokeWidth={2}
                        className="drop-shadow-2xl"
                      />
                      <text
                        x={25}
                        y={tooltipY + 20}
                        fontSize={12}
                        fontWeight={emphasisWeight}
                        fill={color.primary}
                      >
                        {location.city}, {location.country}
                      </text>
                      {location.endpoints.map((endpoint, lineIndex) => (
                        <text
                          key={`${endpoint}-${lineIndex}`}
                          x={25}
                          y={tooltipY + 38 + lineIndex * 14}
                          fontSize={10}
                          fill={palette.tooltipText}
                          fontFamily="monospace"
                        >
                          {truncateDomain(endpoint)}
                        </text>
                      ))}
                    </g>
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

        {/* Mobile badge */}
        <div className="sm:hidden flex justify-center">
          <div
            className="inline-flex items-center gap-4 rounded-2xl border px-5 py-3 shadow-lg mt-4"
            style={{
              background: palette.legendBackground,
              borderColor: palette.legendBorder,
              color: palette.legendHeading,
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Server className="w-5 h-5 text-primary" />
              <span>Server Locations</span>
            </div>
            <div className="text-xs font-medium" style={{ color: palette.legendMuted }}>
              Total: <span className="text-primary font-bold text-sm">{locations.length}</span> active{' '}
              {locations.length === 1 ? 'server' : 'servers'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

