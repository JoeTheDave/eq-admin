export default (request: Request) => {
  const url = new URL(request.url);

  const getValue = (term: string) => {
    return (url.searchParams.get(term) || '').toLowerCase();
  };

  const getValues = (term: string) => {
    const value = getValue(term);
    return value ? value.split('|') : [];
  };
  return {
    getValue,
    getValues,
  };
};
