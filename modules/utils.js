const splitFile = (str, lan="en") => {
  // 输入：字符串；输出：分割后的数组
  // 最大长度 6000 bytes (2000 Hans)
  const maxLen = lan=="zh"?1900:5500;
  const dot = lan=="zh"?'。':'.';
  const minLen = maxLen * (2/3);
  const strArr = [];
  while(str.length > maxLen) {
    const slice = str.slice(0, maxLen);
    let idx = slice.lastIndexOf('\n');
    if (idx < minLen) {
      idx = slice.lastIndexOf(dot);
    }
    if (idx < minLen) {
      idx = maxLen;
    }
    strArr.push(slice.slice(0, idx));
    str = str.slice(idx);
  }
  if(str) {
    strArr.push(str);
  }
  return strArr;
}

const sleep = (delayTime) =>
	new Promise((resolve) => {
		setTimeout(resolve, delayTime);
	});

export {splitFile, sleep};