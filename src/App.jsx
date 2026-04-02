import { useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  applications,
  datasets,
  defaultProfile,
  defaultWeights,
  demoUser,
  metrics,
  pptCatalog,
  trafficSeries,
  trajectoryPreview,
} from "./data/mockData";
import { calculateParetoFront, normalizeWeights, scoreTechniques } from "./lib/recommendation";

const steps = [
  { path: "/onboarding", label: "Dataset" },
  { path: "/preferences", label: "Preferences" },
  { path: "/recommendations", label: "Recommendations" },
  { path: "/tradeoffs", label: "Tradeoffs" },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [weights, setWeights] = useState(defaultWeights);

  const activeDataset = datasets.find((dataset) => dataset.id === profile.datasetId) ?? datasets[0];
  const weightedResults = useMemo(
    () => scoreTechniques(pptCatalog, weights, profile.application, activeDataset.type),
    [activeDataset.type, profile.application, weights],
  );
  const paretoResults = useMemo(
    () => calculateParetoFront(weightedResults.length ? weightedResults : pptCatalog),
    [weightedResults],
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            isAuthenticated={isAuthenticated}
            onLogin={() => setIsAuthenticated(true)}
          />
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedApp
            isAuthenticated={isAuthenticated}
            profile={profile}
            setProfile={setProfile}
            weights={weights}
            setWeights={setWeights}
            activeDataset={activeDataset}
            weightedResults={weightedResults}
            paretoResults={paretoResults}
            onLogout={() => setIsAuthenticated(false)}
          />
        }
      />
    </Routes>
  );
}

function ProtectedApp(props) {
  if (!props.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Shell
      profile={props.profile}
      activeDataset={props.activeDataset}
      onLogout={props.onLogout}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingPage
              profile={props.profile}
              setProfile={props.setProfile}
              activeDataset={props.activeDataset}
            />
          }
        />
        <Route
          path="/preferences"
          element={
            <PreferencesPage
              profile={props.profile}
              activeDataset={props.activeDataset}
              weights={props.weights}
              setWeights={props.setWeights}
              weightedResults={props.weightedResults}
            />
          }
        />
        <Route
          path="/recommendations"
          element={
            <RecommendationsPage
              profile={props.profile}
              activeDataset={props.activeDataset}
              weights={props.weights}
              weightedResults={props.weightedResults}
            />
          }
        />
        <Route
          path="/tradeoffs"
          element={
            <TradeoffPage
              profile={props.profile}
              paretoResults={props.paretoResults}
              weightedResults={props.weightedResults}
            />
          }
        />
      </Routes>
    </Shell>
  );
}

function LoginPage({ isAuthenticated, onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(demoUser.email);
  const [password, setPassword] = useState(demoUser.password);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (email === demoUser.email && password === demoUser.password) {
      onLogin();
      navigate("/onboarding");
      return;
    }

    setError("Use the demo stakeholder credentials shown on the screen.");
  }

  return (
    <main className="auth-layout">
      <section className="hero-card">
        <div>
          <span className="eyebrow">PAIR platform</span>
          <h1>Task 2.2 recommendation demo for transportation data sharing.</h1>
          <p>
            This mockup focuses on the stakeholder workflow in Section 5.2: specify an ITS
            dataset and application, set metric preferences, and review candidate
            privacy-preserving techniques.
          </p>
        </div>

        <div className="credential-card">
          <strong>Demo credentials</strong>
          <p>{demoUser.email}</p>
          <p>{demoUser.password}</p>
        </div>
      </section>

      <section className="login-card">
        <h2>Stakeholder Sign-In</h2>
        <p>Agency and data-sharing site access for mock recommendations.</p>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <div className="alert error">{error}</div> : null}
          <button type="submit">Enter Demo</button>
        </form>
      </section>
    </main>
  );
}

function Shell({ children, profile, activeDataset, onLogout }) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <span className="eyebrow">PAIR Task 2.2</span>
          <h2>Stakeholder Recommendation Workspace</h2>
          <p className="muted">
            Candidate PPT selection for ITS datasets using weighted preferences and Pareto
            tradeoffs.
          </p>
        </div>

        <nav className="step-nav">
          {steps.map((step, index) => (
            <Link
              key={step.path}
              to={step.path}
              className={location.pathname === step.path ? "step-link active" : "step-link"}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {step.label}
            </Link>
          ))}
        </nav>

        <div className="mini-panel">
          <strong>Current scenario</strong>
          <p>{activeDataset.label}</p>
          <p>{profile.application}</p>
          <p>{profile.siteContext}</p>
        </div>

        <div className="mini-panel">
          <strong>{demoUser.name}</strong>
          <p>{demoUser.role}</p>
          <p>{demoUser.organization}</p>
          <button className="secondary-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

