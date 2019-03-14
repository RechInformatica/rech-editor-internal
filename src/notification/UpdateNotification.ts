import { File, Path, Executor } from "rech-editor-cobol";
import { commands } from 'vscode';
import * as path from "path";
import { Notification } from "./Notification";

export class UpdateNotification {

  /**
   * Check if has updates and informs the user
   */
  public static showUpdateMessageIfNeed() {
    this.showUpdateMessage(this.getLocalCobolPackageVersion(), this.getCobolPackageOnNetworkVersion(), "Rech-Editor-Cobol")
    .then((selectedOption) => {
      if (selectedOption === "Update") {
        new Executor().runAsyncOutputChannel("update", "cmd /c VscodeUpdate.bat -package rech-editor-cobol -rede -new", () => {this.showReloadMessage();});
      }
    }).catch(() => {});
    this.showUpdateMessage(this.getLocalInternalPackageVersion(), this.getInternalPackageOnNetworkVersion(), "Rech-Editor-Internal")
    .then((selectedOption) => {
      if (selectedOption === "Update") {
        new Executor().runAsyncOutputChannel("update", "cmd /c VscodeUpdate.bat -package rech-editor-internal -rede -new", () => {this.showReloadMessage();});
      }
    }).catch(() => {});
    this.showUpdateMessage(this.getLocalBatchPackageVersion(), this.getBatchPackageOnNetworkVersion(), "Rech-Editor-Batch")
    .then((selectedOption) => {
      if (selectedOption === "Update") {
        new Executor().runAsyncOutputChannel("update", "cmd /c VscodeUpdate.bat -package rech-editor-batch -rede -new", () => {this.showReloadMessage();});
      }
    }).catch(() => {});
  }

  /**
   * Show the update message
   *
   * @param localVerion
   * @param onNetworkVersion
   * @param packageName
   */
  private static showUpdateMessage(localVerion: string, onNetworkVersion: string, packageName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (onNetworkVersion > localVerion) {
        new Notification(`There are updates to the ${packageName} package. Do you want to upgrade to version ${onNetworkVersion}?`)
        .addButton(`Update ${packageName}`)
        .addButton("Cancel")
        .show().then((selectedOption) => {
          resolve(selectedOption === `Update ${packageName}`? "Update" : "Cancel");
        }).catch(() => {
          reject();
        });
      } else {
        reject();
      }
    });
  }

  /**
   * Show the update message
   *
   * @param localVerion
   * @param onNetworkVersion
   * @param packageName
   */
  private static showReloadMessage() {
      new Notification(`Reload the editor to active the extension!`)
      .addButton("Ok")
      .show();
  }

  /**
   * Returns the version of teh local cobol package
   */
  private static getLocalCobolPackageVersion(): string {
    let json = new File(new Path(path.resolve(__dirname) + "/../../../rech-editor-cobol/package.json").fullPath()).loadBufferSync("UTF8");
    let version = this.getVersionOfPackageJson(json);
    return version;
  }

  /**
   * Returns the version of teh cobol package in the Network
   */
  private static getCobolPackageOnNetworkVersion(): string {
    let json = new File("F:/DIV/VSCode/extension/rech-editor-cobol/package.json").loadBufferSync("UTF8");
    let version = this.getVersionOfPackageJson(json);
    return version;
  }

  /**
   * Returns the version of teh local internal package
   */
  private static getLocalInternalPackageVersion(): string {
    let json = new File(new Path(path.resolve(__dirname) + "/../../package.json").fullPath()).loadBufferSync("UTF8");
    let version = this.getVersionOfPackageJson(json);
    return version;
  }

  /**
   * Returns the version of teh internal package in the Network
   */
  private static getInternalPackageOnNetworkVersion(): string {
    let json = new File("F:/DIV/VSCode/extension/rech-editor-internal/package.json").loadBufferSync("UTF8");
    let version = this.getVersionOfPackageJson(json);
    return version;
  }

  /**
   * Returns the version of teh local batch package
   */
  private static getLocalBatchPackageVersion(): string {
    let json = new File(new Path(path.resolve(__dirname) + "/../../../rech-editor-batch/package.json").fullPath()).loadBufferSync("UTF8");
    let version = this.getVersionOfPackageJson(json);
    return version;
  }

  /**
   * Returns the version of teh batch package in the Network
   */
  private static getBatchPackageOnNetworkVersion(): string {
    let json = new File("F:/DIV/VSCode/extension/rech-editor-batch/package.json").loadBufferSync("UTF8");
    let version = this.getVersionOfPackageJson(json);
    return version;
  }

  /**
   * Returns the version in the package json
   *
   * @param json
   */
  private static getVersionOfPackageJson(json: string): string {
    let objJson = JSON.parse(json);
    return objJson["version"];
  }

}