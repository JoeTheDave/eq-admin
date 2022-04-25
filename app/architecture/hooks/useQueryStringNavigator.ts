import { useSearchParams } from '@remix-run/react';

export default () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getValue = (term: string) => {
    return (searchParams.get(term) || '').toLowerCase();
  };

  const getValues = (term: string) => {
    const value = getValue(term);
    return value ? value.split('|') : [];
  };

  const toggleValue = (term: string, value: string) => {
    const values = getValues(term);
    const newValue = (
      values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value]
    ).join('|');
    if (newValue) {
      searchParams.set(term, newValue);
    } else {
      searchParams.delete(term);
    }
    setSearchParams(searchParams);
  };

  return {
    getValue,
    getValues,
    toggleValue,
  };
};
