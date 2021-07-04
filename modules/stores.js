const appName = "trans";

function serialize(obj) {
  return JSON.stringify(obj)
}

function deserialize(str, defaultVal) {
  if(!str) return defaultVal;
  let val = '';
  try {
    val = JSON.parse(str);
  }
  catch(e) {
    val = str;
  }
  return (val || defaultVal);
}

function localStorageWrite(key, value, isSave = true) {
	if (isSave && value) {
		store.set(`${appName}:${key}`, value);
		// console.log(`存储成功！值为${localStorageRead(key)}`);
	}
}

function localStorageRead(key) {
	return store.get(`${appName}:${key}`);
}

function sessionStorageWrite(key, value) {
	if (value) {
		sessionStorage.setItem(`${appName}:${key}`, serialize(value));
	}
}

function sessionStorageRead(key) {
	return deserialize(sessionStorage.getItem(`${appName}:${key}`));
}

function readAll(key) {
	return localStorageRead(key) || sessionStorageRead(key);
}

export default {
	setLocal: localStorageWrite,
	getLocal: localStorageRead,
	setSession: sessionStorageWrite,
	getSession: sessionStorageRead,
	get: readAll,
};
