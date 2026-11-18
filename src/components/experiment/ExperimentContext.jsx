import { createContext, useContext, useMemo, useState } from "react";
import experiment from "../../../playground/data_real.json";

const ExperimentContext = createContext(null);

export const maneuvers = { keep: "Keep lane", left: "Change left", right: "Change right" };
export const percent = (value) => `${(value * 100).toFixed(1)}%`;
export const modelColor = (model) => model === "fl" ? "var(--accent)" : "var(--signal)";

export function ExperimentProvider({ children }) {
  const [model, setModel] = useState("tappfl");
  const [horizon, setHorizon] = useState(5);
  const [sceneId, setSceneId] = useState(experiment.scenes[0].id);
  const [compare, setCompare] = useState(true);
  const scene = experiment.scenes.find((item) => item.id === sceneId) ?? experiment.scenes[0];
  const value = useMemo(() => ({
    data: experiment, model, setModel, horizon, setHorizon,
    scene, setSceneId, compare, setCompare,
  }), [model, horizon, scene, compare]);
  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
}

export function useExperiment() {
  return useContext(ExperimentContext);
}

export function ExperimentControls({ scenes = false }) {
  const { data, model, setModel, horizon, setHorizon, scene, setSceneId, compare, setCompare } = useExperiment();
  const available = data.scenes.filter((item) => item.maneuver === scene.maneuver);

  function showChallenge() {
    const examples = data.scenes.filter((item) => item.challenging);
    const current = examples.findIndex((item) => item.id === scene.id);
    setSceneId(examples[(current + 1) % examples.length].id);
  }

  return (
    <div className="experiment-controls">
      <div>
        <span className="experiment-label">Representation</span>
        <div className="experiment-segments" role="group" aria-label="Representation">
          {data.model_order.map((key) => (
            <button key={key} type="button" aria-pressed={model === key} onClick={() => setModel(key)}>
              {data.models[key].short}{key === "tappfl" ? " · λ = 0.5" : ""}
            </button>
          ))}
        </div>
      </div>
      <label className="experiment-select">
        Prediction horizon
        <select aria-label="Prediction horizon" value={horizon} onChange={(event) => setHorizon(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}
        </select>
      </label>
      {scenes && <>
        <label className="experiment-select">Maneuver
          <select aria-label="Maneuver" value={scene.maneuver} onChange={(event) => setSceneId(data.scenes.find((item) => item.maneuver === event.target.value).id)}>
            {Object.entries(maneuvers).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label className="experiment-select">Recorded vehicle
          <select aria-label="Recorded vehicle" value={scene.id} onChange={(event) => setSceneId(Number(event.target.value))}>
            {available.map((item, index) => <option key={item.id} value={item.id}>{index + 1} / {available.length} · {item.loc} · #{item.veh_id}{item.challenging ? " · challenging" : ""}</option>)}
          </select>
        </label>
        <label className="experiment-checkbox">
          <input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} />
          Compare both models
        </label>
        <button type="button" className="secondary-button compact-button" onClick={showChallenge}>Show challenging example</button>
      </>}
    </div>
  );
}

export function ExperimentHeading({ eyebrow, title, children }) {
  return <div className="experiment-heading">
    <div><span className="eyebrow">{eyebrow ?? "NGSIM · recorded experiment"}</span><h2>{title}</h2></div>
    {children ?? <span className="demo-chip">Recorded results</span>}
  </div>;
}
