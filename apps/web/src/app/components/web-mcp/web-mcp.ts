// Registers tools on the WebMCP `document.modelContext`, like the `use-webmcp-tool` hook.

export interface WebMcpTool<Args = never> {
  name: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean };
  execute: (args: Args) => unknown;
}

interface ToolResponse {
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

interface ModelContext {
  registerTool: (
    tool: Omit<WebMcpTool, "execute"> & {
      execute: (args: unknown) => Promise<ToolResponse>;
    },
    options: { signal: AbortSignal }
  ) => void;
}

const RETRY_INTERVAL_MS = 500;
const RETRY_ATTEMPTS = 20;

const modelContext = () =>
  (document as Document & { modelContext?: ModelContext }).modelContext;

// Stringify for error reporting without ever throwing itself.
const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const toToolResponse = (value: unknown): ToolResponse => {
  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as ToolResponse).content)
  ) {
    return value as ToolResponse;
  }
  if (value === undefined || value === null) {
    return { content: [] };
  }
  if (typeof value === "string") {
    return { content: [{ text: value, type: "text" }] };
  }
  return { content: [{ text: JSON.stringify(value), type: "text" }] };
};

const toErrorResponse = (error: unknown): ToolResponse => {
  let text: string;
  if (error instanceof Error) {
    text = error.message;
  } else if (typeof error === "string") {
    text = error;
  } else {
    text = safeStringify(error);
  }
  return { content: [{ text, type: "text" }], isError: true };
};

const register = (
  context: ModelContext,
  tools: readonly WebMcpTool[],
  signal: AbortSignal
) => {
  for (const { execute, ...tool } of tools) {
    try {
      context.registerTool(
        {
          ...tool,
          async execute(args) {
            try {
              const result = await execute(args as never);
              if (result instanceof Error) {
                throw result;
              }
              return toToolResponse(result);
            } catch (error) {
              return toErrorResponse(error);
            }
          },
        },
        { signal }
      );
    } catch {
      // For example a NotAllowedError when the `tools` permissions policy is off.
    }
  }
};

/** Registers `tools` until `signal` aborts. Waits up to 10 seconds for an extension to inject the API. */
export const registerWebMcpTools = (
  tools: readonly WebMcpTool[],
  signal: AbortSignal
) => {
  const context = modelContext();
  if (context) {
    register(context, tools, signal);
    return;
  }
  let attempts = 0;
  const timer = setInterval(() => {
    const injected = modelContext();
    if (injected) {
      clearInterval(timer);
      register(injected, tools, signal);
    } else {
      attempts += 1;
      if (attempts >= RETRY_ATTEMPTS) {
        clearInterval(timer);
      }
    }
  }, RETRY_INTERVAL_MS);
  signal.addEventListener("abort", () => clearInterval(timer));
};
