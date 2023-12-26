import toast from "react-hot-toast";
import {request} from './lib/request';
import { map } from 'lodash';

const textDecoder = new TextDecoder('utf-8');
const ERROR_MESSAGE =
  "Error generating code. Check the Developer Console AND the backend logs for details. Feel free to open a Github issue.";

const STOP_MESSAGE = "Code generation stopped";

export interface CodeGenerationParams {
  generationType: "create" | "update";
  image: string;
  resultImage?: string;
  history?: string[];
  isChunk?: boolean;
  // isImageGenerationEnabled: boolean; // TODO: Merge with Settings type in types.ts
}

export function generateCode(
  wsRef: React.MutableRefObject<AbortController | null>,
  params: CodeGenerationParams,
  onChange: (chunk: string) => void,
  onSetCode: (code: string) => void,
  onStatusUpdate: (status: string) => void,
  onComplete: () => void
) {

  wsRef.current = new AbortController();

  async function handleMessage(event: { data: string }) {
      try {
          const response = JSON.parse(event.data);
          if (response.type === 'chunk') {
              onChange(response.value);
          } else if (response.type === 'status') {
              onStatusUpdate(response.value);
          } else if (response.type === 'setCode') {
              onSetCode(response.value);
          } else if (response.type === 'error') {
              console.error('Error generating code', response.value);
              toast.error(response.value);
          }
      } catch (e) {
          console.log(event);
      }
  }

  wsRef.current.signal.addEventListener('abort', () => {
      toast.success(STOP_MESSAGE);
      onComplete();
  });

  const handleError = (error: any) => {
      if (error.name === 'AbortError') {
          // 处理中止错误
          console.error('Fetch aborted:', error);
      } else {
          // 处理其他错误
          console.error('Fetch error:', error);
      }
      toast.error(ERROR_MESSAGE);
  };
  try {
    request
          .post(
              '/generateCode',
              {
                  event: 'generatecode',
                  data: params,
              },
              {
                  responseType: 'stream',
                  // signal: wsRef.current.signal,
                  fetch: (...args) => {
                      return fetch(...args);
                  },
              }
          )
          .then(data => {
              const reader = data.data.getReader();
              const push = () => {
                  // "done" is a Boolean and value a "Uint8Array"
                  reader.read().then(({ done, value }: { done: boolean; value: Uint8Array }) => {
                      // If there is no more data to read
                      if (done) {
                          console.log('done', done);
                          onComplete();
                          return;
                      }
                      // Get the data and send it to the browser via the controller
                      // Check chunks by logging to the console
                      map(textDecoder.decode(value).split('\n'), v => {
                          v &&
                              handleMessage({
                                  data: v,
                              });
                      });
                      push();
                  });
              };
              push();
          }, handleError)
          .catch(error => {
              if (error.name === 'AbortError') {
                  // 处理中止错误
                  console.error('Fetch aborted:', error);
              } else {
                  // 处理其他错误
                  console.error('Fetch error:', error);
              }
          });
  } catch (e) {}
}
