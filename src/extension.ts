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
        return `        <div className="mb-6">
          <label htmlFor="${name}" className="block text-sm font-medium text-gray-700 mb-2">
            ${label}${field.required ? " *" : ""}
          </label>
          <textarea
            id="${name}"
            name="${name}"
            value={formData.${name}}
            onChange={handleChange}${requiredAttr}
            className={\`w-full px-3 py-2 border \${errors.${name} ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\`}
            rows={4}
          />
          {errors.${name} && (
            <p className="mt-1 text-sm text-red-600">{errors.${name}}</p>
          )}
        </div>`;
      }

      if (field.type === "checkbox") {
        return `        <div className="mb-6">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="${name}"
              checked={formData.${name} === "true"}
              onChange={handleChange}${requiredAttr}
              className={\`rounded \${errors.${name} ? 'border-red-500' : 'border-gray-300'} text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50\`}
            />
            <span className="ml-2 text-sm text-gray-700">${label}${
          field.required ? " *" : ""
        }</span>
          </label>
          {errors.${name} && (
            <p className="mt-1 text-sm text-red-600">{errors.${name}}</p>
          )}
        </div>`;
      }

      return `        <div className="mb-6">
          <label htmlFor="${name}" className="block text-sm font-medium text-gray-700 mb-2">
            ${label}${field.required ? " *" : ""}
          </label>
          <input
            type="${field.type}"
            id="${name}"
            name="${name}"
            value={formData.${name}}
            onChange={handleChange}${requiredAttr}
            className={\`w-full px-3 py-2 border \${errors.${name} ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500\`}
          />
          {errors.${name} && (
            <p className="mt-1 text-sm text-red-600">{errors.${name}}</p>
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

function MyForm() {
  const [formData, setFormData] = useState<FormData>({ ${stateFields} });
  const [errors, setErrors] = useState<FormErrors>({ ${errorFields} });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const errors: FormErrors = { ${errorFields} };

    // Validation rules
    ${validationRules}

    setErrors(errors);
    return Object.values(errors).every(error => !error);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked.toString() : value;

    setFormData(prev => ({ ...prev, [name]: val }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);

      // Reset form on success
      setFormData({ ${stateFields} });
      setErrors({ ${errorFields} });
      alert('Form submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred while submitting the form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
${formFields}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={\`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors \${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }\`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MyForm;

{/* Add this to your index.css or App.css */}
{/*
@tailwind base;
@tailwind components;
@tailwind utilities;
*/}

{/* Add these dependencies to your package.json */}
{/*
  "dependencies": {
    "tailwindcss": "^3.4.1"
  }
*/}
`;
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
