import readFile from "./modules/fileReader.js";
import baiduTrans from "./modules/request/request.js";
import pushAlert from "./modules/alert.js";
import { splitFile, encode, decode } from "./modules/utils.js";
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
			canTranslate: true,
			canSwap: false,
			isDisplayBothLanguage: false,
			savedFields: ["appid", "key"],
			tmpSaveFields: ["from", "to", "files"],
		};
	},

	methods: {
		onCloneResult(){
			this.$refs.output.select(); // 选中output框的文本
			document.execCommand("copy");
		},
		onToggleResult(idx){
			this.isDisplayBothLanguage = !this.isDisplayBothLanguage;
			if (this.isDisplayBothLanguage) {
				this.files[idx].displayResult = this.files[idx].result;
			} else {
				this.files[idx].displayResult = this.files[idx].dst;
			}
		},
		getDownloadLink(txt) {
			return "data:text/paint; utf-8," + encodeURIComponent(txt);
		},
		onSwapLanguage(){
			if (this.canSwap) {
				[this.from, this.to] = [this.to, this.from];
			}
		},
		onImportFiles() {
			const fileList = this.$refs.fileInput.files;
			this.readFiles(fileList);
		},
		onDropFile(event) {
			event.preventDefault();

			if (event.type == "drop") {
				const fileList = event.dataTransfer.files;
				this.readFiles(fileList);
			}
		},
		onRemoveFile(idx) {
			this.files.splice(idx, 1);
		},
		readFiles(fileList) {
			// 把文件保存为对象
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
		async onTranslate(file) {
			if (!file.content) return;
			this.canTranslate = false;
			try {
				const result = [];
				const dst = [];
				for (const batch of splitFile(file.content)) {
					const x = await this.translateBatch(batch);
					result.push(x[0]);
					dst.push(x[1]);
				}
				file.dst = decode(dst.join("\n"));
				file.result = decode(result.join("\n"));
				file.displayResult = file.dst;
			} catch (error) {
				pushAlert(`${error}`, "warning", 5000);
			} finally {
				this.canTranslate = true;
			}
		},
		async translateBatch(query) {
			if (!query) return [];
			const result = [];
			const dst = [];
			const response = await baiduTrans({
				appid: this.appid,
				key: this.key,
				query: encode(query),
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
		if (this.from == "auto") {
			this.canSwap = false;
		} else {
			this.canSwap = true;
		}
	},

	mounted() {
		this.readDataFromStorage();
		this.initLanguages();
		const dropbox = this.$refs.dropTarget;
		dropbox.addEventListener("dragenter", this.onDropFile)
		dropbox.addEventListener("dragover", this.onDropFile)
		dropbox.addEventListener("drop", this.onDropFile)
	},
};

Vue.createApp(RootComponent).mount("#app");
