import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./trajectory.css";

const ROOT = `${import.meta.env.BASE_URL}trajectory-playground/`;
const LEVELS = [
  { id: "nonprivate", label: "Non-private" },
  { id: "private", label: "Private (DP σ = 0.1)" },
];
const DATASETS = [
  { id: "ngsim-i80", label: "NGSIM I-80" },
  { id: "ngsim-us101", label: "NGSIM US-101" },
  { id: "iot", label: "IoT" },
];
const METRICS = [
  { key: "mia", label: "MIA score", category: "Privacy" },
  { key: "density_error", label: "Density error", category: "Utility" },
  { key: "pattern_error", label: "Pattern error", category: "Utility" },
  { key: "trip_error", label: "Trip error", category: "Utility" },
  { key: "length_error", label: "Length error", category: "Utility" },
];
const valueOf = (v) => typeof v === "number" && Number.isFinite(v) ? v : null;
const fmt = (v) => valueOf(v) === null ? "Not available" : Number(v).toFixed(4);
const mediaUrl = (relative) => {
  // Manifest paths must be relative to public/trajectory-playground/.
  if (typeof relative !== "string" || !relative || relative.startsWith("/") ||
      relative.includes("..") || /^(?:https?:|data:|javascript:)/i.test(relative)) return null;
  return ROOT + relative.split("/").map(encodeURIComponent).join("/");
};

function MediaCard({ title, src, type, alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <article className="panel tp-media-card">
      <div className="tp-card-heading"><h3>{title}</h3><span className="tp-chip">{type === "video" ? "Playback" : "Density"}</span></div>
      {src && !failed ? (
        type === "video" ? (
          <video key={src} controls playsInline preload="metadata" src={src}
            onError={() => setFailed(true)} aria-label={alt} />
        ) : (
          <img key={src} src={src} alt={alt} onError={() => setFailed(true)} />
        )
      ) : (
        <div className="tp-empty"><span aria-hidden="true">{type === "video" ? "▷" : "▦"}</span>
          <strong>{src && failed ? "File not found" : "Results not added yet"}</strong>
          <small>{src && failed ? "Check the path in results.json" : "Add the file and update results.json"}</small>
        </div>
      )}
    </article>
  );
}

function MetricBars({ records, metric }) {
  const items = LEVELS.map((level) => ({ ...level, value: valueOf(records?.[level.id]?.metrics?.[metric.key]) }));
  const highest = Math.max(0, ...items.map((item) => item.value ?? 0));
  return (
    <div className="tp-bar-card">
      <strong>{metric.label}</strong>
      {items.map((item) => (
        <div className="tp-bar-row" key={item.id}>
          <span>{item.label}</span>
          <div className="tp-bar-track">
            {item.value !== null && highest > 0 && (
              <div className="tp-bar" style={{ width: `${Math.max(1, 100 * item.value / highest)}%` }} />
            )}
          </div>
          <span className="tp-bar-value">{item.value === null ? "—" : fmt(item.value)}</span>
        </div>
      ))}
      <small>{metric.key === "mia" ? "Scores closer to 0.5 indicate stronger privacy (random guessing)." : "Lower error indicates better fidelity."}</small>
    </div>
  );
}

