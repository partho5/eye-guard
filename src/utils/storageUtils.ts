/**
 * Converts a value from Chrome storage to a boolean.
 * @param value The value to be converted.
 * @returns {boolean} The converted boolean value.
 */
export const parseBoolean = (value: any): boolean => {
  return value === 'true' || value === true;
};