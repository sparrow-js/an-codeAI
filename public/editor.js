// This script handles web page interaction, element selection, and event tracking for the Lovable dev tool.
// Constants and Configurations

const v = {
    HIGHLIGHT_COLOR: "#0da2e7",
    HIGHLIGHT_BG: "#0da2e71a",
    ALLOWED_ORIGINS: ["http://localhost:3000", "https://www.genfly.dev", "http://localhost:8080", "https://www.needware.dev"],
    DEBOUNCE_DELAY: 10,
    Z_INDEX: 1e4,
    TOOLTIP_OFFSET: 25,
    MAX_TOOLTIP_WIDTH: 200,
    SCROLL_DEBOUNCE: 420,
    FULL_WIDTH_TOOLTIP_OFFSET: "12px",
    HIGHLIGHT_STYLE: {
      FULL_WIDTH: { OFFSET: "-5px", STYLE: "solid" },
      NORMAL: { OFFSET: "0", STYLE: "solid" },
    },
    SELECTED_ATTR: "data-lov-selected",
    HOVERED_ATTR: "data-lov-hovered",
    OVERRIDE_STYLESHEET_ID: "lovable-override",
  };
  
  // Utility Functions
  // Sends messages to allowed parent origins
  const postMessageToParent = (message) => {
    v.ALLOWED_ORIGINS.forEach((origin) => {
      try {
        if (!window.parent) return;
        if (!message || typeof message !== "object") {
          console.error("Invalid message format");
          return;
        }
        window.parent.postMessage(message, origin);
      } catch (error) {
        console.error(`Failed to send message to ${origin}:`, error);
      }
    });
  };
  
  // Waits for document to be ready
  const waitForDocumentReady = () =>
    new Promise((resolve) => {
      if (document.readyState !== "loading") {
        resolve();
        return;
      }
      requestIdleCallback(() => resolve());
    });
  
  // Waits for React suspense and HMR
  const waitForReactSuspense = async () => {
    await waitForDocumentReady();
    const hot = import.meta.hot;
    if (hot) {
      await new Promise((resolve) => {
        const checkPending = () => {
          if (!hot.data.pending) {
            resolve();
            return;
          }
          setTimeout(checkPending, 50);
        };
        checkPending();
      });
    }
    if (window.__REACT_SUSPENSE_DONE) {
      await window.__REACT_SUSPENSE_DONE;
    }
    return true;
  };
  
  // Waits for root element to have children
  const waitForRootChildren = () =>
    new Promise((resolve) => {
      const root = document.getElementById("root");
      if (root && root.children.length > 0) {
        resolve();
        return;
      }
      new MutationObserver((_, observer) => {
        const root = document.getElementById("root");
        if (root && root.children.length > 0) {
          observer.disconnect();
          resolve();
        }
      }).observe(document.body, { childList: true, subtree: true });
    });
  
  // Network Request Interceptor
  const interceptFetch = () => {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const startTime = Date.now();
      try {
        let requestBody;
        if (args?.[1]?.body) {
          try {
            if (typeof args[1].body === "string") {
              requestBody = args[1].body;
            } else if (args[1].body instanceof FormData) {
              requestBody = "FormData: " + Array.from(args[1].body.entries()).map(([k, v]) => `${k}=${v}`).join("&");
            } else if (args[1].body instanceof URLSearchParams) {
              requestBody = args[1].body.toString();
            } else {
              requestBody = JSON.stringify(args[1].body);
            }
          } catch {
            requestBody = "Could not serialize request body";
          }
        }
        const response = await originalFetch(...args);
        postMessageToParent({
          type: "NETWORK_REQUEST",
          request: {
            url: args?.[0] || response.url,
            method: args?.[1]?.method || "GET",
            status: response.status,
            statusText: response.statusText,
            responseBody: response?.clone?.() ? await response.clone().text() : undefined,
            requestBody,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            origin: window.location.origin,
            headers: args?.[1]?.headers ? Object.fromEntries(new Headers(args?.[1]?.headers)) : {},
          },
        });
        return response;
      } catch (error) {
        let requestBody;
        if (args?.[1]?.body) {
          try {
            if (typeof args[1].body === "string") {
              requestBody = args[1].body;
            } else if (args[1].body instanceof FormData) {
              requestBody = "FormData: " + Array.from(args[1].body.entries()).map(([k, v]) => `${k}=${v}`).join("&");
            } else if (args[1].body instanceof URLSearchParams) {
              requestBody = args[1].body.toString();
            } else {
              requestBody = JSON.stringify(args[1].body);
            }
          } catch {
            requestBody = "Could not serialize request body";
          }
        }
        const requestInfo = {
          url: args?.[0],
          method: args?.[1]?.method || "GET",
          origin: window.location.origin,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          headers: args?.[1]?.headers ? Object.fromEntries(new Headers(args?.[1]?.headers)) : {},
          requestBody,
        };
        const errorDetails =
          error instanceof TypeError
            ? { ...requestInfo, error: { message: error?.message || "Unknown error", stack: error?.stack } }
            : {
                ...requestInfo,
                error: {
                  message: error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : "Unknown fetch error",
                  stack: error && typeof error === "object" && "stack" in error && typeof error.stack === "string" ? error.stack : "Not available",
                },
              };
        postMessageToParent({ type: "NETWORK_REQUEST", request: errorDetails });
        throw error;
      }
    };
  };
  
  // Error and Promise Rejection Handler
  const handleErrors = (() => {
    let initialized = false;
    return () => {
      if (initialized) return;
      const errorSet = new Set();
      const getErrorKey = ({ lineno, colno, filename, message }) => `${message}|${filename}|${lineno}|${colno}`;
      interceptFetch();
      const shouldSkipError = (errorKey) => {
        if (errorSet.has(errorKey)) return true;
        errorSet.add(errorKey);
        setTimeout(() => errorSet.delete(errorKey), 5000);
        return false;
      };
      const formatError = ({ message, lineno, colno, filename, error }) => ({
        message,
        lineno,
        colno,
        filename,
        stack: error?.stack,
      });
      const handleError = (event) => {
        const errorKey = getErrorKey(event);
        if (shouldSkipError(errorKey)) return;
        const errorData = formatError(event);
        postMessageToParent({
          type: "RUNTIME_ERROR",
          error: { ...errorData, blankScreen: document.querySelector("div#root")?.childElementCount === 0 },
        });
      };
      window.addEventListener("error", handleError);
      window.addEventListener("unhandledrejection", (event) => {
        if (!event.reason?.stack) return;
        const errorKey = event.reason?.stack || event.reason?.message || String(event.reason);
        if (shouldSkipError(errorKey)) return;
        const errorData = {
          message: event.reason?.message || "Unhandled promise rejection",
          stack: event.reason?.stack || String(event.reason),
        };
        postMessageToParent({ type: "UNHANDLED_PROMISE_REJECTION", error: errorData });
      });
      initialized = true;
    };
  })();
  
  // Console Output Interceptor
  const interceptConsole = (() => {
    let initialized = false;
    let messages = [];
    let timeoutId = null;
    const consoleMethods = { log: console.log, warn: console.warn, error: console.error };
    const levelMap = { log: "info", warn: "warning", error: "error" };
    const flushMessages = () => {
      if (messages.length === 0) {
        timeoutId = null;
        return;
      }
      const batch = [...messages];
      messages.length = 0;
      timeoutId = null;
      postMessageToParent({ type: "CONSOLE_OUTPUT", messages: batch });
    };
    return () => {
      if (initialized) return;
      const intercept = (method) => {
        console[method] = (...args) => {
          consoleMethods[method].apply(console, args);
          let stack = null;
          if (method === "warn" || method === "error") {
            const error = new Error();
            if (error.stack) {
              stack = error.stack
                .split("\n")
                .slice(2)
                .join("\n");
            }
          }
          const serializedArgs = args.map((arg) =>
            serialize(arg, { maxDepth: 5, includeSymbols: true, preserveTypes: true })
          );
          const message = serializedArgs
            .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg, null, 2).slice(0, 1e4)))
            .join(" ") + (stack ? `\n${stack}` : "");
          const logEntry = {
            level: levelMap[method],
            message: message.slice(0, 1e4),
            logged_at: new Date().toISOString(),
            raw: serializedArgs,
          };
          messages.push(logEntry);
          if (timeoutId === null) {
            timeoutId = setTimeout(flushMessages, 250);
          }
        };
      };
      intercept("log");
      intercept("warn");
      intercept("error");
      initialized = true;
    };
  })();
  
  // Serialization Utility
  class CircularReference {
    constructor(path) {
      this.message = `[Circular Reference to ${path}]`;
    }
  }
  
  class TypedValue {
    constructor(type, value) {
      this._type = type;
      this.value = value;
    }
  }
  
  const serializationConfig = {
    maxDepth: 10,
    indent: 2,
    includeSymbols: true,
    preserveTypes: true,
    maxStringLength: 1e4,
    maxArrayLength: 100,
    maxObjectKeys: 100,
  };
  
  const serialize = (value, options = {}, visited = new WeakMap(), path = "root") => {
    const config = { ...serializationConfig, ...options };
    if (path.split(".").length > config.maxDepth) {
      return new TypedValue("MaxDepthReached", `[Max depth of ${config.maxDepth} reached]`);
    }
    if (value === undefined) return new TypedValue("undefined", "undefined");
    if (value === null) return null;
    if (typeof value === "string") {
      return value.length > config.maxStringLength
        ? new TypedValue("String", `${value.slice(0, config.maxStringLength)}... [${value.length - config.maxStringLength} more characters]`)
        : value;
    }
    if (typeof value === "number") {
      if (Number.isNaN(value)) return new TypedValue("Number", "NaN");
      if (!Number.isFinite(value)) return new TypedValue("Number", value > 0 ? "Infinity" : "-Infinity");
      return value;
    }
    if (typeof value === "boolean") return value;
    if (typeof value === "bigint") return new TypedValue("BigInt", value.toString());
    if (typeof value === "symbol") return new TypedValue("Symbol", value.toString());
    if (typeof value === "function") {
      return new TypedValue("Function", {
        name: value.name || "anonymous",
        stringValue: value.toString().slice(0, config.maxStringLength),
      });
    }
    if (value && typeof value === "object") {
      if (visited.has(value)) return new CircularReference(visited.get(value));
      visited.set(value, path);
    }
    if (value instanceof Error) {
      const errorObj = { name: value.name, message: value.message, stack: value.stack };
      for (const key of Object.getOwnPropertyNames(value)) {
        if (!errorObj[key]) {
          errorObj[key] = serialize(value[key], config, visited, `${path}.${key}`);
        }
      }
      return new TypedValue("Error", errorObj);
    }
    if (value instanceof Date) {
      return new TypedValue("Date", {
        iso: value.toISOString(),
        value: value.valueOf(),
        local: value.toString(),
      });
    }
    if (value instanceof RegExp) {
      return new TypedValue("RegExp", {
        source: value.source,
        flags: value.flags,
        string: value.toString(),
      });
    }
    if (value instanceof Promise) return new TypedValue("Promise", "[Promise]");
    if (value instanceof WeakMap || value instanceof WeakSet) {
      return new TypedValue(value.constructor.name, `[${value.constructor.name}]`);
    }
    if (value instanceof Set) {
      const items = Array.from(value);
      if (items.length > config.maxArrayLength) {
        return new TypedValue("Set", {
          values: items.slice(0, config.maxArrayLength).map((item, i) => serialize(item, config, visited, `${path}.Set[${i}]`)),
          truncated: items.length - config.maxArrayLength,
        });
      }
      return new TypedValue("Set", {
        values: items.map((item, i) => serialize(item, config, visited, `${path}.Set[${i}]`)),
      });
    }
    if (value instanceof Map) {
      const entries = {};
      let count = 0;
      let truncated = 0;
      for (const [key, val] of value.entries()) {
        if (count >= config.maxObjectKeys) {
          truncated++;
          continue;
        }
        const keyStr = typeof key === "object" ? JSON.stringify(serialize(key, config, visited, `${path}.MapKey`)) : String(key);
        entries[keyStr] = serialize(val, config, visited, `${path}.Map[${keyStr}]`);
        count++;
      }
      return new TypedValue("Map", { entries, truncated: truncated || undefined });
    }
    if (ArrayBuffer.isView(value)) {
      return new TypedValue(value.constructor.name, {
        length: value.length,
        byteLength: value.byteLength,
        sample: Array.from(value.slice(0, 10)),
      });
    }
    if (Array.isArray(value)) {
      if (value.length > config.maxArrayLength) {
        return value
          .slice(0, config.maxArrayLength)
          .map((item, i) => serialize(item, config, visited, `${path}[${i}]`))
          .concat([`... ${value.length - config.maxArrayLength} more items`]);
      }
      return value.map((item, i) => serialize(item, config, visited, `${path}[${i}]`));
    }
    const obj = {};
    let keys = [...Object.getOwnPropertyNames(value)];
    if (config.includeSymbols) {
      keys.push(...Object.getOwnPropertySymbols(value).map((s) => s.toString()));
    }
    let truncated = 0;
    keys
      .slice(0, config.maxObjectKeys)
      .forEach((key) => {
        try {
          obj[key] = serialize(value[key], config, visited, `${path}.${key}`);
        } catch (error) {
          obj[key] = new TypedValue("Error", `[Unable to serialize: ${error.message}]`);
        }
      });
    if (keys.length > config.maxObjectKeys) {
      truncated = keys.length - config.maxObjectKeys;
      obj["..."] = `${truncated} more properties`;
    }
    return obj;
  };
  
  // URL Change Listener
  const trackUrlChanges = () => {
    const handleLoad = () => {
      let currentUrl = document.location.href;
      const body = document.querySelector("body");
      const observer = new MutationObserver(() => {
        if (currentUrl !== document.location.href) {
          currentUrl = document.location.href;
          if (window.top) {
            window.top.postMessage({ type: "URL_CHANGED", url: currentUrl }, "https://lovable.dev");
            window.top.postMessage({ type: "URL_CHANGED", url: currentUrl }, "http://localhost:3000");
          }
        }
      });
      if (body) {
        observer.observe(body, { childList: true, subtree: true });
      }
    };
    window.addEventListener("load", handleLoad);
  };
  
  // Message Listener for Navigation
  const handleNavigationMessages = () => {
    const handleMessage = ({ origin, data }) => {
      if (!origin || !data?.type || !v.ALLOWED_ORIGINS.includes(origin)) return;
      if (data.type === "NAVIGATE") {
        if (data.direction === "back") {
          window.history.back();
        } else if (data.direction === "forward") {
          window.history.forward();
        }
      }
    };
    window.addEventListener("message", handleMessage);
  };
  
  // Component Tree Generator
  const generateComponentTree = (element) => {
    const buildTree = (node) => {
      const treeNode = {
        type: "node",
        children: [],
        attrs: [...node.attributes].reduce((acc, attr) => ({ ...acc, [attr.name]: attr.value }), {}),
        tagName: node.tagName,
        data: getElementData(node),
      };
      [...node.childNodes].forEach((child) => {
        if (child instanceof HTMLElement) {
          treeNode.children.push(buildTree(child));
        } else if (child instanceof Text) {
          treeNode.children.push({ type: "text", textContent: child.textContent || "" });
        }
      });
      return treeNode;
    };
    return buildTree(element);
  };
  
  // Sends component tree to parent
  const sendComponentTree = async () => {
    await waitForReactSuspense();
    const root = document.querySelector("#root");
    const tree = generateComponentTree(root);
    postMessageToParent({ type: "COMPONENT_TREE", payload: { tree } });
  };
  
  // Keybind Handler
  const handleKeybinds = () => {
    window.addEventListener(
      "keydown",
      (event) => {
        const modifiers = [];
        if (event.metaKey) modifiers.push("Meta");
        if (event.ctrlKey) modifiers.push("Ctrl");
        if (event.altKey) modifiers.push("Alt");
        if (event.shiftKey) modifiers.push("Shift");
        const key =
          event.key !== "Meta" && event.key !== "Control" && event.key !== "Alt" && event.key !== "Shift" ? event.key : "";
        const compositeKey = [...modifiers, key].filter(Boolean).join("+");
        if (["Meta+z", "Meta+Backspace", "Meta+d"].includes(compositeKey)) {
          event.preventDefault();
        }
        if (compositeKey) {
          postMessageToParent({
            type: "KEYBIND",
            payload: {
              compositeKey,
              rawEvent: {
                key: event.key,
                code: event.code,
                metaKey: event.metaKey,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
              },
              timestamp: Date.now(),
            },
          });
        }
      },
      { passive: true }
    );
  };
  
  // Element Data Extractor
  const parseDataLovId = (id) => {
    if (!id) return {};
    const [filePath, lineNumber, col] = id.split(":");
    return {
      filePath: filePath || "",
      lineNumber: parseInt(lineNumber || "0", 10),
      col: parseInt(col || "0", 10),
    };
  };
  
  const getElementInfo = (element) => {
    const lovId = element.getAttribute("data-lov-id") || "";
    if (lovId) {
      const { filePath, lineNumber, col } = parseDataLovId(lovId);
      return { filePath: filePath || "", lineNumber: lineNumber || 0, col: col || 0 };
    }
    const componentPath = element.getAttribute("data-component-path") || "";
    const componentLine = element.getAttribute("data-component-line") || "";
    return {
      filePath: componentPath || "",
      lineNumber: parseInt(componentLine, 10) || 0,
      col: 0,
    };
  };
  
  const getElementData = (element) => {
    const lovId = element.getAttribute("data-lov-id") || "";
    const { filePath, lineNumber, col } = parseDataLovId(lovId);
    const tagName = element.tagName.toLowerCase();
    const content = element.getAttribute("data-component-content") || null;
    const children = Array.from(element.children)
      .filter((child) => hasLovableAttributes(child) && getElementInfo(child).filePath !== filePath)
      .filter((child, index, arr) => index === arr.findIndex((c) => getElementInfo(c).filePath === getElementInfo(child).filePath))
      .map((child) => ({
        id: child.getAttribute("data-lov-id") || "",
        filePath: getElementInfo(child).filePath,
        fileName: getElementInfo(child).filePath?.split?.("/").pop() || "",
        lineNumber: getElementInfo(child).lineNumber,
        col: getElementInfo(child).col,
        elementType: child.tagName.toLowerCase(),
        content: child.getAttribute("data-component-content") || "",
        className: child.getAttribute("class") || "",
        textContent: child.innerText,
        attrs: { src: child.getAttribute("src") || "" },
      }));
    return {
      id: element.getAttribute("data-lov-id") || "",
      filePath: getElementInfo(element).filePath,
      fileName: getElementInfo(element).filePath?.split?.("/").pop() || "",
      lineNumber: getElementInfo(element).lineNumber,
      col: getElementInfo(element).col,
      elementType: tagName,
      content: content || "",
      children,
      className: element.getAttribute("class") || "",
      textContent: element.innerText,
      attrs: { src: element.getAttribute("src") || "" },
    };
  };
  
  // Checks if element has Lovable attributes
  const hasLovableAttributes = (element) =>
    element.hasAttribute("data-lov-id") || element.hasAttribute("data-component-path");
  
  // Selector Manager
  const initializeSelector = () => {
    class Selector {
      constructor() {
        this.hoveredElement = null;
        this.isActive = false;
        this.tooltip = null;
        this.scrollTimeout = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.styleElement = null;
      }
      reset() {
        this.hoveredElement = null;
        this.scrollTimeout = null;
      }
    }
  
    const selector = new Selector();
  
    // Debounce utility
    const debounce = (fn, delay) => {
      let timeout = null;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
      };
    };
  
    handleKeybinds();
  
    // Initialize tooltip and styles
    const initTooltip = () => {
      selector.tooltip = document.createElement("div");
      selector.tooltip.className = "gpt-selector-tooltip";
      selector.tooltip.setAttribute("role", "tooltip");
      document.body.appendChild(selector.tooltip);
  
      const style = document.createElement("style");
      style.textContent = `
        .gpt-selector-tooltip {
          position: fixed;
          z-index: ${v.Z_INDEX};
          pointer-events: none;
          background-color: ${v.HIGHLIGHT_COLOR};
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
          white-space: nowrap;
          display: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: opacity 0.2s ease-in-out;
          margin: 0;
        }
        [${v.HOVERED_ATTR}] {
          position: relative;
        }
        [${v.HOVERED_ATTR}]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0px;
          outline: 1px dashed ${v.HIGHLIGHT_COLOR} !important;
          outline-offset: ${v.HIGHLIGHT_STYLE.NORMAL.OFFSET} !important;
          background-color: ${v.HIGHLIGHT_BG} !important;
          z-index: ${v.Z_INDEX};
          pointer-events: none;
        }
        [${v.SELECTED_ATTR}] {
          position: relative;
        }
        [${v.SELECTED_ATTR}]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0px;
          outline: 1px dashed ${v.HIGHLIGHT_COLOR} !important;
          outline-offset: 3px !important;
          transition: outline-offset 0.2s ease-in-out;
          z-index: ${v.Z_INDEX};
          pointer-events: none;
        }
        [${v.SELECTED_ATTR}][contenteditable] {
          outline: none !important;
        }
        [${v.HOVERED_ATTR}][data-full-width]::before,
        [${v.SELECTED_ATTR}][data-full-width]::before {
          outline-offset: ${v.HIGHLIGHT_STYLE.FULL_WIDTH.OFFSET} !important;
        }
      `;
      document.head.appendChild(style);
    };
  
    // Update tooltip position and content
    const updateTooltip = (element) => {
      if (!selector.tooltip || !element) return;
      try {
        const rect = element.getBoundingClientRect();
        const tagName = element.tagName.toLowerCase();
        const isFullWidth = Math.abs(rect.width - window.innerWidth) < 5;
        selector.tooltip.style.maxWidth = `${v.MAX_TOOLTIP_WIDTH}px`;
        if (isFullWidth) {
          selector.tooltip.style.left = v.FULL_WIDTH_TOOLTIP_OFFSET;
          selector.tooltip.style.top = v.FULL_WIDTH_TOOLTIP_OFFSET;
        } else {
          const top = Math.max(0, rect.top - v.TOOLTIP_OFFSET);
          selector.tooltip.style.left = `${Math.max(0, rect.left)}px`;
          selector.tooltip.style.top = `${top}px`;
        }
        selector.tooltip.textContent = tagName;
      } catch (error) {
        console.error("Error updating tooltip:", error);
        hideTooltip();
      }
    };
  
    // Highlight hovered element
    const highlightElement = (element) => {
      const isFullWidth = Math.abs(element.getBoundingClientRect().width - window.innerWidth) < 5;
      element.setAttribute(v.HOVERED_ATTR, "true");
      if (isFullWidth) element.setAttribute("data-full-width", "true");
    };
  
    // Remove highlight from element
    const unhighlightElement = (element) => {
      element.removeAttribute(v.HOVERED_ATTR);
      element.removeAttribute("data-full-width");
      element.style.cursor = "";
    };
  
    // Check if element is within SVG
    const isSvgRelated = (element) => {
      const isSvg = element.tagName.toLowerCase() === "svg";
      const withinSvg = element.closest("svg") !== null;
      return !isSvg && withinSvg;
    };
  
    // Handle mouseover event
    const handleMouseOver = debounce((event) => {
      if (!selector.isActive || !hasLovableAttributes(event.target) || event.target.tagName.toLowerCase() === "html" || isSvgRelated(event.target)) return;
      if (selector.hoveredElement) {
        getElementsByInfo(getElementInfo(selector.hoveredElement)).forEach((el) => {
          if (!el.classList.contains("gpt-selected-element")) unhighlightElement(el);
        });
      }
      selector.hoveredElement = event.target;
      getElementsByInfo(getElementInfo(selector.hoveredElement))?.forEach((el) => {
        if (!el.classList.contains("gpt-selected-element")) highlightElement(el);
      });
      updateTooltip(selector.hoveredElement);
      if (selector.tooltip) {
        selector.tooltip.style.display = "block";
        selector.tooltip.style.opacity = "1";
      }
    }, v.DEBOUNCE_DELAY);
  
    // Handle mouseout event
    const handleMouseOut = debounce(() => {
      if (!selector.isActive) return;
      if (selector.hoveredElement) {
        getElementsByInfo(getElementInfo(selector.hoveredElement))?.forEach((el) => {
          el.removeAttribute(v.HOVERED_ATTR);
          if (!el.hasAttribute(v.SELECTED_ATTR)) unhighlightElement(el);
        });
        selector.hoveredElement = null;
      }
      hideTooltip();
    }, v.DEBOUNCE_DELAY);
  
    // Hide tooltip
    const hideTooltip = () => {
      if (selector.tooltip) {
        selector.tooltip.style.opacity = "0";
        selector.tooltip.style.display = "none";
      }
    };
  
    // Handle scroll event
    const handleScroll = () => {
      clearTimeout(selector.scrollTimeout);
      hideTooltip();
      if (selector.hoveredElement && !selector.hoveredElement.classList.contains("gpt-selected-element")) {
        unhighlightElement(selector.hoveredElement);
      }
      selector.scrollTimeout = setTimeout(() => {
        selector.scrollTimeout = null;
        const element = document.elementFromPoint(selector.mouseX, selector.mouseY);
        if (element && selector.isActive) {
          handleMouseOver({ target: element });
        }
      }, v.SCROLL_DEBOUNCE);
    };
  
    // Prevent input focus when active
    const preventInputFocus = (event) => {
      if (selector.isActive && event.target instanceof HTMLElement && ["input", "textarea", "select"].includes(event.target.tagName.toLowerCase())) {
        event.preventDefault();
      }
    };
  
    // Prevent default actions when active
    const preventDefaultActions = (event) => {
      if (selector.isActive) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
  
  
    // Get elements by Lovable attributes
    const getElementsByInfo = ({ filePath, lineNumber, col }) => {
      const lovIdSelector = `[data-lov-id="${filePath}:${lineNumber}:${col || "0"}]`;
      const elements = document.querySelectorAll(lovIdSelector);
      if (elements.length > 0) return elements;
      const componentSelector = `[data-component-path="${filePath}"][data-component-line="${lineNumber}"]`;
      return document.querySelectorAll(componentSelector);
    };
  
   
  
    // Track mouse position
    const trackMousePosition = (event) => {
      selector.mouseX = event.clientX;
      selector.mouseY = event.clientY;
    };
  
    // Request initial state
    const requestInitialState = () => {
      postMessageToParent({ type: "REQUEST_PICKER_STATE" });
      postMessageToParent({ type: "REQUEST_SELECTED_ELEMENTS" });
    };
  
  
  
    // Handle click event
    const handleClick = (event) => {
      if (!selector.isActive || !hasLovableAttributes(event.target) || event.target.tagName.toLowerCase() === "html" || isSvgRelated(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      if (selector.hoveredElement) {
        const elementData = getElementData(selector.hoveredElement);
        const rect = selector.hoveredElement.getBoundingClientRect();
        selector.hoveredElement.setAttribute(v.SELECTED_ATTR, "true");
        if (Math.abs(rect.width - window.innerWidth) < 5) {
          selector.hoveredElement.setAttribute("data-full-width", "true");
        }
        postMessageToParent({
          type: "ELEMENT_CLICKED",
          rect,
          payload: elementData,
          isMultiSelect: event.metaKey || event.ctrlKey,
        });
      }
    };
  
    // Handle double-click event
    const handleDoubleClick = (event) => {
      if (!selector.isActive || !hasLovableAttributes(event.target) || event.target.tagName.toLowerCase() === "html" || isSvgRelated(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      const elementData = getElementData(event.target);
      postMessageToParent({
        type: "ELEMENT_DOUBLE_CLICKED",
        payload: elementData,
      });
    };

    // Add event listeners
    const addEventListeners = () => {
      document.addEventListener("mouseover", handleMouseOver);
      document.addEventListener("mouseout", handleMouseOut);
      document.addEventListener("click", handleClick, true);
      document.addEventListener("dblclick", handleDoubleClick, true);
      window.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("mousedown", preventInputFocus, true);
      const style = document.createElement("style");
      style.textContent = `* { scroll-behavior: auto !important; }`;
      document.head.appendChild(style);
      selector.styleElement = style;
      document.addEventListener("click", preventDefaultActions, true);
      document.addEventListener("submit", preventDefaultActions, true);
      document.addEventListener("touchstart", preventDefaultActions, true);
      document.addEventListener("touchend", preventDefaultActions, true);
    };
  
    // Remove event listeners
    const removeEventListeners = () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", preventInputFocus, true);
      document.removeEventListener("click", preventDefaultActions, true);
      document.removeEventListener("submit", preventDefaultActions, true);
      document.removeEventListener("touchstart", preventDefaultActions, true);
      document.removeEventListener("touchend", preventDefaultActions, true);
      if (selector.styleElement) {
        selector.styleElement.remove();
        selector.styleElement = null;
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.msUserSelect = "";
      document.body.style.mozUserSelect = "";
      if (selector.hoveredElement) {
        if (!selector.hoveredElement.hasAttribute(v.SELECTED_ATTR)) unhighlightElement(selector.hoveredElement);
        selector.hoveredElement = null;
      }
      hideTooltip();
    };

     // Handle messages from parent
     const handleMessage = ({ origin, data }) => {
      try {
        if (!origin || !data?.type || !v.ALLOWED_ORIGINS.includes(origin)) return;
        switch (data.type) {
          case "TOGGLE_SELECTOR": {
            const isActive = !!data.payload;
            if (selector.isActive !== isActive) {
              selector.isActive = isActive;
              if (isActive) {
                addEventListeners();
                waitForRootChildren().then(() => {
                  document.querySelectorAll("button[disabled]").forEach((btn) => {
                    btn.removeAttribute("disabled");
                    btn.setAttribute("data-lov-disabled", "");
                  });
                });
              } else {
                removeEventListeners();
                document.querySelectorAll("[data-lov-disabled]").forEach((btn) => {
                  btn.removeAttribute("data-lov-disabled");
                  btn.setAttribute("disabled", "");
                });
                document.querySelectorAll(`[${v.HOVERED_ATTR}], [data-full-width]`).forEach((el) => {
                  if (!el.hasAttribute(v.SELECTED_ATTR)) {
                    unhighlightElement(el);
                    if (el instanceof HTMLElement) el.style.cursor = "";
                  }
                });
                selector.reset();
              }
            }
            break;
          }
          case "UPDATE_SELECTED_ELEMENTS": {
            if (!Array.isArray(data.payload)) {
              console.error("Invalid payload for UPDATE_SELECTED_ELEMENTS");
              return;
            }
            document.querySelectorAll(`[${v.SELECTED_ATTR}], [${v.HOVERED_ATTR}]`).forEach((el) => {
              el.removeAttribute(v.SELECTED_ATTR);
              el.removeAttribute(v.HOVERED_ATTR);
              el.removeAttribute("data-full-width");
            });
            data.payload.forEach((item) => {
              if (!item?.filePath || !item?.lineNumber) {
                console.error("Invalid element data:", item);
                return;
              }
              getElementsByInfo({ filePath: item.filePath, lineNumber: item.lineNumber, col: item.col }).forEach((el) => {
                el.setAttribute(v.SELECTED_ATTR, "true");
                if (Math.abs(el.getBoundingClientRect().width - window.innerWidth) < 5) {
                  el.setAttribute("data-full-width", "true");
                }
              });
            });
            break;
          }
          case "GET_SELECTOR_STATE": {
            postMessageToParent({ type: "SELECTOR_STATE_RESPONSE", payload: { isActive: selector.isActive } });
            break;
          }
          case "SET_ELEMENT_CONTENT": {
            const { id, content } = data.payload;
            getElementsByInfo({ filePath: id.path, lineNumber: id.line }).forEach((el) => {
              el.innerHTML = content;
            });
            break;
          }
          case "SET_ELEMENT_ATTRS": {
            const { id, attrs } = data.payload;
            getElementsByInfo({ filePath: id.path, lineNumber: id.line }).forEach((el) => {
              Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]));
            });
            break;
          }
          case "DUPLICATE_ELEMENT_REQUESTED": {
            const { id } = data.payload;
            getElementsByInfo({ filePath: id.path, lineNumber: id.line }).forEach((el) => {
              const clone = el.cloneNode(true);
              clone.setAttribute("data-lov-id", "x");
              clone.setAttribute("data-lov-tmp", "true");
              el.parentElement?.appendChild(clone);
            });
            break;
          }
          case "SET_STYLESHEET": {
            const { stylesheet } = data.payload;
            let styleElement = document.getElementById(v.OVERRIDE_STYLESHEET_ID);
            if (styleElement) {
              styleElement.innerHTML = stylesheet;
            } else {
              const head = document.getElementsByTagName("head")[0];
              styleElement = document.createElement("style");
              styleElement.id = v.OVERRIDE_STYLESHEET_ID;
              styleElement.innerHTML = stylesheet;
              head.appendChild(styleElement);
            }
            break;
          }
          case "EDIT_TEXT_REQUESTED": {
            const { id } = data.payload;
            getElementsByInfo({ filePath: id.path, lineNumber: id.line }).forEach((el) => {
              if (!(el instanceof HTMLElement)) return;
              el.setAttribute("contenteditable", "true");
              el.focus();
              const handleInput = () => {
                postMessageToParent({
                  type: "ELEMENT_TEXT_UPDATED",
                  payload: { id, content: el.innerText },
                });
              };
              const handleBlur = () => {
                el.removeAttribute("contenteditable");
                el.removeEventListener("input", handleInput);
                el.removeEventListener("blur", handleBlur);
              };
              el.addEventListener("input", handleInput);
              el.addEventListener("blur", handleBlur);
            });
            break;
          }
          case "HOVER_ELEMENT_REQUESTED": {
            const { id } = data.payload;
            document.querySelectorAll(`[${v.HOVERED_ATTR}]`).forEach((el) => el.removeAttribute(v.HOVERED_ATTR));
            getElementsByInfo({ filePath: id.path, lineNumber: id.line }).forEach((el) => {
              el.setAttribute(v.HOVERED_ATTR, "true");
            });
            break;
          }
          case "UNHOVER_ELEMENT_REQUESTED": {
            const { id } = data.payload;
            getElementsByInfo({ filePath: id.path, lineNumber: id.line }).forEach((el) => {
              el.removeAttribute(v.HOVERED_ATTR);
            });
            break;
          }
          case "GET_PARENT_ELEMENT": {
            const { id } = data.payload;
            const parent = getElementsByInfo({ filePath: id.path, lineNumber: id.line })[0].parentElement;
            if (!parent || parent.id === "root" || ["HTML", "BODY"].includes(parent.tagName)) {
              postMessageToParent({ type: "PARENT_ELEMENT", payload: null });
            } else {
              postMessageToParent({ type: "PARENT_ELEMENT", payload: getElementData(parent) });
            }
            break;
          }
          case "REQUEST_COMPONENT_TREE": {
            sendComponentTree();
            break;
          }
          default:
            console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error handling message:", error);
        removeEventListeners();
        selector.reset();
      }
    };

      // Initialize
      (() => {
        try {
          initTooltip();
          window.addEventListener("message", handleMessage);
          // handleMessage({ origin: "http://localhost:3000", data: { type: "TOGGLE_SELECTOR", payload: true, isActive: true } });
          document.addEventListener("mousemove", trackMousePosition);
          postMessageToParent({
            type: "SELECTOR_SCRIPT_LOADED",
            payload: { version: window.LOV_SELECTOR_SCRIPT_VERSION },
          });
          waitForRootChildren().then(() => requestInitialState());
        } catch (error) {
          console.error("Failed to initialize selector script:", error);
        }
      })();

  };
  
  // Scroll Position Tracker
  const trackScrollPosition = () => {
    let isTracking = false;
    const sendScrollPosition = () => {
      postMessageToParent({
        type: "SCROLL_POSITION",
        payload: {
          scrollY: window.scrollY,
          scrollHeight: document.documentElement.scrollHeight,
          clientHeight: window.innerHeight,
          timestamp: Date.now(),
        },
      });
      isTracking = false;
    };
    const handleScroll = () => {
      if (!isTracking) {
        requestAnimationFrame(sendScrollPosition);
        isTracking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
  };
  
  // Scrollable State Tracker
  const trackScrollableState = () => {
    let isScrollableSent = false;
    const isScrollable = () => document.documentElement.scrollHeight > document.documentElement.clientHeight;
    const sendScrollableState = () => {
      if (!isScrollableSent && isScrollable()) {
        isScrollableSent = true;
        postMessageToParent({ type: "SCROLLABLE" });
      }
    };
    sendScrollableState();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", sendScrollableState);
    }
    window.addEventListener("load", sendScrollableState);
    setTimeout(sendScrollableState, 500);
  };
  
  // Main Initialization
  const init = () => {
    if (window.location.search.includes("lov-override-script")) {
      const scriptUrl = "http://localhost:8080/genfly.js";
      console.log("Overriding lovable.js script with:", scriptUrl);
      const script = document.createElement("script");
      script.type = "module";
      script.src = scriptUrl;
      document.body.appendChild(script);
      return;
    }
    // if (window.top === window.self) return;
    trackUrlChanges();
    handleNavigationMessages();
    trackScrollPosition();
    trackScrollableState();
    handleErrors();
    // interceptConsole();
    initializeSelector();

    window.addEventListener('error', (event) => {
      window.parent.postMessage({
          message: event.message,
          error: event.error
      }, '*')
    });

    console.error = new Proxy(console.error, {
      apply: function(target, thisArg, args) {
        window.parent.postMessage({
          message: args,
          error: args
        }, '*')
        return target.apply(thisArg, args);
      }
    });
  };
  
  init();