/**
 * Telemetry Utility for Google Analytics (GA4)
 */

interface GTagEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const trackEvent = ({ action, category, label, value, ...rest }: GTagEvent) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...rest,
    });
  }
};

/**
 * Common Funnel Events
 */
export const trackFunnelStep = (stepName: string, data: any = {}) => {
  trackEvent({
    action: 'funnel_step',
    category: 'funnel',
    label: stepName,
    ...data
  });
};

/**
 * High-value conversion actions
 */
export const trackConversion = (actionName: string, data: any = {}) => {
  trackEvent({
    action: 'conversion',
    category: 'conversion',
    label: actionName,
    ...data
  });
};

/**
 * Scroll depth tracking
 */
export const trackScrollDepth = (depth: number, context: string) => {
  trackEvent({
    action: 'scroll_depth',
    category: 'engagement',
    label: `${depth}%`,
    context,
    percent: depth
  });
};
