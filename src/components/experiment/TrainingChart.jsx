import { useEffect, useState } from "react";
import { modelColor, useExperiment } from "./ExperimentContext";
import { linePath } from "./metrics";

function RunChart({ model, run }) {
  const [progress, setProgress] = useState(1);
  const [replaying, setReplaying] = useState(false);
  const [highlighted, setHighlighted] = useState(null);
  const allPoints = [...run.clients.flat().filter(Boolean), ...run.global];
  const maxStep = Math.max(...allPoints.map((point) => point[0]));
  const transform = (value) => run.log ? Math.log10(Math.max(value, 0.0001)) : value;
  const values = allPoints.map((point) => transform(point[1]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.08 || 0.05;
  const x = (step) => 62 + step / maxStep * 740;
  const y = (value) => 22 + (max + pad - transform(value)) / (max - min + pad * 2) * 210;
  const limit = progress * maxStep;

  useEffect(() => {
    if (!replaying) return undefined;
    let frame;
    let start;
    const animate = (now) => {
      if (start == null) start = now;
      const next = Math.min(1, (now - start) / 7000);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(animate);
      else setReplaying(false);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [replaying]);

  const palette = ["#21918c", "#b278db", "#529fdd", "#db844f", "#9a9c39", "#d36d97", "#55a870", "#8d8bd3", "#c1844a", "#509fa7"];
  return <div className="experiment-training">
    <div className="experiment-heading">
      <div><h3>{model === "fl" ? "Standard FL" : "TAPPFL"} training history</h3><p className="muted">12 rounds · 10 clients · {run.log ? "logarithmic loss axis" : "linear loss axis"}</p></div>
      <button type="button" className="secondary-button compact-button" onClick={() => { setProgress(replaying ? 1 : 0); setReplaying((current) => !current); }}>{replaying ? "Show full history" : "Replay training"}</button>
    </div>
    <svg viewBox="0 0 840 275" className="experiment-chart" role="img" aria-label={`${model === "fl" ? "Standard FL" : "TAPPFL"} training loss for ten clients and the global model`}>
      {[0, 1, 2, 3, 4].map((tick) => {
        const value = min + (max - min) * tick / 4;
        const original = run.log ? 10 ** value : value;
        return <g key={tick} className="experiment-axis-label"><line x1="62" x2="802" y1={y(original)} y2={y(original)} className="experiment-gridline" /><text x="52" y={y(original) + 4} textAnchor="end">{Math.abs(original) >= 1000 ? `${(original / 1000).toFixed(1)}k` : original.toFixed(Math.abs(original) < 1 ? 2 : 1)}</text></g>;
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => <text key={tick} x={x(maxStep * tick)} y="253" textAnchor="middle" className="experiment-axis-label">{Math.round(maxStep * tick).toLocaleString()}</text>)}
      {run.clients.map((points, index) => <path key={index} d={linePath(points, x, y, limit)} fill="none" stroke={palette[index]} strokeWidth={highlighted === index ? 3 : 1.4} opacity={highlighted != null && highlighted !== index ? 0.16 : 0.65} />)}
      <path d={linePath(run.global, x, y, limit)} fill="none" stroke={modelColor(model)} strokeWidth="3.5" />
      <text x="802" y="272" textAnchor="end" className="experiment-axis-label">Training step</text>
    </svg>
    <div className="experiment-client-legend" role="group" aria-label="Highlight a training client">
      {run.clients.map((_, index) => <button key={index} type="button" aria-pressed={highlighted === index} onClick={() => setHighlighted(highlighted === index ? null : index)}><i style={{ background: palette[index] }} />Client {index + 1}</button>)}
      <span><i style={{ background: modelColor(model) }} />Global loss</span>
    </div>
    <p className="muted experiment-note">{run.note}</p>
    <p className="muted experiment-note">Gaps indicate another client's training turn. The two models use different objectives and loss scales; curve heights are not a utility comparison.</p>
  </div>;
}

export default function TrainingChart() {
  const { data, model } = useExperiment();
  const run = data.train_clients.runs[model];
  return <details className="experiment-training-details">
    <summary>How this model learned <span>Explore per-client training curves</span></summary>
    <RunChart key={model} model={model} run={run} />
  </details>;
}
