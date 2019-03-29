import { window } from 'vscode';

export class Notification {

  /** Message */
  private message: string;
  /** Buttons */
  private buttons: string[];
  /** Category of message */
  private category: "information" | "error" | "warning";
  /** Is a modal windows */
  private modal: boolean;

  /**
   * Create a new notification
   * Default category of notification is information
   *
   * @param message
   */
  constructor(message: string) {
    this.message = message;
    this.category = "information";
    this.buttons = [];
    this.modal = false;
  }

  /**
   * Add a button in notification
   *
   * @param label
   */
  public addButton(label: string): Notification {
    this.buttons.push(label);
    return this;
  }

  /**
   * Defines the notification category
   *
   * @param category
   */
  public setCategory(category: "information" | "error" | "warning"): Notification {
    this.category = category;
    return this;
  }

  /**
   * Set/unset to modal windows
   *
   * @param modal
   */
  public setModal(modal: boolean) {
    this.modal = modal;
  }

  /**
   * Show the notification
   */
  public show(): Promise<string> {
    return new Promise((resolve, reject) => {
      switch (this.category) {
        case "information":
          window.showInformationMessage(this.message, {modal: this.modal}, ...this.buttons).then((result) => {
            if (result) {
              resolve(result);
            } else {
              reject();
            }
          });
          break;
        case "error":
          window.showErrorMessage(this.message, {modal: this.modal}, ...this.buttons).then((result) => {
            if (result) {
              resolve(result);
            } else {
              reject();
            }
          });
          break;
        case "warning":
          window.showWarningMessage(this.message, {modal: this.modal}, ...this.buttons).then((result) => {
            if (result) {
              resolve(result);
            } else {
              reject();
            }
          });
          break;
        default:
          reject();
          break;
      }
    });
  }

}