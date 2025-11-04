import React, { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";

/**
 * SafeLoad
 * - loader: () => import('./path/to/Component')
 * - name: friendly name used in fallbacks
 *
 * Usage:
 * <SafeLoad loader={() => import("./components/Header")} name="Header" />
 */
export default function SafeLoad({ loader, name }: { loader: () => Promise<any>, name: string }) {
  const Component = React.lazy(loader);

  return (
    <ErrorBoundary>
      <Suspense fallback={<div style={{ padding: 12 }}>{`Loading ${name}…`}</div>}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}
