import { useEffect, useId, useMemo, useState } from "react";
import { maneuvers, modelColor, useExperiment } from "./ExperimentContext";
import { interpolate, trajectoryError } from "./metrics";

function Playback({ scene, horizon, models }) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const clipId = useId();
  const { data } = useExperiment();
  const lane = data.meta.lane_width_m;
  const view = useMemo(() => {
    const points = [...scene.hist, ...scene.fut, ...data.model_order.flatMap((key) => scene.pred[key])];
    const xmin = Math.min(...points.map((point) => point[0])) - 10;
    const xmax = Math.max(...points.map((point) => point[0])) + 12;
    const ymin = Math.min(-1.5 * lane, ...points.map((point) => point[1])) - 1.6;
    const ymax = Math.max(1.5 * lane, ...points.map((point) => point[1])) + 1.6;
    return { x: (value) => 35 + (value - xmin) / (xmax - xmin) * 930,
      y: (value) => 40 + (ymax - value) / (ymax - ymin) * 270,
      sx: 930 / (xmax - xmin), sy: 270 / (ymax - ymin), xmin, xmax };
  }, [scene, data, lane]);

  useEffect(() => {
    if (!playing) return undefined;
    let frame;
    let previous;
    const animate = (now) => {
      if (previous != null) {
        const delta = Math.min((now - previous) / 1000, 0.05);
        setTime((current) => current >= horizon + 1.5 ? -3 : current + delta);
      }
      previous = now;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [playing, horizon]);

  const t = Math.min(time, horizon);
  const historyTimes = scene.hist.map((_, index) => (index - scene.hist.length + 1) * data.meta.dt_hist);
  const futureTimes = [0, ...scene.fut.map((_, index) => (index + 1) * data.meta.dt_fut)];
  const actual = [[0, 0], ...scene.fut];
  const ego = t < 0 ? interpolate(historyTimes, scene.hist, t) : interpolate(futureTimes, actual, t);
  const history = t < 0 ? [...scene.hist.filter((_, index) => historyTimes[index] <= t), ego] : scene.hist;
  const revealed = [...actual.filter((_, index) => futureTimes[index] <= t), ego];
  const points = (path) => path.map(([x, y]) => `${view.x(x)},${view.y(y)}`).join(" ");
  const phase = t < 0 ? "Observed history" : t === 0 ? "Prediction time" : "Recorded future";

  function car(position, key, isEgo = false) {
    return <g key={key} transform={`translate(${view.x(position[0])} ${view.y(position[1])})`}>
      <rect x={-2.3 * view.sx} y={-0.95 * view.sy} width={4.6 * view.sx} height={1.9 * view.sy} rx="4" className={isEgo ? "road-car-ego" : "road-car-neighbor"} />
      <rect x={0.4 * view.sx} y={-0.65 * view.sy} width={0.7 * view.sx} height={1.3 * view.sy} rx="1" className="road-car-window" />
    </g>;
  }

  return <>
    <div className="experiment-road-wrap">
      <div className="experiment-road-phase"><span>{phase}</span><strong>{t > 0 ? "+" : ""}{t.toFixed(1)} s</strong></div>
      <svg className="experiment-road" viewBox="0 0 1000 355" role="img" aria-label={`${maneuvers[scene.maneuver]} on ${scene.loc}, vehicle ${scene.veh_id}. Recorded paths and model predictions.`}>
        <defs><clipPath id={clipId}><rect x="0" y="30" width="1000" height="290" rx="14" /></clipPath></defs>
        <g clipPath={`url(#${clipId})`}>
          <rect width="1000" height="330" className="road-shoulder" />
          <rect x="0" y={view.y(1.5 * lane)} width="1000" height={3 * lane * view.sy} className="road-surface" />
          {[-1.5, 1.5].map((value) => <line key={value} x1="0" x2="1000" y1={view.y(value * lane)} y2={view.y(value * lane)} className="road-edge" />)}
          {[-0.5, 0.5].map((value) => <line key={value} x1="0" x2="1000" y1={view.y(value * lane)} y2={view.y(value * lane)} className="road-marking" strokeDasharray={`${3 * view.sx} ${9 * view.sx}`} />)}
          {(scene.nbrs ?? []).map((neighbor, index) => car(neighbor.path ? interpolate(neighbor.times, neighbor.path, t) : neighbor.pos, index))}
          <polyline points={points(history)} className="road-history" />
          {t >= 0 && models.map((key) => <g key={key}>
            <polyline points={points([[0, 0], ...scene.pred[key].slice(0, horizon * 5)])} fill="none" stroke={modelColor(key)} strokeWidth="3" strokeDasharray="8 6" />
            <circle cx={view.x(scene.pred[key][horizon * 5 - 1][0])} cy={view.y(scene.pred[key][horizon * 5 - 1][1])} r="5" fill={modelColor(key)} />
            <circle cx={view.x(interpolate(futureTimes, [[0, 0], ...scene.pred[key]], t)[0])} cy={view.y(interpolate(futureTimes, [[0, 0], ...scene.pred[key]], t)[1])} r="4" fill="var(--bg)" stroke={modelColor(key)} strokeWidth="2" />
          </g>)}
          {t > 0 && <polyline points={points(revealed)} className="road-actual" />}
          {car(ego, "ego", true)}
        </g>
        <text x="970" y="20" textAnchor="end" className="experiment-axis-label">Direction of travel →</text>
        {Array.from({ length: Math.floor((view.xmax - view.xmin) / 20) + 1 }, (_, index) => Math.ceil(view.xmin / 20) * 20 + index * 20)
          .filter((value) => value <= view.xmax).map((value) => <text key={value} x={view.x(value)} y="343" textAnchor="middle" className="experiment-axis-label">{value > 0 ? "+" : ""}{value} m</text>)}
      </svg>
    </div>
    <div className="experiment-playback">
      <button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Pause traffic playback" : "Play traffic playback"}>{playing ? "Pause" : "Play scene"}</button>
      <button type="button" className="secondary-button compact-button" onClick={() => { setPlaying(false); setTime(-3); }}>Restart</button>
      <label className="experiment-scrub">Playback time
        <input aria-label="Playback time" type="range" min="-3" max={horizon} step="0.02" value={t} onChange={(event) => { setPlaying(false); setTime(Number(event.target.value)); }} />
      </label>
      <output aria-live="off">{t.toFixed(1)} s</output>
    </div>
    <div className="experiment-legend">
      <span><i className="history-swatch" />Past 3 seconds</span>
      <span><i className="actual-swatch" />Recorded future</span>
      {models.map((key) => <span key={key}><i style={{ borderColor: modelColor(key), borderTopStyle: "dashed" }} />{data.models[key].short} prediction</span>)}
      <span><i className="neighbor-swatch" />Nearby vehicles</span>
    </div>
    <p className="muted experiment-note">Ego-centric view; lateral distances are stretched ×{(view.sy / view.sx).toFixed(1)} to make lane changes visible. Predictions appear at t = 0; the solid path reveals what actually happened.</p>
  </>;
}

export default function RoadView() {
  const { data, scene, horizon, model, compare } = useExperiment();
  const models = compare ? data.model_order : [model];
  return <>
    <Playback key={`${scene.id}-${horizon}`} scene={scene} horizon={horizon} models={models} />
    <div className="experiment-facts">
      <div><span>Recorded highway</span><strong>{scene.loc}</strong></div>
      <div><span>Vehicle / frame</span><strong>#{scene.veh_id} / {scene.frame}</strong></div>
      <div><span>Speed at prediction</span><strong>{scene.speed.toFixed(1)} m/s</strong></div>
      <div><span>Maneuver</span><strong>{maneuvers[scene.maneuver]}{scene.challenging ? " · challenging" : ""}</strong></div>
    </div>
    <div className="table-wrap">
      <table className="data-table"><caption>Path accuracy for this vehicle at {horizon} seconds. Lower is better.</caption>
        <thead><tr><th>Model</th><th>Average path error (ADE)</th><th>Endpoint error (FDE)</th></tr></thead>
        <tbody>{data.model_order.map((key) => {
          const error = trajectoryError(scene, key, horizon);
          return <tr key={key}><th scope="row"><span className="experiment-model-dot" style={{ background: modelColor(key) }} />{data.models[key].short}</th><td>{error.ade.toFixed(2)} m</td><td>{error.fde.toFixed(2)} m</td></tr>;
        })}</tbody>
      </table>
    </div>
  </>;
}
