import { Link } from "react-router-dom";
import { ExperimentControls, ExperimentHeading, modelColor, percent, useExperiment } from "./ExperimentContext";
import RoadView from "./RoadView";
import TrainingChart from "./TrainingChart";
import "./experiment.css";

export function ExperimentOverview() {
  const { data, model, horizon } = useExperiment();
  return <section className="panel experiment-panel" aria-label="Federated learning overview">
    <ExperimentHeading title="How the recommended approach works" />
    <p className="muted">Follow one traffic trajectory from recorded data to a useful prediction—and see what its representation reveals about the recording site.</p>
    <ExperimentControls />
    <div className="experiment-pipeline">
      <Link to="/preview" className="experiment-node experiment-node-data">
        <span className="experiment-node-number">01 / The data</span>
        <svg viewBox="0 0 140 60" aria-hidden="true"><path d="M0 18H140M0 42H140" stroke="currentColor" strokeDasharray="10 8" opacity=".3" /><rect x="18" y="24" width="23" height="12" rx="4" fill="currentColor" /><rect x="80" y="2" width="23" height="12" rx="4" fill="currentColor" opacity=".45" /><rect x="103" y="48" width="23" height="12" rx="4" fill="currentColor" opacity=".45" /></svg>
        <h3>NGSIM traffic trajectories</h3>
        <p>3 seconds of a car's history and nearby traffic on US-101 or I-80.</p>
        <span className="experiment-node-action">Inspect recorded scenes →</span>
      </Link>
      <div className="experiment-node experiment-node-model">
        <span className="experiment-node-number">02 / The representation</span>
        <div className="experiment-representation" aria-hidden="true">{[38, 72, 47, 91, 59, 28, 65, 44].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
        <h3>{data.models[model].short}{model === "tappfl" ? " · λ = 0.5" : ""}</h3>
        <p>Sites train together without pooling raw trajectories.{model === "tappfl" ? " An adversarial privacy objective discourages highway information in the learned representation." : " Standard FL learns a representation for trajectory prediction without this privacy objective."}</p>
        <span className="pill">{model === "tappfl" ? "Site-level privacy objective" : "Utility objective"}</span>
      </div>
      <div className="experiment-outcomes">
        <Link to="/preview" className="experiment-node">
          <span className="experiment-node-number">03a / Utility</span>
          <h3>Predict the next {horizon} seconds</h3>
          <strong className="experiment-node-value">{data.models[model].rmse[horizon - 1].toFixed(2)} <small>m RMSE</small></strong>
          <p>Trajectory error on the test set. Lower is better.</p>
          <span className="experiment-node-action">View traffic playback →</span>
        </Link>
        <Link to="/tradeoffs" className="experiment-node experiment-node-privacy">
          <span className="experiment-node-number">03b / Site-level privacy</span>
          <h3>Can an attacker infer the highway?</h3>
          <strong className="experiment-node-value">{percent(data.models[model].attack_acc)} <small>attack accuracy</small></strong>
          <p>Majority guessing: {percent(data.baselines.majority)}. Lower is better.</p>
          <span className="experiment-node-action">Inspect the tradeoff →</span>
        </Link>
      </div>
    </div>
    <TrainingChart />
    <p className="muted experiment-note">Recorded Standard FL / TAPPFL case study on NGSIM, evaluated in batches of 512 cars. These measurements do not determine the illustrative candidate rankings below.</p>
  </section>;
}

export function TrafficExperiment() {
  const { data, scene } = useExperiment();
  return <>
    <section className="panel experiment-panel" aria-label="Recorded traffic playback">
      <ExperimentHeading title="Watch a traffic scene, then compare the predictions" />
      <p className="muted">Explore all {data.scenes.length} recorded scenes across keep-lane, left-change, and right-change maneuvers. Your selected model, vehicle, and horizon carry through to Tradeoffs.</p>
      <ExperimentControls scenes />
      <RoadView />
    </section>
    <section className="panel experiment-panel" aria-label="Highway inference for the selected vehicle">
      <ExperimentHeading title="What does this vehicle's representation reveal?" />
      <p className="muted">The attacker sees the learned representation and guesses the highway. The actual highway, {scene.loc}, is known for evaluation and hidden from the attacker.</p>
      <div className="grid two-column">
        {data.model_order.map((key) => {
          const probabilities = scene.attack[key];
          const guess = probabilities[0] >= probabilities[1] ? 0 : 1;
          const correct = data.meta.locations[guess] === scene.loc;
          return <div key={key} className="experiment-attack-card">
            <h3><span className="experiment-model-dot" style={{ background: modelColor(key) }} />{data.models[key].short}</h3>
            {data.meta.locations.map((highway, index) => <div className="experiment-probability" key={highway}><span>{highway}</span><div className="experiment-probability-track"><i style={{ width: `${probabilities[index] * 100}%`, background: modelColor(key) }} /></div><strong>{percent(probabilities[index])}</strong></div>)}
            <p className="muted">Guesses <strong>{data.meta.locations[guess]}</strong> · {correct ? "correct inference" : "incorrect inference"}</p>
          </div>;
        })}
      </div>
      <div className="experiment-section-footer"><span className="muted">One vehicle's confidence is not aggregate attack accuracy.</span><Link className="experiment-text-link" to="/tradeoffs">Compare test-set privacy and utility →</Link></div>
    </section>
  </>;
}

function TradeoffChart() {
  const { data, model, setModel } = useExperiment();
  const xs = data.points.map((point) => point.rmse5);
  const xmin = Math.min(...xs) - 0.7;
  const xmax = Math.max(...xs) + 0.7;
  const ymin = Math.floor(Math.min(data.baselines.majority, ...data.points.map((point) => point.attack)) * 20) / 20;
  const ymax = Math.ceil(Math.max(...data.points.map((point) => point.attack)) * 20) / 20 + 0.05;
  const x = (value) => 66 + (value - xmin) / (xmax - xmin) * 456;
  const y = (value) => 22 + (ymax - value) / (ymax - ymin) * 230;
  return <>
    <svg viewBox="0 0 560 320" className="experiment-chart experiment-scatter" role="group" aria-label="Privacy utility tradeoff: test error versus highway attack accuracy">
      {Array.from({ length: Math.round((ymax - ymin) / 0.05) + 1 }, (_, index) => ymin + index * 0.05).map((tick) => <g key={tick}><line x1="66" x2="522" y1={y(tick)} y2={y(tick)} className="experiment-gridline" /><text x="55" y={y(tick) + 4} textAnchor="end" className="experiment-axis-label">{Math.round(tick * 100)}%</text></g>)}
      {[0, 1, 2, 3, 4].map((index) => { const value = xmin + (xmax - xmin) * index / 4; return <text key={index} x={x(value)} y="273" textAnchor="middle" className="experiment-axis-label">{value.toFixed(1)}</text>; })}
      <line x1="66" x2="522" y1={y(data.baselines.majority)} y2={y(data.baselines.majority)} className="experiment-baseline" />
      <text x="516" y={y(data.baselines.majority) - 8} textAnchor="end" className="experiment-axis-label">Majority guess {percent(data.baselines.majority)}</text>
      {data.points.map((point, index) => <g key={point.model} role="button" tabIndex="0" aria-label={`Select ${data.models[point.model].short}: ${point.rmse5.toFixed(2)} meters RMSE, ${percent(point.attack)} attack accuracy`} aria-pressed={model === point.model} className="experiment-scatter-point" onClick={() => setModel(point.model)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setModel(point.model); } }}>
        <title>{`${data.models[point.model].label}: ${point.rmse5.toFixed(2)} m RMSE; ${percent(point.attack)} attack accuracy`}</title>
        <circle cx={x(point.rmse5)} cy={y(point.attack)} r="21" fill="transparent" />
        {model === point.model && <circle cx={x(point.rmse5)} cy={y(point.attack)} r="13" className="experiment-selection-ring" />}
        <circle cx={x(point.rmse5)} cy={y(point.attack)} r="7" fill={modelColor(point.model)} />
        <text x={x(point.rmse5) + (index === 0 ? 15 : -15)} y={y(point.attack) - 14} textAnchor={index === 0 ? "start" : "end"} className="experiment-point-label">{data.models[point.model].short}</text>
      </g>)}
      <text x="292" y="302" textAnchor="middle" className="experiment-axis-label">5-second test RMSE (m) · lower is better</text>
      <text transform="translate(17 140) rotate(-90)" textAnchor="middle" className="experiment-axis-label">Attack accuracy · lower is better</text>
    </svg>
    <p className="muted experiment-note">Down and left is better. Click a measured model to select it. {data.scatter_note} Points are not interpolated.</p>
  </>;
}

