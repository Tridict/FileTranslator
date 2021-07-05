import MD5 from "./md5.js";
import fetchJsonp from "./fetchJsonp.js";
import { sleep } from "../utils.js";

const requestUrl = "https://api.fanyi.baidu.com/api/trans/vip/translate";
// const requestUrl = "https://fanyi-api.baidu.com/api/trans/vip/translate";

const request = async (data) => {
	// 用location.search方式发送jsonp请求
	// 首先把data对象转为location.search的urlSearch
	const dataStr = [];
	for (const [key, value] of Object.entries(data)) {
		dataStr.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
	}
	const urlSearch = "?" + dataStr.join("&");

	// 使用fetchJsonp包发送jsonp请求
	const response = await fetchJsonp(requestUrl + urlSearch);
	return response.json();
};

async function baiduTrans({ appid, key, query, from, to }) {
	const salt = new Date().getTime();
	const str1 = appid + query + salt + key;
	const sign = MD5(str1);
	const data = {
		q: query,
		appid,
		salt,
		from,
		to,
		sign,
	};
	// 延迟1001ms再开始请求，避免请求限制...
	await sleep(1001);
	console.log(query.length);
	const result = await request(data, {
		timeout: 10000,
	});
	// console.log(result);
	if (!result.trans_result) {
		throw new Error(result.error_msg);
	}
	return result.trans_result;
}

export default baiduTrans;
