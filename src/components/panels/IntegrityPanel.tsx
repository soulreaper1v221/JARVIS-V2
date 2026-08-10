// ─── System integrity panel ───────────────────────────────────────────────

import { useState } from 'react';
import { runIntegrityCheck } from '../../engine/integrity';
import type { IntegrityReport, CheckResult } from '../../engine/integrity';

const STATUS_COLOR: Record<string, string> = {
  pass: '#22e07a',
  warn: '#ffb020',
  fail: '#ff4d6d',
};

export default function IntegrityPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const start = async () => {
    setRunning(true);
    setReport(null);
    setProgress(0);
    const reportResult = await runIntegrityCheck((done, total, current) => {
      setProgress(Math.round((done / total) * 100));
    });
    setReport(reportResult);
    setRunning(false);
    onNotify(`Integrity check complete: ${reportResult.overall.toUpperCase()} — ${reportResult.passed} pass, ${reportResult.warnings} warn, ${reportResult.failed} fail.`);
  };

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🛡️</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">System Integrity</h2>
            <p className="text-xs text-slate-500">10 checks · storage · network · engines · sandbox</p>
          </div>
          <div className="flex-1" />
          <button onClick={start} disabled={running} className="jv-btn jv-btn-primary !text-xs">
            {running ? '⏳ Running…' : report ? '⟳ Re-run checks' : '▶ Run all checks'}
          </button>
        </div>

        {running && (
          <div className="jv-panel p-5 mb-4 scan-overlay">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Running integrity checks…</span>
              <span className="font-mono text-cyan-300">{progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(27,42,68,0.7)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #0aa3b8, #00e5ff)',
                  boxShadow: '0 0 10px rgba(0,229,255,0.6)',
                }}
              />
            </div>
          </div>
        )}

        {report && (
          <>
            <div className="jv-panel p-5 mb-4 flex items-center gap-4" style={{ borderColor: STATUS_COLOR[report.overall] + '66' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ background: STATUS_COLOR[report.overall] + '22', border: `2px solid ${STATUS_COLOR[report.overall]}` }}
              >
                {report.overall === 'pass' ? '✅' : report.overall === 'warn' ? '⚠️' : '❌'}
              </div>
              <div>
                <div className="text-lg font-black" style={{ color: STATUS_COLOR[report.overall] }}>
                  {report.overall.toUpperCase()}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {report.passed} pass · {report.warnings} warn · {report.failed} fail · {report.totalDuration}ms · {new Date(report.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {report.results.map((r: CheckResult) => (
                <div key={r.name} className="jv-panel p-3 flex items-center gap-3">
                  <span className="text-base" style={{ filter: `drop-shadow(0 0 4px ${STATUS_COLOR[r.status]}88)` }}>
                    {r.status === 'pass' ? '✓' : r.status === 'warn' ? '⚠' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-cyan-100">{r.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{r.message}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-600">{r.duration}ms</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: STATUS_COLOR[r.status] + '22', color: STATUS_COLOR[r.status], border: `1px solid ${STATUS_COLOR[r.status]}55` }}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {!report && !running && (
          <div className="jv-panel p-8 text-center text-sm text-slate-500">
            Checks run in sequence with a small delay between them:<br />
            <span className="text-xs text-slate-600">localStorage → profile → network (3s timeout) → memory → battery → knowledge base → code runner → jokes → self-mod → GitHub</span>
          </div>
        )}
      </div>
    </div>
  );
}
