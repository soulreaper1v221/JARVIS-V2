// ─── Tools panel: jokes, dice, weather, time, calculator ─────────────────

import { useState } from 'react';
import { getJoke, getWeatherSimulated, getTimeNow, calculate, generateRandomNumber, WEATHER_CITIES, AVAILABLE_TOOLS } from '../../engine/tools';
import type { Joke } from '../../engine/tools';
import { trackJoke } from '../../engine/auth';

export default function ToolsPanel({ onNotify }: { onNotify: (msg: string) => void }) {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [dice, setDice] = useState<number[] | null>(null);
  const [coin, setCoin] = useState<string | null>(null);
  const [num, setNum] = useState<{ value: number; min: number; max: number } | null>(null);
  const [city, setCity] = useState(WEATHER_CITIES[0].city);
  const [expr, setExpr] = useState('(12 + 8) * 3.5');
  const [calcResult, setCalcResult] = useState<string>('');
  const [time, setTime] = useState(() => getTimeNow());

  const tellJoke = () => {
    setJoke(getJoke());
    trackJoke();
  };

  const refreshTime = () => setTime(getTimeNow());

  const doCalc = () => {
    try {
      setCalcResult(String(calculate(expr)));
    } catch {
      setCalcResult('⚠ invalid expression');
    }
  };

  const tool = (t: string) => {
    const name = t.split('_')[0];
    onNotify(`${name} executed from the Tools panel — the result appears here.`);
  };

  return (
    <div className="p-4 overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧰</span>
          <div>
            <h2 className="text-lg font-bold text-cyan-100 leading-tight">Utility Tools</h2>
            <p className="text-xs text-slate-500">{AVAILABLE_TOOLS.length} tools · all local, all instant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {/* jokes */}
          <div className="jv-panel p-4 scan-overlay">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">😂</span>
              <span className="text-[11px] font-bold tracking-widest text-cyan-400/80">JOKE ENGINE — 70+ NEVER REPEATED</span>
            </div>
            <button onClick={tellJoke} className="jv-btn jv-btn-primary !text-xs mb-3">🎭 Tell me a joke</button>
            {joke && (
              <div className="text-sm leading-relaxed anim-fade-up">
                <div className="text-cyan-100 font-medium">{joke.setup}</div>
                {joke.punchline && <div className="text-slate-400 italic mt-1">{joke.punchline}</div>}
                <div className="text-[10px] text-slate-600 mt-2 font-mono">category: {joke.category}</div>
              </div>
            )}
          </div>

          {/* chance */}
          <div className="jv-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎲</span>
              <span className="text-[11px] font-bold tracking-widest text-cyan-400/80">CHANCE</span>
            </div>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1])} className="jv-btn !text-xs flex-1">Roll dice 🎲</button>
              <button onClick={() => setCoin(Math.random() > 0.5 ? 'Heads' : 'Tails')} className="jv-btn !text-xs flex-1">Flip coin 🪙</button>
              <button onClick={() => setNum({ value: generateRandomNumber(1, 100), min: 1, max: 100 })} className="jv-btn !text-xs flex-1">Random 1–100 🎰</button>
            </div>
            <div className="min-h-[40px] flex items-center">
              {dice && <div className="text-2xl font-bold text-cyan-200 font-mono anim-fade-up">🎲 {dice.join(' + ')} = <span className="text-cyan-300">{dice[0] + dice[1]}</span></div>}
              {coin && <div className="text-2xl font-bold text-cyan-200 font-mono anim-fade-up">🪙 {coin}</div>}
              {num && <div className="text-2xl font-bold text-cyan-200 font-mono anim-fade-up">🎰 {num.value}</div>}
              {!dice && !coin && !num && <div className="text-xs text-slate-600">Roll, flip, or draw…</div>}
            </div>
          </div>

          {/* weather */}
          <div className="jv-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌤️</span>
              <span className="text-[11px] font-bold tracking-widest text-cyan-400/80">WEATHER (SIMULATED)</span>
            </div>
            <div className="flex gap-2 mb-2">
              <select value={city} onChange={(e) => setCity(e.target.value)} className="jv-input !text-xs flex-1">
                {WEATHER_CITIES.map((c) => <option key={c.city} value={c.city}>{c.city}</option>)}
              </select>
              <button onClick={() => setCity(getWeatherSimulated().city)} className="jv-btn !text-xs">🎲</button>
            </div>
            <WeatherCard city={city} />
          </div>

          {/* time + calc */}
          <div className="jv-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⏰</span>
              <span className="text-[11px] font-bold tracking-widest text-cyan-400/80">TIME &amp; CALCULATOR</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-mono text-lg font-bold text-cyan-200 tabular-nums">{time.time}</div>
                <div className="text-[10px] text-slate-500">{time.date} · {time.timezone}</div>
              </div>
              <button onClick={refreshTime} className="jv-btn !px-2.5 !py-1 !text-[11px]">⟳</button>
            </div>
            <div className="flex gap-2">
              <input value={expr} onChange={(e) => setExpr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doCalc()} className="jv-input !text-xs flex-1 font-mono" placeholder="expression" />
              <button onClick={doCalc} className="jv-btn jv-btn-primary !text-xs">=</button>
            </div>
            {calcResult && <div className="mt-2 font-mono text-sm text-green-400">→ {calcResult}</div>}
          </div>
        </div>

        {/* tool registry */}
        <div className="jv-panel p-4">
          <div className="text-[11px] font-bold tracking-widest text-cyan-400/80 mb-3">🛠️ TOOL REGISTRY ({AVAILABLE_TOOLS.length})</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AVAILABLE_TOOLS.map((t) => (
              <button
                key={t.name}
                onClick={() => tool(t.name)}
                className="text-left p-2.5 rounded-lg border border-cyan-400/12 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all"
              >
                <div className="text-xs font-mono font-bold text-cyan-300">{t.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{t.description}</div>
                <div className="text-[10px] text-slate-600 font-mono mt-1">usage: {t.usage}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherCard({ city }: { city: string }) {
  const w = getWeatherSimulated(city);
  const tempF = Math.round((w.temp * 9) / 5 + 32);
  return (
    <div className="flex items-center gap-3 anim-fade-up">
      <span className="text-4xl">{w.emoji}</span>
      <div>
        <div className="font-bold text-cyan-100">{w.city}</div>
        <div className="font-mono text-xl text-cyan-300">{w.temp}°C <span className="text-xs text-slate-500">({tempF}°F)</span></div>
        <div className="text-xs text-slate-400">{w.condition}</div>
        <div className="text-[10px] text-slate-600">💧 {w.humidity}% · 💨 {w.wind} km/h</div>
      </div>
    </div>
  );
}
