/**
 * Capitalizes the first letter of each word in a string.
 */
export function capitalizeSentence(string: string): string {
  return string
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
