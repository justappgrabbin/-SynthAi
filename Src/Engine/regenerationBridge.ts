// app/src/os/regenerationBridge.ts
// Bridge: regeneration result -> materialized app -> registered app -> launchable

import { materializeApp, type MaterializedApp } from "./materializeApp";
import { saveGeneratedApp } from "./generatedApps";

export function completeRegeneration(result: {
  code: string;
  name?: string;
  modeUsed?: string;
}): MaterializedApp {
  const app = materializeApp({
    name: result.name ?? "Regenerated Morph App",
    source: result.code,
    type: "html",
  });

  saveGeneratedApp(app);

  return app;
}
