export const MOCK_NEXT_GENERATED_UIDS: { current: string[] } = { current: [] };
export const MOCK_NEXT_GENERATED_UIDS_IDX = { current: 0 };

export function generateMockNextGeneratedUID(): string | null {
  if (
    MOCK_NEXT_GENERATED_UIDS.current.length > 0 &&
    MOCK_NEXT_GENERATED_UIDS_IDX.current < MOCK_NEXT_GENERATED_UIDS.current.length
  ) {
    const nextID = MOCK_NEXT_GENERATED_UIDS.current[MOCK_NEXT_GENERATED_UIDS_IDX.current];
    MOCK_NEXT_GENERATED_UIDS_IDX.current += 1;
    return nextID;
  } else {
    return null;
  }
}

export const atoz = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
];

export function generateConsistentUID(
    possibleStartingValue: string,
    ...existingIDSets: Array<Set<string>>
): string {
    function alreadyExistingID(idToCheck: string): boolean {
        return existingIDSets.some((s) => s.has(idToCheck));
    }
    const mockUID = generateMockNextGeneratedUID();
    if (mockUID == null) {
        if (possibleStartingValue.length >= 3) {
            const maxSteps = Math.floor(possibleStartingValue.length / 3);
            for (let step = 0; step < maxSteps; step++) {
              const possibleUID = possibleStartingValue.substring(step * 3, (step + 1) * 3);

              if (!alreadyExistingID(possibleUID)) {
                return possibleUID;
              }
            }
        }

        for (let firstChar of atoz) {
            for (let secondChar of atoz) {
              for (let thirdChar of atoz) {
                const possibleUID = `${firstChar}${secondChar}${thirdChar}`;

                if (!alreadyExistingID(possibleUID)) {
                  return possibleUID;
                }
              }
            }
        }
        throw new Error(`Unable to generate a UID from '${possibleStartingValue}'.`);
    } else {
        return mockUID;
    }
}