export default function TrajectoryPlayground({ profile, setProfile, mode = "standalone" }) {
  const datasetId = DATASETS.some((d) => d.id === profile.datasetId) ? profile.datasetId : "ngsim-i80";
  const [privacyId, setPrivacyId] = useState("nonprivate");
  const [manifest, setManifest] = useState(null);
  const [loadError, setLoadError] = useState("");
  const realRef = useRef(null);
  const synthRef = useRef(null);
  const [mediaErrors, setMediaErrors] = useState({});

  useEffect(() => {
    let live = true;
    fetch(`${ROOT}results.json`, { cache: "no-store" })
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((data) => { if (live) { setManifest(data); setLoadError(""); } })
      .catch((err) => { if (live) setLoadError(`Could not load results.json: ${err.message}`); });
    return () => { live = false; };
  }, []);

  const dataset = manifest?.datasets?.[datasetId];
  const selection = dataset?.configurations?.[privacyId];
  const records = dataset?.configurations;
  const realVideo = mediaUrl(dataset?.real?.video);
  const syntheticVideo = mediaUrl(selection?.video);
  const realDensity = mediaUrl(dataset?.real?.density);
  const syntheticDensity = mediaUrl(selection?.density);
  const csvUrl = mediaUrl(selection?.csv);
  const miaMeta = manifest?.mia_metric ?? {};
  const comparablePrivacy = miaMeta.lower_is_better === true && !!miaMeta.name && miaMeta.name !== "UNSPECIFIED";
  const selectedMetrics = selection?.metrics ?? {};
  const validMetrics = METRICS.filter((metric) => valueOf(selectedMetrics[metric.key]) !== null).length;
  const utilityMetrics = METRICS.slice(1);
  const tradeoffReady = comparablePrivacy && LEVELS.every((level) => {
    const record = records?.[level.id]?.metrics;
    return valueOf(record?.mia) !== null && utilityMetrics.every((m) => valueOf(record?.[m.key]) !== null);
  });
  const tradeoffPoints = useMemo(() => {
    if (!tradeoffReady) return [];
    // Equal weighting of normalized utility errors, scaled by maximum within this dataset.
    // This is a descriptive visualization index, not a validated scientific score.
    const scale = Object.fromEntries(utilityMetrics.map((m) =>
      [m.key, Math.max(1e-12, ...LEVELS.map((l) => records[l.id].metrics[m.key]))]));
    return LEVELS.map((l) => ({
      label: l.label,
      id: l.id,
      x: utilityMetrics.reduce((sum, m) => sum + records[l.id].metrics[m.key] / scale[m.key], 0) / utilityMetrics.length,
      y: records[l.id].metrics.mia,
    }));
  }, [tradeoffReady, records]);

  function playBoth() {
    for (const video of [realRef.current, synthRef.current]) {
      if (video) { video.currentTime = 0; video.play().catch(() => {}); }
    }
  }
  function pauseBoth() { realRef.current?.pause(); synthRef.current?.pause(); }
  // Wrapped video rendering lets the joint playback controls reference actual video elements.
  const videoPanel = (title, url, ref, isSynthetic) => (
    <article className="panel tp-media-card">
      <div className="tp-card-heading"><h3>{title}</h3><span className="tp-chip">Playback</span></div>
      {url && !mediaErrors[url] ? (
        <video key={url} ref={ref} controls playsInline preload="metadata" src={url}
          onError={() => setMediaErrors((old) => ({ ...old, [url]: true }))} />
      ) : (
        <div className="tp-empty"><span aria-hidden="true">▷</span>
          <strong>{url ? "Video file not found" : "Video not added yet"}</strong>
          <small>{isSynthetic ? `${datasetId}/${privacyId}/synthetic_video.mp4` : `${datasetId}/real_video.mp4`}</small>
        </div>
      )}
    </article>
  );

  return (
    <section className="page tp-page">
      {mode === "standalone" && (<>
      <div className="page-header">
        <div><span className="eyebrow">PAIR / privacy-preserving synthetic trajectories</span>
          <h1>Synthetic Trajectory</h1>
          <p className="muted">Compare real and synthetic vehicle trajectories, explore mobility patterns, and evaluate data quality.</p>
        </div>
      </div>
      </>)}
      <div className="panel tp-settings">
        {mode === "standalone" && (<>
        <div><label htmlFor="tp-dataset">Dataset</label><select id="tp-dataset" value={datasetId}
          onChange={(event) => setProfile((p) => ({ ...p, datasetId: event.target.value }))}>
          {DATASETS.map((d) => <option value={d.id} key={d.id}>{d.label}</option>)}
        </select></div>
        </>)}
        <div><label htmlFor="tp-privacy">Privacy setting</label><select id="tp-privacy" value={privacyId}
          onChange={(event) => setPrivacyId(event.target.value)}>
          {LEVELS.map((p) => <option value={p.id} key={p.id}>{p.label}</option>)}
        </select></div>
        <div className="tp-config-note">
          <span>Experiment</span>
          <strong>
            {selection?.dp_enabled === true
              ? `DP enabled${typeof selection.sigma === "number"
                  ? ` · σ = ${selection.sigma}`
                  : " · σ not specified"}`
              : selection?.dp_enabled === false
                ? "Non-private baseline"
                : "Not configured"}
          </strong>
        </div>

      </div>
      {loadError && <div className="panel tp-error" role="alert">{loadError}</div>}
      {mode !== "tradeoffs" && (<>
      <div className="tp-section-head"><h2>Trajectory playback</h2><span className="muted">Real and synthetic views</span></div>
      <div className="tp-two-col">
        {videoPanel("Real trajectories", realVideo, realRef, false)}
        {videoPanel("Synthetic trajectories", syntheticVideo, synthRef, true)}
      </div>
      <div className="tp-action-row">
        <button type="button" onClick={playBoth} disabled={!realVideo || !syntheticVideo}>Restart and play both</button>
        <button type="button" className="secondary-button compact-button" onClick={pauseBoth}>Pause both</button>
      </div>
      <div className="tp-section-head"><h2>Density map comparison</h2><span className="muted">Geographic extent should match across panels</span></div>
      <div className="tp-two-col">
        <MediaCard key={`real-${datasetId}`} title="Real density" src={realDensity} type="image" alt="Real trajectory density map" />
        <MediaCard key={`synthetic-${datasetId}-${privacyId}`} title="Synthetic density" src={syntheticDensity} type="image" alt="Synthetic trajectory density map" />
      </div>
      <div className="panel tp-download">
        <div><h3>Synthetic trajectory dataset</h3><p className="muted">Download the CSV for the selected dataset and privacy setting.</p></div>
        {csvUrl ? (
          <a href={csvUrl} download className="tp-download-link" target="_blank" rel="noreferrer">Download synthetic CSV ↓</a>
        ) : <span className="tp-chip">CSV not added yet</span>}
      </div>
      <div className="tp-section-head"><h2>Measured evaluation</h2><span className="muted">{validMetrics} of 5 scores supplied for this configuration</span></div>
      <div className="tp-metric-grid">
        {METRICS.map((metric) => <div className="tp-metric" key={metric.key}>
          <span>{metric.category}</span><strong>{metric.label}</strong><b>{fmt(selectedMetrics[metric.key])}</b>
        </div>)}
      </div>
      </>)}
      {mode !== "preview" && (<>
      <div className="tp-section-head"><h2>Privacy–utility tradeoffs</h2><span className="muted">Compare both settings within {DATASETS.find((d) => d.id === datasetId)?.label}</span></div>

      <div className="panel tp-table-wrap"><h3>All privacy configurations</h3>
        <table className="tp-table"><thead><tr><th>Privacy setting</th>{METRICS.map((m) => <th key={m.key}>{m.label}</th>)}</tr></thead>
          <tbody>{LEVELS.map((level) => <tr key={level.id} className={privacyId === level.id ? "tp-selected" : ""}>
            <th>{level.label}</th>{METRICS.map((m) => <td key={m.key}>{valueOf(records?.[level.id]?.metrics?.[m.key]) === null ? "—" : fmt(records[level.id].metrics[m.key])}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="tp-bar-grid">{METRICS.map((m) => <MetricBars key={m.key} metric={m} records={records} />)}</div>

      </>)}
      {mode === "standalone" && <div className="tp-action-row"><Link to="/tradeoffs?technique=dp-synthetic" className="tp-download-link">Synthetic data tradeoffs →</Link>
        <Link to="/onboarding" className="tp-plain-link">Back to dataset selection</Link></div>}
    </section>
  );
}
