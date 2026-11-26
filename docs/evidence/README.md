# Hugging Face public-metadata evidence

`huggingface-public-snapshot.json` is a bounded snapshot of **public repository metadata** obtained with the `hf` CLI. It is discoverability material, not verification: a model or dataset being listed does not mean TAMV evaluated it, adopted it, deployed it, inherited its license terms or received independent review.

Regenerate from a machine with `hf` 2.x on `PATH`:

```powershell
node 'C:\Users\tamvo\AppData\Roaming\npm\node_modules\pnpm\bin\pnpm.mjs' hf:snapshot
```

The generator only calls these read commands:

- `hf models list --search <fixed term> --limit 5 --format json`
- `hf datasets list --search <fixed term> --limit 5 --format json`
- `hf version`

Safety boundaries:

- Search terms and limits are fixed in the script; request payloads cannot choose a URL or provider.
- No token flags, private/gated repositories, descriptions, model weights, embeddings or inference output are stored.
- `id`, URLs, tags, timestamps, counts and digests are normalized and bounded before writing.
- The generated file is committed; the public route `GET /api/v1/huggingface` reads that file locally and performs no runtime network call.
- This bridge does not establish authorship, license clearance, model quality, benchmark validity or peer review.

The snapshot is served as evidence of **what public Hub records were visible at `generated_at`**, not as a live catalogue or a recommendation.
