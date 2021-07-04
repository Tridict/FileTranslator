import readFile from "./modules/fileReader.js";
import baiduTrans from "./modules/request/index.js";
import pushAlert from "./modules/alert.js";
import { splitFile } from "./modules/utils.js";
import stores from "./modules/stores.js";

const RootComponent = {
	data() {
		return {
			appid: "",
			key: "",
			from: "auto",
			to: "zh",
			files: [],
			languages: [],
			savedFields: ["appid", "key"],
			tmpSaveFields: ["from", "to", "files"],
		};
	},

	methods: {
		initLanguages() {
			const languageMap = {
				en: "英语",
				zh: "中文",
				yue: "中文(粤语)",
				cht: "繁体中文",
				wyw: "中文(文言文)",
				de: "德语",
				jp: "日语",
				kor: "韩语",
				ara: "阿拉伯语",
				bul: "保加利亚语",
				cs: "捷克语",
				dan: "丹麦语",
				el: "希腊语",
				est: "爱沙尼亚语",
				fin: "芬兰语",
				fra: "法语",
				hu: "匈牙利语",
				it: "意大利语",
				nl: "荷兰语",
				pl: "波兰语",
				pt: "葡萄牙语",
				rom: "罗马尼亚语",
				ru: "俄语",
				slo: "斯洛文尼亚语",
				spa: "西班牙语",
				swe: "瑞典语",
				th: "泰语",
				vie: "越南语",
			};
			for (const [code, name] of Object.entries(languageMap)) {
				this.languages.push({ code, name });
			}
		},
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
					this.files.unshift({
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
			const result = [];
			const dst = [];
			for (const batch of splitFile(file.content)) {
				const x = await this.translateBatch(batch);
				result.push(x[0]);
				dst.push(x[1]);
			}
			file.dst = dst.join("\n");
			file.result = result.join("\n");
			alert("翻译完成！");
		},
		async translateBatch(query) {
			if (!query) return [];
			const result = [];
			const dst = [];
			let response = await baiduTrans({
				appid: this.appid,
				key: this.key,
				query,
				from: this.from,
				to: this.to,
			});
			while (response.length) {
				const x = response.shift();
				result.push([x.src, x.dst]);
				dst.push(x.dst);
			}
			return [result.flat().join("\n"), dst.join("\n")];
		},

		readDataFromStorage() {
			for (const field of [...this.savedFields, ...this.tmpSaveFields]) {
				this[field] = stores.get(field) || this[field];
			}
		},
		saveDataToStorage() {
			for (const field of this.savedFields) {
				stores.setLocal(field, this[field]);
			}
			for (const field of this.tmpSaveFields) {
				stores.setSession(field, this[field]);
			}
		},
	},

	updated() {
		this.saveDataToStorage();
	},

	mounted() {
		this.readDataFromStorage();
		this.initLanguages();
	},
};

Vue.createApp(RootComponent).mount("#app");
