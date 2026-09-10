import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { DistrictRiskSummary } from '../types';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { MapPin } from 'lucide-react';

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
      case 'Critical': return '#dc2626';
      case 'High': return '#ea580c';
      case 'Medium': return '#d97706';
      default: return '#16a34a';
    }
  };

  return (
    <div className="bg-gov-card border border-gov-border p-4 flex flex-col h-full shadow-gov">
      {/* Map Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-gov-primary flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            {t('district_risk_map')}
          </h3>
          <p className="text-[11px] text-gov-muted">
            Choropleth of composite risk score by district
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs bg-gov-card-muted px-2.5 py-1 border border-gov-border font-medium">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-emerald-600"></span>
            <span className="text-gov-secondary text-[11px]">low</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-amber-500"></span>
            <span className="text-gov-secondary text-[11px]">medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-orange-500"></span>
            <span className="text-gov-secondary text-[11px]">high</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 bg-red-600"></span>
            <span className="text-gov-secondary text-[11px]">critical</span>
          </div>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="relative flex-1 w-full min-h-[300px] overflow-hidden border border-gov-border">
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
                fillOpacity: 0.7,
                weight: 2
              }}
              eventHandlers={{
                click: () => onSelectDistrict && onSelectDistrict(d.district)
              }}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1.5 min-w-[170px] font-sans">
                  <div className="font-bold text-gov-primary text-sm border-b border-gov-border pb-1 flex items-center justify-between">
                    <span>{d.district}</span>
                    <span className="text-[10px] px-1.5 py-0.2 font-mono font-bold" style={{ backgroundColor: `${getColor(d.risk_band)}22`, color: getColor(d.risk_band) }}>
                      {d.risk_band}
                    </span>
                  </div>
                  <div className="text-gov-muted text-[11px] font-medium">{d.state}</div>
                  <div className="space-y-1 pt-1 text-[11px]">
                    <div className="flex justify-between text-gov-secondary">
                      <span>Total Works:</span>
                      <span className="font-mono font-bold text-gov-primary">{d.total_works}</span>
                    </div>
                    <div className="flex justify-between text-gov-secondary">
                      <span>Sanctioned:</span>
                      <span className="font-mono font-bold text-gov-primary">₹{d.total_sanctioned_lakh} L</span>
                    </div>
                    <div className="flex justify-between text-gov-secondary">
                      <span>Open Alerts:</span>
                      <span className="font-mono font-bold text-red-600">{d.open_alerts} ({d.critical_alerts} crit)</span>
                    </div>
                    <div className="flex justify-between text-gov-secondary">
                      <span>Risk Score:</span>
                      <span className="font-mono font-bold text-amber-600">{d.composite_risk_score}/100</span>
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
