import type { BaseApp } from './base.app';
import stripeApp from './stripe';
import razorpayApp from './razorpay';
import shiprocketApp from './shiprocket';
import webhookApp from './webhook';

const registry = new Map<string, BaseApp>();

// Register built-in apps
for (const app of [stripeApp, razorpayApp, shiprocketApp, webhookApp]) {
  registry.set(app.meta.slug, app);
}

export function getApp(slug: string): BaseApp | undefined {
  return registry.get(slug);
}

export function getAllApps(): BaseApp[] {
  return Array.from(registry.values());
}

/**
 * Register a custom app at runtime.
 * Call this during bootstrap before handling requests.
 */
export function registerApp(app: BaseApp): void {
  registry.set(app.meta.slug, app);
}

export default registry;
