import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = (idDesiredLength: number): string => {
  const getRandomCharFromAlphabet = (alphabet: string): string => {
    return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  };

  return Array.from({ length: idDesiredLength })
    .map(() => {
      return getRandomCharFromAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
    })
    .join("");
};
