'use strict';

import * as vscode from 'vscode';
import cp = require('child_process');
import path = require('path');
import { parse } from './magic_comments';
import { getCommand } from './command_line';


const OUTPUT_FORMATS = ['tex', 'texminted', 'texpygments'];

const fullRange = (doc: vscode.TextDocument) => doc.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentFormattingEditProvider('pweave_tex', {
			async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
				const fullText = document.getText();
				const autopep8Command = await getCommand('autopep8');
				// let nowebReplace = fullText.replace(/(<<.*?>>=)(.*?)(@)/gms, (_, openingTag, code, closingTag) => {
				let nowebReplace = fullText.replace(/(<<[^<>]*>>=)(.*?)(@)/gms, (_, openingTag, code, closingTag) => {
					let formattedPython = cp.execSync(autopep8Command + ' -', {
						input: code
					}).toString();
					return "\\begin{noweb}\n" + openingTag + formattedPython + closingTag + "\n\\end{noweb}";
				});
				const latexindentCommand = await getCommand('latexindent');
				let indentedDocument = cp.execSync(latexindentCommand + ' -y="verbatimEnvironments:noweb:1', {
					input: nowebReplace
				}).toString();
				let finalDocument = indentedDocument.replace(/^\s*\\begin{noweb}.*?(<<.*?>>=.*?@).*?\\end{noweb}\h*$/gms, (_, code) => code);
				return [vscode.TextEdit.replace(fullRange(document), finalDocument)];
			}
		}));

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('vscode-pweave.build', async () => {
			if (vscode.window.activeTextEditor) {
				const currentDocument = vscode.window.activeTextEditor.document;
				const file = currentDocument.uri.fsPath;
				const outFile = path.join(path.dirname(file), path.basename(file, path.extname(file)) + '.tex');
				const pweaveCommand = await getCommand('pweave');
				const magic_comments = parse(currentDocument.getText());
				const pweaveOutputFormat = magic_comments.get('pweaveOutputFormat');
				let texOuputFormat = "";
				if (pweaveOutputFormat !== undefined && OUTPUT_FORMATS.includes(pweaveOutputFormat)) {
					texOuputFormat = ' -f ' + pweaveOutputFormat;
				}
				cp.exec(pweaveCommand + ' ' + currentDocument.uri.fsPath + texOuputFormat + ' -o ' + outFile);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('vscode-pweave.show', async () => {
			if (vscode.window.activeTextEditor) {
				const currentDocument = vscode.window.activeTextEditor.document;
				const file = currentDocument.uri.fsPath;
				const outFile = path.join(path.dirname(file), path.basename(file, path.extname(file)) + '.tex');
				vscode.window.showTextDocument(vscode.Uri.file(outFile), {
					viewColumn: vscode.ViewColumn.Beside
				});
			}
		})
	);
}

// TODO Add command to open tex file

export function deactivate() { }