function AccuracyCounts() {
  const { data } = useExperiment();
  const rows = [{ key: "baseline", label: "Majority guess", accuracy: data.baselines.majority }, ...data.model_order.map((key) => ({ key, label: data.models[key].short, accuracy: data.models[key].attack_acc }))];
  return <div className="experiment-counts">{rows.map((row) => <figure key={row.key}>
    <div className="experiment-count-grid" role="img" aria-label={`${row.label}: about ${Math.round(row.accuracy * 100)} correct highway guesses per 100 vehicles`}>
      {Array.from({ length: 100 }, (_, index) => <i key={index} style={index < Math.round(row.accuracy * 100) ? { background: row.key === "baseline" ? "var(--muted)" : modelColor(row.key), borderColor: "transparent" } : {}} />)}
    </div>
    <figcaption><strong>{Math.round(row.accuracy * 100)} / 100</strong><span>{row.label}</span></figcaption>
  </figure>)}</div>;
}

export function ExperimentTradeoffs() {
  const { data, model, horizon, scene } = useExperiment();
  const original = data.models.fl;
  const protectedModel = data.models.tappfl;
  const reduction = (original.attack_acc - protectedModel.attack_acc) * 100;
  const cost = protectedModel.rmse[horizon - 1] - original.rmse[horizon - 1];
  const selected = data.models[model];
  return <section className="panel experiment-panel" aria-label="Measured privacy utility tradeoffs">
    <ExperimentHeading title="What privacy improvement costs in prediction error" />
    <p className="muted">Evaluate the recorded FL case study alongside the portal's candidate tradeoffs. This section uses measured NGSIM results; candidate scores below are illustrative.</p>
    <ExperimentControls />
    <div className="experiment-facts experiment-headline-metrics">
      <div><span>Attack accuracy reduction</span><strong>{reduction.toFixed(1)} <small>percentage points</small></strong><span>Standard FL → TAPPFL</span></div>
      <div><span>Additional RMSE at {horizon} s</span><strong>+{cost.toFixed(2)} <small>meters</small></strong><span>Standard FL → TAPPFL</span></div>
      <div><span>{selected.short} above majority guess</span><strong>{((selected.attack_acc - data.baselines.majority) * 100).toFixed(1)} <small>percentage points</small></strong><span>Remaining site information</span></div>
    </div>
    <div className="grid two-column experiment-chart-grid">
      <div className="experiment-inset"><h3>Measured privacy–utility tradeoff</h3><TradeoffChart /></div>
      <div className="experiment-inset"><h3>How often does the attacker get it right?</h3><AccuracyCounts /><p className="muted experiment-note">Rounded from aggregate test accuracy, not a sample of 100 selected vehicles. Lower counts mean less successful highway inference.</p></div>
    </div>
    <div className="table-wrap">
      <table className="data-table experiment-results-table"><caption>Test-set measurements · {data.meta.badge}. Lower is better for every measured quantity shown.</caption>
        <thead><tr><th scope="col">Model</th><th scope="col">Attack accuracy</th><th scope="col">Above majority guess</th><th scope="col">RMSE @ {horizon} s</th><th scope="col">ADE @ 5 s</th><th scope="col">FDE @ 5 s</th></tr></thead>
        <tbody>{data.model_order.map((key) => { const item = data.models[key]; return <tr key={key} className={model === key ? "experiment-selected-row" : ""}><th scope="row"><span className="experiment-model-dot" style={{ background: modelColor(key) }} />{item.short}{model === key ? " · selected" : ""}</th><td>{percent(item.attack_acc)}</td><td>+{((item.attack_acc - data.baselines.majority) * 100).toFixed(1)} pp</td><td>{item.rmse[horizon - 1].toFixed(2)} m</td><td>{item.ade.toFixed(2)} m</td><td>{item.fde.toFixed(2)} m</td></tr>; })}</tbody>
      </table>
    </div>
    <div className="experiment-interpretation"><strong>A measured improvement, with remaining leakage.</strong><p>TAPPFL reduces highway inference by {reduction.toFixed(1)} percentage points while increasing {horizon}-second test RMSE by {cost.toFixed(2)} m. Its attacker still exceeds majority guessing by {((protectedModel.attack_acc - data.baselines.majority) * 100).toFixed(1)} points. This audit measures site-level highway inference, not a general privacy guarantee.</p></div>
    <details className="experiment-metric-details"><summary>All prediction horizons and per-highway accuracy</summary>
      <div className="table-wrap"><table className="data-table"><caption>Cartesian trajectory errors in meters; highway accuracy is conditional on the true highway.</caption><thead><tr><th>Model</th>{[1, 2, 3, 4, 5].map((second) => <th key={second}>RMSE {second} s</th>)}<th>US-101 attack</th><th>I-80 attack</th></tr></thead><tbody>{data.model_order.map((key) => <tr key={key}><th scope="row">{data.models[key].short}</th>{data.models[key].rmse.map((value, index) => <td key={index}>{value.toFixed(3)}</td>)}{data.models[key].per_class.map((value, index) => <td key={index}>{percent(value)}</td>)}</tr>)}</tbody></table></div>
      <p className="muted experiment-note">{data.meta.utility_note} Highway attack evaluation: {data.meta.attack_test_n.toLocaleString()} samples. Only Standard FL and TAPPFL λ = 0.5 have paired measurements.</p>
    </details>
    <div className="experiment-section-footer"><span className="muted">Current scene: {scene.loc} · vehicle #{scene.veh_id} · {horizon} s horizon</span><Link className="experiment-text-link" to="/preview">Return to this traffic scene →</Link></div>
  </section>;
}
