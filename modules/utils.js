const splitFile = (str, lan="en") => {
  // 输入：字符串；输出：分割后的数组
  // 最大长度 6000 bytes (2000 Hans)
  const maxLen = lan=="zh"?1900:6000;
  const dot = lan=="zh"?'。':'. ';
  const minLen = maxLen * (4/5);
  const strArr = [];
  while(str.length > maxLen) {
    const slice = str.slice(0, maxLen);
    let idx = slice.lastIndexOf('\n');
    if (idx < minLen) {
      // console.log(`【换行符】太短了！（长度为${idx}）`);
      idx = slice.lastIndexOf(dot);
      // console.log(`找到最后的【${dot}】，长度为${idx}，前后内容为${slice.slice(idx-20, idx+20)}`);
    }
    if (idx < minLen) {
      // console.log("都太短了！"+idx)
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