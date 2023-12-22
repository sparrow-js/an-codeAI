console.log('maxFileUpload');
// chunk size
const SIZE = 150 * 1024;
export enum UPLOADFILE_STATUS {
    PENDING = 'pending',
    COMPLETE = 'complete'
}  

// 生成文件切片
function createFileChunk (fileStr: string, size = SIZE) {
    const fileChunkList = [];
    let cur = 0;
    const file = new Blob([fileStr])
    while (cur < file.size) {
      fileChunkList.push({ file: file.slice(cur, cur + size) });
      cur += size;
    }
    return fileChunkList;
}

const cacheFilesMap = new Map();


function request(ws: WebSocket, data: any) {
    return new Promise((resolve, reject) => {
        ws.send(JSON.stringify({
            event: 'uploadFile',
            data,
        }));
        if (!cacheFilesMap.has(data.hash)) {
            cacheFilesMap.set(data.hash, {});
        }

        const cur = cacheFilesMap.get(data.hash);

        if (data.prefix) {
            cur[data.prefix] = {
                resolve,
                reject,
            }
        } else {
            cur[data.id] = {
                status: UPLOADFILE_STATUS.PENDING,
                resolve,
                reject,
            }
        }
        cacheFilesMap.set(data.hash, cur);
    })
}

const wsCallback = async (event: MessageEvent) => {
    const response = JSON.parse(event.data);
    console.log(response);
    if (response.type === "uploadFile") {
        const cur = cacheFilesMap.get(response.hash);
        if (cur) {
            const curPromise = cur[response.id];
            curPromise && curPromise.resolve(response.id);
        }
    } else if (response.type === "mergeUploadFile") {
        const cur = cacheFilesMap.get(response.hash);
        cur["mergeUploadFile"].resolve(response.hash);
        cacheFilesMap.delete(response.hash);
    }
}

// 上传切片
export async function uploadChunks(ws: WebSocket, fileStr: string): Promise<string> {
    ws.addEventListener("message", wsCallback);
    const fileChunkList = createFileChunk(fileStr)
    const hash = await calculateHash(fileChunkList);
    const fileChunkStrList = await Promise.all(fileChunkList.map((curFile) => {
        return curFile.file.text()
    }))

    const requestList = fileChunkStrList.map((cur, index) => {
        return request(ws, {
            hash,
            id: `${hash}_${index}`,
            content: cur
        })
    })
    const res = await Promise.all(requestList);
    if (res.length === fileChunkList.length) {
        const res = await mergeRequest(ws, hash) as string;
        ws.removeEventListener("message", wsCallback);
        return res;
    }
    return ''
}

// 合并请求
function mergeRequest(ws: WebSocket, hash: string,) {
   return request(ws,{
        hash,
        prefix: 'mergeUploadFile',
        handler: 'mergeUploadFile',
   });
}


// 生成文件 hash（web-worker）
function calculateHash(fileChunkList: any[]): Promise<string> {
    return new Promise(resolve => {
        const worker = new Worker("/hash.js");
        worker.postMessage({ fileChunkList });
        worker.onmessage = e => {
            const { hash } = e.data;
            if (hash) {
                resolve(hash);
            }
        };
    });
}


