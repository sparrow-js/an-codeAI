"use strict";
(() => {
  // src/http-patch/rewrite-url.ts
  var REGEX = new RegExp("(?<id>\\w{5,6})-(?<port>\\d{1,5})\\.(?<hostname>.*)");
  var VM_IP = "192.168.241.2";
  function rewriteUrl(url, currentHostname) {
    const parsedUrl = new URL(url);
    if (!parsedUrl.port || Number(parsedUrl.port) < 1024) {
      return;
    }
    if (parsedUrl.hostname !== currentHostname && parsedUrl.hostname !== "localhost" && parsedUrl.hostname !== VM_IP) {
      return;
    }
    const currentMatch = currentHostname.match(REGEX);
    if (!(currentMatch == null ? void 0 : currentMatch.groups)) {
      return;
    }
    const { id, port, hostname } = currentMatch.groups;
    if (!id || !port || !hostname) {
      return;
    }
    parsedUrl.hostname = `${id}-${parsedUrl.port}.${hostname}`;
    parsedUrl.port = "";
    if (parsedUrl.protocol === "http:") {
      parsedUrl.protocol = "https:";
    } else if (parsedUrl.protocol === "ws:") {
      parsedUrl.protocol = "wss:";
    }
    return parsedUrl.toString();
  }

  // src/http-patch/sw.ts
  self.addEventListener("install", function() {
    self.skipWaiting();
  });
  self.addEventListener("activate", () => {
    return self.clients.claim();
  });
  self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.mode === "navigate" || location.hostname === "localhost") {
      return;
    }
    const newUrl = rewriteUrl(request.url, location.hostname);
    if (!newUrl) {
      return;
    }
    event.respondWith(
      (async () => {
        const reqInit = request;
        if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
          reqInit.body = await request.arrayBuffer();
        }
        return fetch(new Request(newUrl, reqInit));
      })()
    );
  });
})();
