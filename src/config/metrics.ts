import client from "prom-client";

export const metricsRegister = new client.Registry();

metricsRegister.setDefaultLabels({
  service: "etsy-gen",
});

client.collectDefaultMetrics({
  register: metricsRegister,
});

export const jobDurationHistogram = new client.Histogram({
  name: "pipeline_job_duration_ms",
  help: "Duration of pipeline jobs in milliseconds",
  labelNames: ["stage", "status"],
  buckets: [100, 500, 1000, 5000, 15000, 60000, 300000],
  registers: [metricsRegister],
});

export const jobFailureCounter = new client.Counter({
  name: "pipeline_job_failures_total",
  help: "Total number of pipeline job failures",
  labelNames: ["stage"],
  registers: [metricsRegister],
});
