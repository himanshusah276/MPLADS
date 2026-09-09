import React from 'react';
import { HeaderFilterBar } from './HeaderFilterBar';
import { KPICards } from './KPICards';
import { DistrictRiskMap } from './DistrictRiskMap';
import { HighestRiskMPs } from './HighestRiskMPs';
import { RecentAlertsTable } from './RecentAlertsTable';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Filter Bar strictly matching wireframe */}
      <HeaderFilterBar />

      {/* 4 KPI Cards strictly matching wireframe */}
      <KPICards />

      {/* 2-Column Row: District Risk Map (Left) + Highest Risk MPs (Right) strictly matching wireframe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 min-h-[380px]">
          <DistrictRiskMap />
        </div>
        <div className="lg:col-span-4 min-h-[380px]">
          <HighestRiskMPs />
        </div>
      </div>

      {/* Recent Alerts Table strictly matching wireframe */}
      <RecentAlertsTable />
    </div>
  );
};
