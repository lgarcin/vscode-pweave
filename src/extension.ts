'use strict';

import * as vscode from 'vscode';
import cp = require('child_process');
import path = require('path');
import os = require('os');

var channel = null;

const fullRange = (doc: vscode.TextDocument) => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));

export class OperatingSystem {
	public name: string;
	public file_ext: string;
	public checker: string;
	constructor(name: string, file_ext: string, checker: string) {
		this.name = name;
		this.file_ext = file_ext;
		this.checker = checker;
	}
}
const windows: OperatingSystem = new OperatingSystem('win32', '.exe', 'where');
const linux: OperatingSystem = new OperatingSystem('linux', '.pl', 'which');
const mac: OperatingSystem = new OperatingSystem('darwin', '.pl', 'which');

export class LaTexFormatter {
	private machine_os: string;
	private current_os!: OperatingSystem;
	private formatter: string;
	constructor() {
		this.machine_os = os.platform();
		console.log(this.machine_os);
		this.formatter = 'latexindent';
	}
	public formatDocument(document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
		return new Promise((resolve, reject) => {
			let formatter = 'latexindent';
			let filename = document.fileName;

			if (this.machine_os === windows.name) {
				this.current_os = windows;
			} else if (this.machine_os === linux.name) {
				this.current_os = linux;
			} else if (this.machine_os === mac.name) {
				this.current_os = mac;
			}

			this.checkPath(this.current_os.checker).then((res) => {
				if (!res) {
					showErrorMessage('Can not find latexindent in PATH!');
					return reject(new Error('Can not find latexindent in PATH!'));
				}
				this.format(filename, document).then((res) => {
					return resolve(res);
				});

			});
		});
	}
	private checkPath(checker: string): Thenable<boolean> {
		return new Promise((resolve, reject) => {
			cp.exec(checker + ' ' + this.formatter, (err, stdout, stderr) => {
				if (stdout === '') {
					this.formatter += this.current_os.file_ext;
					this.checkPath(checker).then((res) => {
						if (res) { resolve(true); }
						else { resolve(false); }
					});
				}
				resolve(true);
			});
		});
	}
	private format(filename: string, document: vscode.TextDocument): Thenable<vscode.TextEdit[]> {
		return new Promise((resolve, reject) => {
			cp.exec(this.formatter + ' "' + filename + '"', (err, stdout, stderr) => {
				if (stdout !== '') {
					var edit = [vscode.TextEdit.replace(fullRange(document), stdout)];
					return resolve(edit);
				}
				return reject(new Error('Empty output'));
			});
		});

	}
}

function showErrorMessage(msg: string) {
	vscode.window.showErrorMessage(msg);
}

class LaTexDocumentRangeFormatter implements vscode.DocumentFormattingEditProvider {
	private formatter: LaTexFormatter;

	constructor() {
		this.formatter = new LaTexFormatter();
	}
	public async provideDocumentFormattingEdits(
		document: vscode.TextDocument,
		options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]> {
		await document.save();
		return this.formatter.formatDocument(document);
	}
}

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.languages.registerDocumentFormattingEditProvider('pweave_tex', {
			provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
				let fullText = document.getText();
				let toto = fullText.replace(/(<<.*?>>=)(.*?)(@)/gms, (_, openingTag, code, closingTag) => {
					let a = cp.execSync('autopep8 -', {
						input: code
					});
					return "\\begin{noweb}\n" + openingTag + a + closingTag + "\n\\end{noweb}";
				});
				let titi = cp.execSync('latexindent -y="verbatimEnvironments:noweb:1', {
					input: toto
				}).toString();
				let tutu = titi.toString().replace(/\h*\\begin{noweb}\h*|\h*\\end{noweb}\h*/g, "");
				return [vscode.TextEdit.replace(fullRange(document), tutu)];
			}
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-pweave.build', () => {
			console.log('toto');
		})
	);
}

export function deactivate() { }
