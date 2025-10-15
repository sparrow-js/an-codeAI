/**
 * Parse React Router paths from JSX code
 * Extracts Route components and their path attributes
 */

export interface RouteInfo {
  path: string;
  element?: string;
  isDynamic: boolean;
  params?: string[];
}

/**
 * Parse React Router paths from JSX/TSX code string
 * @param code - The JSX/TSX code containing Route components
 * @returns Array of route information objects
 */
export function parseRouterPaths(code: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  // Regular expression to match Route components with path attributes
  // Matches both self-closing and regular Route tags
  const routeRegex = /<Route\s+[^>]*path=["']([^"']+)["'][^>]*(?:element=\{<([^/>]+)[^}]*\})?[^>]*\/?>/g;
  
  let match;
  while ((match = routeRegex.exec(code)) !== null) {
    const path = match[1];
    const element = match[2];
    
    // Check if the route has dynamic parameters (contains :)
    const isDynamic = path.includes(':');
    
    // Extract parameter names from dynamic routes
    const params = isDynamic ? extractParams(path) : [];
    
    routes.push({
      path,
      element,
      isDynamic,
      params: params.length > 0 ? params : undefined
    });
  }
  
  return routes;
}

/**
 * Extract parameter names from a dynamic route path
 * @param path - Route path like "/book/:id" or "/user/:userId/post/:postId"
 * @returns Array of parameter names
 */
function extractParams(path: string): string[] {
  const paramRegex = /:([^/]+)/g;
  const params: string[] = [];
  
  let match;
  while ((match = paramRegex.exec(path)) !== null) {
    params.push(match[1]);
  }
  
  return params;
}

/**
 * Get just the path strings from the parsed routes
 * @param code - The JSX/TSX code containing Route components
 * @returns Array of path strings
 */
export function extractRoutePaths(code: string): string[] {
  return parseRouterPaths(code).map(route => route.path);
}

/**
 * Get only dynamic routes (routes with parameters)
 * @param code - The JSX/TSX code containing Route components
 * @returns Array of dynamic route information
 */
export function getDynamicRoutes(code: string): RouteInfo[] {
  return parseRouterPaths(code).filter(route => route.isDynamic);
}

/**
 * Get only static routes (routes without parameters)
 * @param code - The JSX/TSX code containing Route components
 * @returns Array of static route information
 */
export function getStaticRoutes(code: string): RouteInfo[] {
  return parseRouterPaths(code).filter(route => !route.isDynamic);
}