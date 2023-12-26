import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

function usePersistedState<T>(defaultValue: T, key: string): PersistedState<T> {
  const [value, setValue] = useState<T>(defaultValue as T);
  const [first, setFirst] = useState<boolean>(true);

  useEffect(() => {
    if (first) {
      const value = window.localStorage.getItem(key);
      if (value) {
        const valueObj = JSON.parse(value)
        valueObj.init = true;
        setValue(valueObj);
      }
      setFirst(false);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, first]);

  return [value, setValue];
}

export { usePersistedState };
