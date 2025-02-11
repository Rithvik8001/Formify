import * as vscode from "vscode";
import { getWebviewContent } from "./webview";

interface FormField {
  label: string;
  type: string;
  required: boolean;
}

function parseFormDescription(text: string): FormField[] {
  const lines = text.trim().split("\n");
  return lines.map((line) => {
    const match = line.match(/^(.*?)\s*\((.*?),\s*(required|optional)\)$/);
    if (!match) {
      throw new Error(`Invalid line format: ${line}`);
    }
    const [, label, type, required] = match;
    return {
      label: label.trim(),
      type: type.trim(),
      required: required === "required",
    };
  });
}

function generateHTMLForm(fields: FormField[]): string {
  const formFields = fields
    .map((field) => {
      const requiredAttr = field.required ? " required" : "";
      return `  <label>${field.label}: <input type="${field.type}"${requiredAttr} /></label>\n`;
    })
    .join("");

  return `<form>\n${formFields}  <button type="submit">Submit</button>\n</form>`;
}

function generateReactForm(fields: FormField[]): string {
  const stateFields = fields
    .map((field) => `${field.label.toLowerCase()}: ""`)
    .join(", ");

  const errorFields = fields
    .map((field) => `${field.label.toLowerCase()}: ""`)
    .join(", ");

  const validationRules = fields
    .map((field) => {
      const name = field.label.toLowerCase();
      const rules = [];

      if (field.required) {
        rules.push(
          `if (!formData.${name}) errors.${name} = "${field.label} is required";`
        );
      }

      switch (field.type) {
        case "email":
          rules.push(`if (formData.${name} && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.${name})) {
            errors.${name} = "Invalid email address";
          }`);
          break;
        case "url":
          rules.push(`if (formData.${name} && !/^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$/.test(formData.${name})) {
            errors.${name} = "Invalid URL format";
          }`);
          break;
        case "tel":
          rules.push(`if (formData.${name} && !/^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$/.test(formData.${name})) {
            errors.${name} = "Invalid phone number format";
          }`);
          break;
        case "password":
          rules.push(`if (formData.${name} && formData.${name}.length < 8) {
            errors.${name} = "Password must be at least 8 characters";
          }`);
          break;
      }

      return rules.join("\n      ");
    })
    .filter((rule) => rule)
    .join("\n      ");

  const formFields = fields
    .map((field) => {
      const name = field.label.toLowerCase();
      const label = field.label.charAt(0).toUpperCase() + field.label.slice(1);
      const requiredAttr = field.required ? " required" : "";

      if (field.type === "textarea") {
        return `        <div className="mb-4">
          <label htmlFor="${name}" className="block text-sm font-medium text-gray-600 mb-1">
            ${label}${field.required ? " *" : ""}
          </label>
          <textarea
            id="${name}"
            name="${name}"
            value={formData.${name}}
            onChange={handleChange}${requiredAttr}
            className={\`w-full px-3 py-2 border \${
              errors.${name} ? 'border-red-400' : 'border-gray-200'
            } rounded-lg focus:outline-none focus:border-blue-400 transition-colors\`}
            rows={4}
          />
          {errors.${name} && (
            <p className="mt-1 text-sm text-red-500">{errors.${name}}</p>
          )}
        </div>`;
      }

      if (field.type === "checkbox") {
        return `        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="${name}"
              checked={formData.${name} === "true"}
              onChange={handleChange}${requiredAttr}
              className={\`rounded \${
                errors.${name} ? 'border-red-400' : 'border-gray-200'
              } text-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors\`}
            />
            <span className="ml-2 text-sm text-gray-600">${label}${
          field.required ? " *" : ""
        }</span>
          </label>
          {errors.${name} && (
            <p className="mt-1 text-sm text-red-500">{errors.${name}}</p>
          )}
        </div>`;
      }

      return `        <div className="mb-4">
          <label htmlFor="${name}" className="block text-sm font-medium text-gray-600 mb-1">
            ${label}${field.required ? " *" : ""}
          </label>
          <input
            type="${field.type}"
            id="${name}"
            name="${name}"
            value={formData.${name}}
            onChange={handleChange}${requiredAttr}
            className={\`w-full px-3 py-2 border \${
              errors.${name} ? 'border-red-400' : 'border-gray-200'
            } rounded-lg focus:outline-none focus:border-blue-400 transition-colors\`}
          />
          {errors.${name} && (
            <p className="mt-1 text-sm text-red-500">{errors.${name}}</p>
          )}
        </div>`;
    })
    .join("\n");

  return `import { useState, FormEvent, ChangeEvent } from "react";

interface FormData {
  ${fields.map((field) => `${field.label.toLowerCase()}: string;`).join("\n  ")}
}

interface FormErrors {
  ${fields.map((field) => `${field.label.toLowerCase()}: string;`).join("\n  ")}
}

export default function MyForm() {
  const [formData, setFormData] = useState<FormData>({ ${stateFields} });
  const [errors, setErrors] = useState<FormErrors>({ ${errorFields} });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: FormErrors = { ${errorFields} };
    ${validationRules}
    setErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      setFormData({ ${stateFields} });
      setErrors({ ${errorFields} });
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800">
            ${fields[0]?.label ? fields[0].label.split(/(?=[A-Z])/).join(" ") : "Form"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please fill in the required information
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
${formFields}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={\`w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors \${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }\`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`;
}

class FormifyViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "formify.sidebarView";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = getWebviewContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.command === "generate") {
        try {
          const fields = parseFormDescription(data.fields);
          const generatedCode =
            data.format === "html"
              ? generateHTMLForm(fields)
              : generateReactForm(fields);

          // Create a new untitled file with the generated code
          const document = await vscode.workspace.openTextDocument({
            content: generatedCode,
            language: data.format === "html" ? "html" : "typescript",
          });

          await vscode.window.showTextDocument(document);
        } catch (error) {
          if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
          }
        }
      }
    });
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new FormifyViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      FormifyViewProvider.viewType,
      provider
    )
  );

  let toHTMLDisposable = vscode.commands.registerCommand(
    "formify.toHTML",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor!");
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      try {
        const fields = parseFormDescription(text);
        const htmlForm = generateHTMLForm(fields);
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
          editBuilder.replace(selection, htmlForm);
        });
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
      }
    }
  );

  let toReactDisposable = vscode.commands.registerCommand(
    "formify.toReact",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor!");
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      try {
        const fields = parseFormDescription(text);
        const reactForm = generateReactForm(fields);
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
          editBuilder.replace(selection, reactForm);
        });
      } catch (error) {
        if (error instanceof Error) {
          vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
      }
    }
  );

  context.subscriptions.push(toHTMLDisposable, toReactDisposable);
}

export function deactivate() {}
