import { File, Path, Executor } from "rech-editor-cobol";
import * as path from "path";
import { Notification } from "./Notification";

/** packages names */
const COBOL_PACKAGE = "Rech-Editor-Cobol";
const INTERNAL_PACKAGE = "Rech-Editor-Internal";
const BATCH_PACKAGE = "Rech-Editor-Batch";

export class UpdateNotification {


  /** Pending updates */
  private static pendingUpdates: string[] = [];

  /**
   * Check if has updates and informs the user
   */
  public static showUpdateMessageIfNeed() {
    this.showUpdateMessage(this.getLocalCobolPackageVersion(), this.getCobolPackageOnNetworkVersion(), COBOL_PACKAGE)
    .then((selectedOption) => {
      if (selectedOption === "Update") {
        UpdateNotification.pendingUpdates.push(COBOL_PACKAGE);
        new Executor().runAsyncOutputChannel("update", "cmd /c VscodeUpdate.bat -package rech-editor-cobol -rede -new", () => {
          UpdateNotification.pendingUpdates.splice(UpdateNotification.pendingUpdates.indexOf(COBOL_PACKAGE), 1);
          this.showReloadMessage();
        });
      }
    }).catch(() => {});
    this.showUpdateMessage(this.getLocalInternalPackageVersion(), this.getInternalPackageOnNetworkVersion(), INTERNAL_PACKAGE)
    .then((selectedOption) => {
      if (selectedOption === "Update") {
        UpdateNotification.pendingUpdates.push(INTERNAL_PACKAGE);
        new Executor().runAsyncOutputChannel("update", "cmd /c VscodeUpdate.bat -package rech-editor-internal -rede -new", () => {
          UpdateNotification.pendingUpdates.splice(UpdateNotification.pendingUpdates.indexOf(INTERNAL_PACKAGE), 1);
          this.showReloadMessage();
        });
      }
    }).catch(() => {});
    this.showUpdateMessage(this.getLocalBatchPackageVersion(), this.getBatchPackageOnNetworkVersion(), BATCH_PACKAGE)
    .then((selectedOption) => {
      if (selectedOption === "Update") {
        UpdateNotification.pendingUpdates.push(BATCH_PACKAGE);
        new Executor().runAsyncOutputChannel("update", "cmd /c VscodeUpdate.bat -package rech-editor-batch -rede -new", () => {
          UpdateNotification.pendingUpdates.splice(UpdateNotification.pendingUpdates.indexOf(BATCH_PACKAGE), 1);
          this.showReloadMessage();
        });
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
   * Show message to reload the editor
   *
   * @param packageName
   */
  private static showReloadMessage() {
    if (this.hasPendingUpdates()) {
      return;
    }
    new Notification("Restart the editor to consider the updates!")
    .show();
  }

  /**
   * Returns true if has any pending update
   */
  private static hasPendingUpdates() {
    return UpdateNotification.pendingUpdates.length > 0;
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