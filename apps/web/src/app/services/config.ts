import { Injectable } from "@angular/core";

import type { PackageManager } from "@/lib/content/types";

import { storedSignal } from "./stored-signal";

export type InstallationType = "cli" | "manual";

/** Choices the docs remember across pages, under the reference's storage keys. */
@Injectable({ providedIn: "root" })
export class ConfigService {
  readonly config = storedSignal<{ installationType: InstallationType }>(
    "config",
    {
      installationType: "cli",
    }
  );
  readonly packageManager = storedSignal<PackageManager>(
    "package-manager",
    "pnpm"
  );
}
