'use strict';

import * as vscode from 'vscode';
import cp = require('child_process');
import path = require('path');
import os = require('os');

const fullRange = (doc: vscode.TextDocument) => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));

function getCommand(cmd: string): Promise<string> {
	const configuration = vscode.workspace.getConfiguration('vscode-pweave');
	const command = <string>configuration.get(cmd + 'Path');
	return new Promise((resolve, reject) => {
		if (command === null || command === undefined) {
			reject(new Error(cmd + ' not defined in config'));
		} else {
			let checkCommand: string = "";
			switch (os.platform()) {
				case "win32": checkCommand = 'where ' + command;
					break;
				case "linux":
				case "darwin":
					checkCommand = 'which ' + command;

			}
			cp.exec(checkCommand, (error, stdout, stderr) => {
				if (stdout !== "") {
					resolve(command);
				}
				else {
					reject(new Error(cmd + ' not defined in path'));
				}
			});
		}
	});
}

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.languages.registerDocumentFormattingEditProvider('pweave_tex', {
			async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
				const fullText = document.getText();
				const autopep8Command = await getCommand('autopep8');
				let nowebReplace = fullText.replace(/(<<.*?>>=)(.*?)(@)/gms, (_, openingTag, code, closingTag) => {
					let formattedPython = cp.execSync(autopep8Command + ' -', {
						input: code
					}).toString();
					return "\\begin{noweb}\n" + openingTag + formattedPython + closingTag + "\n\\end{noweb}";
				});
				console.log(nowebReplace);
				const latexindentCommand = await getCommand('latexindent');
				let indentedDocument = cp.execSync(latexindentCommand + ' -y="verbatimEnvironments:noweb:1', {
					input: nowebReplace
				}).toString();
				console.log('----------------------------------------');
				console.log(indentedDocument);
				let finalDocument = indentedDocument.replace(/^\s*\\begin{noweb}.*?(<<.*?>>=.*?@).*?\\end{noweb}\h*$/gms, (_, code) => code);
				return [vscode.TextEdit.replace(fullRange(document), finalDocument)];
			}
		}));
	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-pweave.build', async () => {
			if (vscode.window.activeTextEditor) {
				const currentDocument = vscode.window.activeTextEditor.document;
				const file = currentDocument.uri.fsPath;
				const outFile = path.join(path.dirname(file), path.basename(file, path.extname(file)) + '.tex');
				const command = await getCommand('pweave');
				cp.exec(command + ' ' + currentDocument.uri.fsPath + ' -f texminted -o ' + outFile);
			}
		})
	);
}

export function deactivate() { }