function OnboardingPage({ profile, setProfile, activeDataset }) {
  const navigate = useNavigate();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Section 5.2 workflow</span>
          <h1>Select an ITS dataset and application context.</h1>
        </div>
        <button onClick={() => navigate("/preferences")}>Continue to preferences</button>
      </div>

      <div className="grid two-column">
        <div className="panel">
          <h3>Dataset onboarding</h3>
          <div className="stack">
            <label>
              Dataset
              <select
                value={profile.datasetId}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, datasetId: event.target.value }))
                }
              >
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              ITS application
              <select
                value={profile.application}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, application: event.target.value }))
                }
              >
                {applications.map((application) => (
                  <option key={application} value={application}>
                    {application}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Sharing goal
              <textarea
                rows="4"
                value={profile.sharingGoal}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, sharingGoal: event.target.value }))
                }
              />
            </label>

            <label>
              Site context
              <select
                value={profile.siteContext}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, siteContext: event.target.value }))
                }
              >
                <option>Single agency data owner</option>
                <option>Regional multi-site collaboration</option>
                <option>Research-partner data release</option>
              </select>
            </label>
          </div>
        </div>

        <div className="panel contrast">
          <h3>Active dataset profile</h3>
          <div className="key-value">
            <span>Type</span>
            <strong>{activeDataset.type}</strong>
          </div>
          <div className="key-value">
            <span>Cadence</span>
            <strong>{activeDataset.cadence}</strong>
          </div>
          <div className="key-value">
            <span>Records</span>
            <strong>{activeDataset.records}</strong>
          </div>
          <div className="key-value">
            <span>Sensitivity</span>
            <strong>{activeDataset.sensitivity}</strong>
          </div>
          <div className="pill-row">
            {activeDataset.useCases.map((useCase) => (
              <span key={useCase} className="pill">
                {useCase}
              </span>
            ))}
          </div>
          <p className="muted">
            PAIR uses this context to filter candidate PPTs before recommendation.
          </p>
        </div>
      </div>
    </section>
  );
}

