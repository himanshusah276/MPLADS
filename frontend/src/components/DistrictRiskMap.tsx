import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { DistrictRiskSummary } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { MapPin, AlertCircle, TrendingUp } from 'lucide-react';

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const DistrictRiskMap: React.FC<{ onSelectDistrict?: (dist: string) => void }> = ({ onSelectDistrict }) => {
  const { selectedState, t } = useApp();
  const [districts, setDistricts] = useState<DistrictRiskSummary[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.8, 79.0]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  useEffect(() => {
    api.getDistrictsHeatmap(selectedState).then((data) => {
      setDistricts(data);
      if (data && data.length > 0 && selectedState !== 'All states') {
        const avgLat = data.reduce((sum, d) => sum + d.lat, 0) / data.length;
        const avgLong = data.reduce((sum, d) => sum + d.long, 0) / data.length;
        setMapCenter([avgLat, avgLong]);
        setMapZoom(7);
      } else {
        setMapCenter([21.8, 79.0]);
        setMapZoom(5);
      }
    }).catch(console.error);
  }, [selectedState]);

  const getColor = (band: string) => {
    switch (band) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      default: return '#10b981';
    }
  };

  return (
    <div className="bg-gov-card border border-gov-border rounded-lg p-4 flex flex-col h-full shadow-sm">
      {/* Map Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            {t('district_risk_map')}
          </h3>
          <p className="text-[11px] text-gov-textMuted">
            Choropleth of composite risk score by district
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 text-[11px]">low</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300 text-[11px]">medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-slate-300 text-[11px]">high</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-slate-300 text-[11px]">critical</span>
          </div>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="relative flex-1 w-full min-h-[300px] rounded-md overflow-hidden border border-slate-800">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {districts.map((d) => (
            <CircleMarker
              key={`${d.state}-${d.district}`}
              center={[d.lat, d.long]}
              radius={Math.max(6, Math.min(18, d.composite_risk_score / 4))}
              pathOptions={{
                color: getColor(d.risk_band),
                fillColor: getColor(d.risk_band),
                fillOpacity: 0.65,
                weight: 2
              }}
              eventHandlers={{
                click: () => onSelectDistrict && onSelectDistrict(d.district)
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1.5 min-w-[170px]">
                  <div className="font-bold text-slate-100 text-sm border-b border-slate-700 pb-1 flex items-center justify-between">
                    <span>{d.district}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold" style={{ backgroundColor: `${getColor(d.risk_band)}22`, color: getColor(d.risk_band) }}>
                      {d.risk_band}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{d.state}</div>
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Total Works:</span>
                      <span className="font-mono font-semibold text-white">{d.total_works}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Sanctioned:</span>
                      <span className="font-mono text-white">₹{d.total_sanctioned_lakh} L</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Open Alerts:</span>
                      <span className="font-mono font-bold text-red-400">{d.open_alerts} ({d.critical_alerts} crit)</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Risk Score:</span>
                      <span className="font-mono font-bold text-amber-300">{d.composite_risk_score}/100</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
