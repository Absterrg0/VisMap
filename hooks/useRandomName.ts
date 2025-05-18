
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { useCallback } from 'react';

export const useRandomName = () => {
  const generateName = useCallback(() => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      style: 'lowerCase',
    });
  }, []);

  return generateName;
};

