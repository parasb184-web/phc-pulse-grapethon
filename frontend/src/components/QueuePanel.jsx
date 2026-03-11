import React from 'react';
import { usePHC } from '../context/PHCContext';
import { Clock } from 'lucide-react';

const QueuePanel = () => {
  const { aiWaitData, isWaitLoading } = usePHC();

  const waitMinutes = aiWaitData?.estimatedWaitMinutes || 20;
  const predictedMinutes = aiWaitData?.predictedWaitMinutes || waitMinutes;
  const forecastHorizon = aiWaitData?.forecastHorizonMinutes || 60;
  // Green <20min, Amber <45min, Red 45+
  const color = waitMinutes < 20 ? "var(--success)" : waitMinutes < 45 ? "var(--warning)" : "var(--error)";
  const futureColor = predictedMinutes < 20 ? "var(--success)" : predictedMinutes < 45 ? "var(--warning)" : "var(--error)";

  return (
    <div className="glass-card flex-col items-center justify-center text-center w-full relative">
      <Clock size={32} color={color} style={{ margin: '0 auto', display: 'block' }} />

      {isWaitLoading ? (
        <h1 style={{ fontSize: '3rem', margin: '0.5rem 0', opacity: 0.5 }}>...</h1>
      ) : (
        <h1 className="animate-fade-in" style={{ fontSize: '3rem', margin: '0.5rem 0', color }}>
          {waitMinutes}<span style={{ fontSize: '1.2rem', opacity: 0.7 }}>m</span>
        </h1>
      )}

      <p style={{ fontWeight: 800 }}>Predicted Wait Time</p>

      {aiWaitData && !isWaitLoading && (
        <div className="animate-fade-in" style={{ marginTop: '0.5rem', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Current Estimate</div>
              <div style={{ fontWeight: 800, color }}>{waitMinutes}m</div>
            </div>
            <div style={{ padding: '0.6rem', borderRadius: '8px', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Forecast ({Math.round(forecastHorizon / 60)}h)
              </div>
              <div style={{ fontWeight: 800, color: futureColor }}>{predictedMinutes}m</div>
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', background: 'var(--surface-muted)', color: 'var(--text-secondary)', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            {"Confidence: " + aiWaitData.confidenceRange}
          </span>
          <p style={{ fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic' }}>{aiWaitData.reasoning}</p>
          {aiWaitData.peakWarning && (
            <p style={{ color: "var(--warning)", fontWeight: 'bold', fontSize: '0.8rem', marginTop: '4px' }}>
              Peak period warning active
            </p>
          )}
          <p style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.7 }}>
            Best Arrival Window: {aiWaitData.bestArrivalWindow || aiWaitData.bestTimeToVisit}
          </p>
        </div>
      )}
    </div>
  );
};

export default QueuePanel;
