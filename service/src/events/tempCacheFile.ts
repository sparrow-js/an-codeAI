import * as WebSocket from 'ws';

export const TempCacheFile = new Map();

export function cacheFileChunk(
  data: {
    hash: string;
    id: string;
    content: string;
  },
  ws: WebSocket,
) {
  if (!TempCacheFile.has(data.hash)) {
    TempCacheFile.set(data.hash, {});
  }

  const curFile = TempCacheFile.get(data.hash);
  curFile[data.id] = data.content;

  ws.send(
    JSON.stringify({
      type: 'uploadFile',
      hash: data.hash,
      id: data.id,
    }),
  );
}

export function mergeFile(hash: string, ws: WebSocket) {
  const file = TempCacheFile.get(hash);
  if (file) {
    let fileFull = '';
    Object.keys(file).forEach((item, index) => {
      const chunkContent = file[`${hash}_${index}`];
      if (chunkContent) {
        fileFull += chunkContent;
      }
    });
    ws.send(
      JSON.stringify({
        type: 'mergeUploadFile',
        hash: hash,
      }),
    );
    TempCacheFile.set(hash, {
      full: fileFull,
    });
  }
}
