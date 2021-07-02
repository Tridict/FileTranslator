// 来自luke

const readFileAsText = (fileWrap, options={}) => {
	const file = fileWrap.obj;
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			resolve(reader);
		};
		reader.onerror = reject;

		if (options.accept && !new RegExp(options.accept).test(file.type)) {
			reject({
				code: 1,
				msg: "wrong file type",
			});
		}

		if (!file.type || /^text\//i.test(file.type)) {
			reader.readAsText(file, fileWrap.encoding);
		} else {
			reader.readAsDataURL(file);
		}
	});
};

async function getFileContent(file, options) {
	const reader = await readFileAsText(file, options);
	file.content = reader.result;
	file.read = true;
}

export default getFileContent;
