const getKeyName = (...args: string[]) => {
  return `url:${args.join(':')}`;
};

export const getUrlId = (id: string) => getKeyName('shortId', id);
