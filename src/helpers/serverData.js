export const handlerServerTypesStructure = (arr, type) => {
  const resultStruct = [];
  arr.map((serv) => {
    if (serv.type === type) {
      resultStruct.push({
        value: serv.location.name,
        label: serv.location.name,
      });
    }
  });
  return resultStruct;
};

export const handlerServerDnsStructure = (arr) => {
  const resultStruct = [{ value: "Custom", label: "Custom" }];
  arr.map((dnsItem) => {
    resultStruct.push({
      value: dnsItem.name,
      label: dnsItem.name,
    });
  });
  return resultStruct;
};
