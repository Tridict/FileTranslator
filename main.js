import readFile from "./modules/fileReader.js";
import baiduTrans from "./modules/request/index.js";
import pushAlert from "./modules/alert.js";
import { splitFile } from "./modules/utils.js";

const RootComponent = {
	data() {
		return {
			appName: "trans",
			appid: "",
			key: "",
			from: "auto",
			to: "zh",
			files: [],
			savedFields: ["appid", "key"],
		};
	},

	computed: {},

	methods: {
		getDownloadLink(txt) {
			return "data:text/paint; utf-8," + encodeURIComponent(txt);
		},
		onImportFiles() {
			// 把文件保存为对象
			const fileList = this.$refs.fileInput.files;
			for (const file of fileList) {
				if (this.files.map((f) => f.name).includes(file.name)) {
					pushAlert(`文件【${file.name}】重复。`);
				} else {
					// 用一个对象保存文件的meta信息
					this.files.push({
						obj: file,
						name: file.name,
						read: false,
						encodingGot: false,
						encoding: "utf-8",
					});
				}
			}
			// 读取文件内容
			for (const file of this.files) {
				if (file.read) continue;
				readFile(file).catch(({ error }) => {
					pushAlert(`${error}`, "warning", 5000);
				});
			}
		},
		onRemoveFile(idx) {
			this.files.splice(idx, 1);
		},
		async onTranslate(file) {
			if (!file.content) return;
			const arr = [];
			for (const batch of splitFile(file.content)) {
				arr.push(await this.translateBatch(batch));
			}
			file.result = arr.join("\n");
		},
		async translateBatch(query) {
			if (!query) return [];
			const result = [];
			let response = await baiduTrans({
				appid: this.appid,
				key: this.key,
				query,
				from: this.from,
				to: this.to,
			});
			while (response.length) {
				result.push(response.shift().dst);
			}
			return result.join("\n");
		},

		readDataFromStorage() {
			for (const field of this.savedFields) {
				const it = store.get(`${this.appName}:${field}`);
				if (it) {
					this[field] = it;
				}
			}
		},
		saveDataToStorage() {
			for (const field of this.savedFields) {
				store.set(`${this.appName}:${field}`, this[field]);
			}
		},
	},

	updated() {
		this.saveDataToStorage();
	},

	mounted() {
		this.readDataFromStorage();
	},
};

Vue.createApp(RootComponent).mount("#app");