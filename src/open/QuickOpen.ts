'use babel';
import { window, QuickPick, QuickPickItem } from "vscode";
import { Executor, File, Editor } from "rech-editor-cobol";

const BEGIN_OF_DIR = "F:\\SIGER\\";

/**
 * Quick open files
 */
export class QuickOpen {

	/** Version from SIGER */
	private version: string;
	/** Package to open */
	private package: string;
	/** QuickPick from windows */
	private static quickPick: QuickPick<QuickPickItem>;
	/** Cache do output do vs.bat */
	private static vsCache: string;

	constructor(version: string, _package: string) {
		this.version = version;
		this.package = _package;
	}

	/**
	 * Build a QuickOpen
	 */
	public static build(): Promise<QuickOpen> {
		return new Promise((resolve, reject) => {
			this.acceptVersion().then((version) => {
				this.acceptPackage(version.description!).then((_package) => {
					resolve(new QuickOpen(version.description!, _package));
				}).catch(() => {
					reject();
				});
			}).catch(() => {
				reject();
			});
		})
	}

	/**
	 * Accept the package in the version directory
	 *
	 * @param version
	 */
	private static acceptPackage(version: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.quickPick = window.createQuickPick();
			this.quickPick.title = "Pacote"
			this.quickPick.items = this.createPackages(version);
			this.quickPick.activeItems = [];
			this.quickPick.onDidChangeSelection((selection) => {
				resolve(selection[0].label);
				this.quickPick.dispose();
			});
			this.quickPick.onDidHide(() => {
				reject();
				this.quickPick.dispose();
			});
			this.quickPick.ignoreFocusOut = true;
			this.quickPick.show();
		});

	}

	/**
	 * Create the package items
	 *
	 * @param version
	 */
	private static createPackages(version: string) {
		const items = new Array<QuickPickItem>();
		const dir = new File(BEGIN_OF_DIR + version);
		dir.dirFiles().forEach((file) => {
			items.push({
				label: file
			})
		})
		return items;
	}

	/**
	 * Accept the Siger package directory
	 */
	private static acceptVersion(): Promise<QuickPickItem> {
		return new Promise((resolve, reject) => {
			this.quickPick = window.createQuickPick();
			this.quickPick.title = "Versão"
			this.quickPick.matchOnDescription = true;
			this.quickPick.matchOnDetail = true;
			this.parserVersion().then((items) => {
				this.quickPick.items = items;
				this.quickPick.activeItems = [];
				this.quickPick.onDidChangeSelection((selection) => {
					resolve(selection[0]);
					this.quickPick.dispose();
				});
				this.quickPick.onDidHide(() => {
					reject();
					this.quickPick.dispose();
				});
				this.quickPick.ignoreFocusOut = true;
				this.quickPick.show();
			}).catch(() => {
				reject();
			})
		})
	}

	/**
	 * Parser the package versions and build the items
	 */
	private static parserVersion(): Promise<Array<QuickPickItem>> {
		return new Promise((resolve, reject) => {
			if (QuickOpen.vsCache) {
				this.parserOutput(QuickOpen.vsCache).then((result) => {
					resolve(result);
				}).catch(() => {
					reject();
				})
			} else {
				new Executor().runAsync("F:\\bat\\vs.bat", (process) => {
					QuickOpen.vsCache = process.getStdout();
					this.parserOutput(process.getStdout()).then((result) => {
						resolve(result);
					}).catch(() => {
						reject();
					});
				});
			}
		});
	}

	private static parserOutput(vs: string): Promise<Array<QuickPickItem>> {
		return new Promise((resolve, reject) => {
			const items = new Array<QuickPickItem>();
			const lines = vs.split("\n");
			lines.forEach((line) => {
				const versionPosition = 1;
				const aliasPosition = 2;
				const match = line.match(/(\d\d\.\d\d\w).+(ALF|DES|BET|OFI|OLD|EST)/)
				if (match) {
					items.push({
						label: match[aliasPosition],
						description: match[versionPosition]
					});
				}
			});
			if (items.length > 0) {
				resolve(items);
			} else {
				reject();
			}
		});
	}

	/**
	 * Show the open Dialog
	 */
	public showOpenDialog() {
		const dir = BEGIN_OF_DIR + this.version + "\\" + this.package;
		const editor = new Editor();
		editor.showOpenDialog(
			dir,
			(file) => { editor.openFileInsensitive(file); },
		);
	}

}
