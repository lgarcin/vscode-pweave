import os = require('os');
import * as vscode from 'vscode';
import cp = require('child_process');

export function getCommand(cmd: string): Promise<string> {
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

