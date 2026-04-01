"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Droplets, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { MetricData, SimulationMode } from '@/hooks/useWearable';

type DashboardProps = {
  dataHistory: MetricData[];
  currentMetrics: { hrv: number; eda: number };
  simulationMode: SimulationMode;
  onSimulationModeChange: (mode: SimulationMode) => void;
};

export function Dashboard({ dataHistory, currentMetrics, simulationMode, onSimulationModeChange }: DashboardProps) {
  const isAbnormal = simulationMode === 'abnormal';
  
  return (
    <div className="space-y-6">
      {/* Simulation Mode Toggle */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAbnormal ? (
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800">Data Simulation Mode</h3>
              <p className="text-sm text-gray-500">
                {isAbnormal 
                  ? 'Simulating abnormal stress patterns (Low HRV, High EDA)' 
                  : 'Simulating normal relaxed patterns (Normal HRV & EDA)'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onSimulationModeChange(isAbnormal ? 'normal' : 'abnormal')}
            className={`relative inline-flex h-10 w-48 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAbnormal 
                ? 'bg-red-500 focus:ring-red-500' 
                : 'bg-green-500 focus:ring-green-500'
            }`}
          >
            <span
              className={`inline-flex h-8 w-22 transform items-center justify-center rounded-full bg-white text-xs font-semibold shadow-md transition-all duration-300 ${
                isAbnormal ? 'translate-x-24' : 'translate-x-1'
              }`}
              style={{ width: '5.5rem' }}
            >
              {isAbnormal ? 'Abnormal' : 'Normal'}
            </span>
            <span 
              className={`absolute text-xs font-medium text-white ${
                isAbnormal ? 'left-3' : 'right-3'
              }`}
            >
              {isAbnormal ? 'Normal' : 'Abnormal'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Heart Rate Variability (HRV)"
          value={currentMetrics.hrv}
          unit="ms"
          icon={Activity}
          colorClass="text-rose-500"
          bgClass="bg-rose-50"
          description="Standard Range: 40-100 ms"
        />
        <MetricCard
          title="Electrodermal Activity (EDA)"
          value={currentMetrics.eda}
          unit="µS"
          icon={Droplets}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
          description="Standard Range: 1-10 µS"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HRV Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Live HRV Monitoring</h3>
            <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded-full font-medium">Real-time</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis 
                  domain={[0, 120]} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <ReferenceLine y={45} stroke="red" strokeDasharray="3 3" label={{ value: 'Stress Threshold', position: 'insideBottomRight', fill: 'red', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="hrv" 
                  stroke="#e11d48" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6 }} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EDA Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Live EDA Monitoring</h3>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Real-time</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis 
                  domain={[0, 15]} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <ReferenceLine y={8} stroke="red" strokeDasharray="3 3" label={{ value: 'Stress Threshold', position: 'insideBottomRight', fill: 'red', fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="eda" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-semibold text-indigo-900">AI Insight</h4>
          <p className="text-sm text-indigo-700 mt-1">
            Based on your current biometrics, your stress levels appear {currentMetrics.eda > 6 || currentMetrics.hrv < 50 ? "elevated" : "stable"}. 
            {currentMetrics.eda > 6 || currentMetrics.hrv < 50 
              ? " Consider taking a short break to practice deep breathing." 
              : " Keep up the good work maintaining a balanced state!"}
          </p>
        </div>
      </div>
    </div>
  );
}
