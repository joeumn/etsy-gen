class Registry {
  setDefaultLabels() {}
  registerMetric() {}
  metrics() {
    return "";
  }
}

class BaseMetric {
  constructor(public config: Record<string, unknown>) {}
  labels() {
    return this;
  }
  observe() {}
  inc() {}
  set() {}
}

class Histogram extends BaseMetric {}
class Counter extends BaseMetric {}
class Gauge extends BaseMetric {}

const collectDefaultMetrics = () => {};

export default {
  Registry,
  Histogram,
  Counter,
  Gauge,
  collectDefaultMetrics,
};
