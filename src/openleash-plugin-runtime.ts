import type {
  PipelineEvent,
  PluginFinding,
  PluginRunRecord,
} from "@openleash/shared";

export function pluginRun(input: {
  pluginId: string;
  event: PipelineEvent;
  status: PluginRunRecord["status"];
  summary: string;
  startedAt: number;
  findings?: PluginFinding[];
  metadata?: Record<string, unknown>;
}): PluginRunRecord {
  return {
    pluginId: input.pluginId,
    event: input.event,
    status: input.status,
    summary: input.summary,
    durationMs: Math.max(0, Date.now() - input.startedAt),
    findings: input.findings,
    metadata: input.metadata,
  };
}
