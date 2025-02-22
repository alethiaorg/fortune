export const encodeUri = (input: string): string => input.replace(/\//g, '%2F');

export const decodeUri = (input: string): string => input.replace(/%2F/g, '/');
