import { 
  DashboardKPIs, 
  DistrictRiskSummary, 
  MP, 
  Work, 
  AnomalyAlert, 
  ImplementingAgency, 
  PreCheckWorkResponse,
  UserProfile 
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('mplads_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options?.headers }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `API Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // KPIs & Stats
  getKPIs: (state?: string, financial_year?: string) => {
    const params = new URLSearchParams();
    if (state && state !== 'All') params.append('state', state);
    if (financial_year && financial_year !== 'All') params.append('financial_year', financial_year);
    return fetchJSON<DashboardKPIs>(`/stats/kpis?${params.toString()}`);
  },

  getDistrictsHeatmap: (state?: string) => {
    const params = new URLSearchParams();
    if (state && state !== 'All') params.append('state', state);
    return fetchJSON<DistrictRiskSummary[]>(`/stats/districts-heatmap?${params.toString()}`);
  },

  getHighestRiskMPs: (state?: string, limit: number = 10) => {
    const params = new URLSearchParams();
    if (state && state !== 'All') params.append('state', state);
    params.append('limit', limit.toString());
    return fetchJSON<any[]>(`/stats/highest-risk-mps?${params.toString()}`);
  },

  getCategoryDistribution: (state?: string) => {
    const params = new URLSearchParams();
    if (state && state !== 'All') params.append('state', state);
    return fetchJSON<{ category: string; works_count: number; total_amount_cr: number }[]>(`/stats/category-distribution?${params.toString()}`);
  },

  // Alerts
  getAlerts: (severity?: string, status?: string, state?: string, district?: string) => {
    const params = new URLSearchParams();
    if (severity && severity !== 'All') params.append('severity', severity);
    if (status && status !== 'All') params.append('status', status);
    if (state && state !== 'All') params.append('state', state);
    if (district && district !== 'All') params.append('district', district);
    params.append('limit', '300');
    return fetchJSON<AnomalyAlert[]>(`/alerts?${params.toString()}`);
  },

  getAlertDetail: (alert_id: string) => {
    return fetchJSON<AnomalyAlert>(`/alerts/${alert_id}`);
  },

  triageAlert: (alert_id: string, status: string, comment: string, reviewer_role: string = 'Auditor') => {
    return fetchJSON<any>(`/alerts/${alert_id}/triage`, {
      method: 'POST',
      body: JSON.stringify({ status, comment, reviewer_role })
    });
  },

  // Works
  getWorks: (filters?: { state?: string; district?: string; mp_id?: string; category?: string; status?: string; risk_band?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.state && filters.state !== 'All') params.append('state', filters.state);
    if (filters?.district && filters.district !== 'All') params.append('district', filters.district);
    if (filters?.mp_id && filters.mp_id !== 'All') params.append('mp_id', filters.mp_id);
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.risk_band && filters.risk_band !== 'All') params.append('risk_band', filters.risk_band);
    if (filters?.search) params.append('search', filters.search);
    params.append('limit', '250');
    return fetchJSON<Work[]>(`/works?${params.toString()}`);
  },

  getWorkDetail: (work_id: string) => {
    return fetchJSON<{
      work: Work;
      mp: MP;
      agency: ImplementingAgency;
      releases: any[];
      alerts: AnomalyAlert[];
      timeline: any[];
      cost_analytics: any;
    }>(`/works/${work_id}`);
  },

  // MPs
  getMPs: (filters?: { state?: string; house?: string; risk_band?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.state && filters.state !== 'All') params.append('state', filters.state);
    if (filters?.house && filters.house !== 'All') params.append('house', filters.house);
    if (filters?.risk_band && filters.risk_band !== 'All') params.append('risk_band', filters.risk_band);
    if (filters?.search) params.append('search', filters.search);
    return fetchJSON<MP[]>(`/mps?${params.toString()}`);
  },

  getMPDossier: (mp_id: string) => {
    return fetchJSON<{
      mp: MP;
      works_count: number;
      works: Work[];
      ucs: any[];
      alerts: AnomalyAlert[];
      entitlement_summary: any;
    }>(`/mps/${mp_id}`);
  },

  preCheckWorkRecommendation: (payload: {
    mp_id: string;
    state: string;
    district: string;
    category: string;
    description: string;
    estimated_cost: number;
    implementing_agency_id?: string;
    is_outside_constituency: boolean;
  }) => {
    return fetchJSON<PreCheckWorkResponse>('/mps/pre-check-recommendation', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Agencies
  getAgencies: (filters?: { state?: string; district?: string; agency_type?: string; risk_band?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.state && filters.state !== 'All') params.append('state', filters.state);
    if (filters?.district && filters.district !== 'All') params.append('district', filters.district);
    if (filters?.agency_type && filters.agency_type !== 'All') params.append('agency_type', filters.agency_type);
    if (filters?.risk_band && filters.risk_band !== 'All') params.append('risk_band', filters.risk_band);
    if (filters?.search) params.append('search', filters.search);
    return fetchJSON<ImplementingAgency[]>(`/agencies?${params.toString()}`);
  },

  // ML Analysis trigger
  runMLAnalysis: () => {
    return fetchJSON<{
      status: string;
      total_alerts_generated: number;
      critical_count: number;
      high_count: number;
      analyzed_works_count: number;
      timestamp: string;
    }>('/ml/run-analysis', {
      method: 'POST'
    });
  },

  getMLMetrics: () => {
    return fetchJSON<any>('/ml/metrics');
  },

  // Roles & Auth
  getDemoRoles: () => {
    return fetchJSON<UserProfile[]>('/auth/demo-roles');
  }
};
