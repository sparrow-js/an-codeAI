import { ContextProviderProps, ContextProviderValue } from "@/types/context";
import { createContext, useEffect, useState } from "react";

import { User } from "@/types/user";
import toast from "react-hot-toast";


export const AppContext = createContext({} as ContextProviderValue);

export const AppContextProvider = ({ children }: ContextProviderProps) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const fetchUserInfo = async function () {
    try {
      const uri = "/api/get-user-info";
      const params = {};

      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });

      if (resp.ok) {
        const res = await resp.json();
        if (res.userInfo) {
          setUser(res.userInfo);
          return;
        }
      }

      setUser(null);
    } catch (e) {
      setUser(null);

      console.log("get user info failed: ", e);
      toast.error("get user info failed");
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <AppContext.Provider value={{ user, fetchUserInfo }}>
      {children}
    </AppContext.Provider>
  );
};
