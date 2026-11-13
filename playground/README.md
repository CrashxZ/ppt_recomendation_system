# PAIR Privacy-Utility Playground

Interactive, precomputed Standard FL and TAPPFL results for NGSIM US-101 and I-80.
The demo includes 36 traffic scenes, trajectory playback, highway inference
probabilities, attack accuracy, utility comparisons, and per-client training curves.
These measurements are distinct from the PAIR portal's mock recommendation scores.

## Open the demo

- In PAIR, sign in and select **FL Playground** from the sidebar.
- From the federated-learning recommendation, select **Open interactive FL playground**.
- Open `playground.html` directly for a portable presentation with embedded data.
- Static hosting serves the same page at `/playground/index.html`.

The default is the portal's dark green theme, with teal for Standard FL and orange
for TAPPFL. The embedded view follows the portal theme. The standalone page accepts
`?theme=light` or `?theme=dark`. No external fonts, model server, or W&B connection
are needed to view the demo.

## Edit the source

| Content | File |
| --- | --- |
| Page text, layout, charts, interactions, and theme | `template.html` |
| Model labels, privacy settings, source notes, base configuration | `data_illustrative.json` |
| Batched evaluation results (512 cars per batch) | `playground_data.json` |
| Evaluation results with one car per batch | `playground_data_bs1.json` |
| Exported per-client training histories | `training_clients.json` |
| Conversion to the page's coordinate system and data schema | `convert.py` |
| Training-curve downsampling and notes | `add_training.py` |
| JSON embedding in the HTML template | `assemble.py` |
| Complete rebuild and copy into the portal's public assets | `build.py` |

Some overview sentences are generated near the bottom of `template.html`. Search
for `ovData`, `ovAlgo`, `ovUtil`, and `ovPriv`.

## Rebuild

From the repository root, using Python 3 (standard library only):

```sh
python playground/build.py
```

This updates `data_real.json`, `playground.html`, and
`../public/playground/index.html`. The generated public HTML is checked in, so
Vite builds and Vercel deployments do not need to run Python.

To view the alternative evaluation protocol:

```sh
python playground/build.py --input playground_data_bs1.json
```

Run the default command again before committing to keep the checked-in demo on
the documented batched evaluation protocol.

For individual pipeline steps, run from this directory:

```sh
python convert.py playground_data.json
python add_training.py data_real.json training_clients.json data_real.json
python assemble.py template.html data_real.json playground.html
```

Edit `template.html` rather than generated HTML so the next rebuild preserves
your changes. Source evaluation bundles and training histories are included for
reproducibility; changing the theme does not change their measurements.
