const personalResponse = (name: string, index: number | string, error: boolean, errorText: string) => {
  return {
    type: 'reg',
    data: JSON.stringify({
      name,
      index,
      error,
      errorText
    }),
    id: 0
  };
}

export default personalResponse;