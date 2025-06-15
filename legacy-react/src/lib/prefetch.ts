const routeImports: Record<string, () => Promise<any>> = {
  "/login": () => import("../pages/Login"),
  "/dashboard": () => import("../pages/Dashboard"),
  "/settings": () => import("../pages/Settings"),
  "/subscription": () => import("../pages/Subscription"),
  "/terms": () => import("../pages/Terms"),
  "/privacy": () => import("../pages/Privacy"),
  "/changelog": () => import("../pages/Changelog"),
  "/splash": () => import("../pages/Splash"),
  "/": () => import("../pages/Index"),
};

export function prefetchRoute(path: string): void {
  const importer = routeImports[path];
  if (importer) {
    importer();
  }
}