function PreferencesPage({ profile, activeDataset, weights, setWeights, weightedResults }) {
  const navigate = useNavigate();
  const normalized = normalizeWeights(weights);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Weighted-sum recommendation</span>
          <h1>Specify stakeholder priorities across the Section 5.2 metrics.</h1>
        </div>
        <button onClick={() => navigate("/recommendations")}>See recommendations</button>
      </div>

      <div className="grid two-column">
        <div className="panel">
          <h3>Metric priorities</h3>
          <p className="muted">
            The weighted-sum mode reflects the PDF’s site-specified preference workflow.
          </p>
          <div className="slider-list">
            {metrics.map((metric) => (
              <label key={metric.id} className="slider-row">
                <div>
                  <strong>{metric.label}</strong>
                  <p>{Math.round(normalized[metric.id] * 100)}% of final score</p>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights[metric.id]}
                  onChange={(event) =>
                    setWeights((current) => ({
                      ...current,
                      [metric.id]: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Scenario summary</h3>
          <div className="key-value">
            <span>Dataset</span>
            <strong>{activeDataset.label}</strong>
          </div>
          <div className="key-value">
            <span>Application</span>
            <strong>{profile.application}</strong>
          </div>
          <div className="key-value">
            <span>Goal</span>
            <strong>{profile.sharingGoal}</strong>
          </div>
          <div className="result-preview">
            <span className="eyebrow">Current top pick</span>
            <h4>{weightedResults[0]?.name ?? "No matching technique"}</h4>
            <p>{weightedResults[0]?.summary ?? "Adjust the dataset or application filters."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RecommendationsPage({ profile, activeDataset, weights, weightedResults }) {
  const navigate = useNavigate();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Candidate PPTs</span>
          <h1>Ranked recommendations for the current stakeholder scenario.</h1>
        </div>
        <button onClick={() => navigate("/tradeoffs")}>Explore tradeoffs</button>
      </div>

      <div className="panel summary-banner">
        <div>
          <strong>{activeDataset.label}</strong>
          <p>{profile.application}</p>
        </div>
        <div>
          <strong>Priority mode</strong>
          <p>Weighted-sum ranking across 6 Section 5.2 metrics</p>
        </div>
        <div>
          <strong>Top recommendation</strong>
          <p>{weightedResults[0]?.name ?? "No match"}</p>
        </div>
      </div>

      <div className="result-list">
        {weightedResults.map((technique, index) => (
          <article key={technique.id} className={index === 0 ? "panel result-card top" : "panel result-card"}>
            <div className="result-header">
              <div>
                <span className="rank-badge">#{index + 1}</span>
                <h3>{technique.name}</h3>
                <p>{technique.category}</p>
              </div>
              <div className="score-badge">{(technique.weightedScore * 100).toFixed(1)}</div>
            </div>

            <p>{technique.summary}</p>

            <div className="metric-grid">
              {metrics.map((metric) => (
                <MetricTile
                  key={metric.id}
                  label={metric.short}
                  value={technique.scores[metric.id]}
                />
              ))}
            </div>

            <div className="split-notes">
              <div>
                <strong>Why it fits</strong>
                <ul>
                  {technique.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Watchouts</strong>
                <ul>
                  {technique.cautions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="panel">
        <h3>Weight configuration</h3>
        <div className="pill-row">
          {metrics.map((metric) => (
            <span key={metric.id} className="pill">
              {metric.short}: {weights[metric.id]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function TradeoffPage({ profile, paretoResults, weightedResults }) {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Pareto tradeoff exploration</span>
          <h1>Nondominated candidate techniques for stakeholders without fixed priorities.</h1>
        </div>
      </div>

      <div className="grid two-column">
        <div className="panel">
          <h3>Pareto front</h3>
          <p className="muted">
            These techniques are not dominated across the six evaluation metrics described in
            Section 5.2.
          </p>
          <div className="pareto-list">
            {paretoResults.map((technique) => (
              <div key={technique.id} className="pareto-item">
                <div>
                  <strong>{technique.name}</strong>
                  <p>{technique.category}</p>
                </div>
                <span className="pareto-tag">Pareto-optimal</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel contrast">
          <h3>Stakeholder interpretation</h3>
          <p>
            For <strong>{profile.application}</strong>, the top weighted recommendation is{" "}
            <strong>{weightedResults[0]?.name ?? "not available"}</strong>. If the stakeholder
            does not want to set explicit priorities, the app surfaces the Pareto-optimal set
            instead of forcing a single winner.
          </p>
        </div>
      </div>

      <div className="grid two-column charts">
        <div className="panel">
          <h3>Traffic volume and speed snapshot</h3>
          <SimpleSeriesChart data={trafficSeries} />
        </div>

        <div className="panel">
          <h3>Lane-level raw vs protected counts</h3>
          <LaneComparisonChart data={trajectoryPreview} />
        </div>
      </div>
    </section>
  );
}

function MetricTile({ label, value }) {
  return (
    <div className="metric-tile">
      <span>{label}</span>
      <strong>{Math.round(value * 100)}</strong>
      <div className="meter">
        <div className="meter-fill" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function SimpleSeriesChart({ data }) {
  const maxVolume = Math.max(...data.map((point) => point.rawVolume));
  const maxSpeed = Math.max(...data.map((point) => point.avgSpeed));

  return (
    <div className="chart-card">
      {data.map((point) => (
        <div key={point.minute} className="chart-row">
          <div className="chart-label">{point.minute}</div>
          <div className="chart-bars">
            <div
              className="bar raw"
              style={{ width: `${(point.rawVolume / maxVolume) * 100}%` }}
            />
            <div
              className="bar safe"
              style={{ width: `${(point.safeVolume / maxVolume) * 100}%` }}
            />
          </div>
          <div className="chart-meta">
            <span>{point.rawVolume}</span>
            <span>
              {point.avgSpeed}/{point.safeSpeed} mph
            </span>
            <span>{Math.round((point.avgSpeed / maxSpeed) * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LaneComparisonChart({ data }) {
  const maxValue = Math.max(...data.flatMap((point) => [point.raw, point.protected]));

  return (
    <div className="lane-chart">
      {data.map((point) => (
        <div key={point.lane} className="lane-row">
          <div className="lane-label">{point.lane}</div>
          <div className="lane-bars">
            <div className="lane-track">
              <div className="lane-bar raw" style={{ width: `${(point.raw / maxValue) * 100}%` }} />
            </div>
            <div className="lane-track">
              <div
                className="lane-bar safe"
                style={{ width: `${(point.protected / maxValue) * 100}%` }}
              />
            </div>
          </div>
          <div className="lane-values">
            <span>{point.raw}</span>
            <span>{point.protected}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
