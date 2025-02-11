import * as vscode from "vscode";

const formTemplates = {
  blank: {
    name: "Blank Form",
    icon: "⚡",
    description: "Start with a clean slate",
    fields: [],
  },
  login: {
    name: "Login Form",
    icon: "🔐",
    description: "User authentication form",
    fields: [
      { label: "Email", type: "email", required: true },
      { label: "Password", type: "password", required: true },
    ],
  },
  registration: {
    name: "Registration Form",
    icon: "👤",
    description: "New user signup form",
    fields: [
      { label: "FullName", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Password", type: "password", required: true },
      { label: "ConfirmPassword", type: "password", required: true },
      { label: "DateOfBirth", type: "date", required: false },
      { label: "AcceptTerms", type: "checkbox", required: true },
    ],
  },
  contact: {
    name: "Contact Form",
    icon: "✉️",
    description: "Get in touch form",
    fields: [
      { label: "Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Subject", type: "text", required: true },
      { label: "Message", type: "textarea", required: true },
    ],
  },
  newsletter: {
    name: "Newsletter Subscription",
    icon: "📫",
    description: "Email subscription form",
    fields: [
      { label: "Email", type: "email", required: true },
      { label: "Name", type: "text", required: false },
      { label: "Preferences", type: "checkbox", required: false },
    ],
  },
  profile: {
    name: "Profile Form",
    icon: "🎯",
    description: "User profile form",
    fields: [
      { label: "Avatar", type: "file", required: false },
      { label: "FullName", type: "text", required: true },
      { label: "Bio", type: "textarea", required: false },
      { label: "Website", type: "url", required: false },
      { label: "Phone", type: "tel", required: false },
    ],
  },
};

export function getWebviewContent(webview: vscode.Webview): string {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Formify</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background: var(--vscode-editor-background);
                line-height: 1.6;
                min-height: 100vh;
            }
            * {
                box-sizing: border-box;
            }
            .container {
                max-width: 900px;
                margin: 0 auto;
                padding: 2rem;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            .header {
                text-align: center;
                margin-bottom: 3rem;
                padding: 1rem 0;
            }
            .header h1 {
                font-size: 2rem;
                font-weight: 600;
                margin: 0 0 0.5rem;
                color: var(--vscode-foreground);
                letter-spacing: -0.025em;
            }
            .header p {
                font-size: 0.95rem;
                margin: 0;
                opacity: 0.7;
            }
            .templates-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.5rem;
                margin-bottom: 3rem;
            }
            .template-card {
                position: relative;
                padding: 1.5rem;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 1rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1rem;
            }
            .template-card:hover {
                border-color: var(--vscode-focusBorder);
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            .template-card.active {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border-color: var(--vscode-button-background);
            }
            .template-card.active .template-description {
                color: var(--vscode-button-foreground);
                opacity: 0.9;
            }
            .template-icon {
                font-size: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 4rem;
                height: 4rem;
                background: var(--vscode-editor-background);
                border-radius: 1rem;
                transition: all 0.2s ease;
            }
            .active .template-icon {
                background: rgba(255, 255, 255, 0.15);
            }
            .template-name {
                font-weight: 600;
                font-size: 1.1rem;
            }
            .template-description {
                font-size: 0.9rem;
                opacity: 0.8;
                text-align: center;
            }
            .divider {
                margin: 2.5rem 0;
                border: none;
                border-top: 1px solid var(--vscode-input-border);
                opacity: 0.5;
            }
            .toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .field-actions {
                display: flex;
                gap: 0.75rem;
                flex: 1;
            }
            .field-actions button {
                flex: 1;
            }
            .output-format {
                min-width: 140px;
            }
            .btn {
                padding: 0.75rem 1.25rem;
                border: none;
                border-radius: 0.75rem;
                cursor: pointer;
                font-size: 0.9rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                transition: all 0.2s ease;
                font-weight: 500;
                height: 2.75rem;
            }
            .btn:hover {
                opacity: 0.9;
                transform: translateY(-1px);
            }
            .btn:active {
                transform: translateY(0);
            }
            .btn-primary {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
            }
            .btn-secondary {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            .btn-danger {
                background: var(--vscode-errorForeground);
                color: white;
            }
            .field-row {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr auto;
                gap: 1rem;
                margin-bottom: 1rem;
                padding: 1.25rem;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 0.75rem;
                align-items: center;
                transition: all 0.2s ease;
            }
            .field-row:hover {
                border-color: var(--vscode-focusBorder);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            input, select {
                width: 100%;
                height: 2.75rem;
                padding: 0.5rem 1rem;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 0.5rem;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }
            input:focus, select:focus {
                outline: none;
                border-color: var(--vscode-focusBorder);
                box-shadow: 0 0 0 2px rgba(var(--vscode-focusBorder), 0.1);
            }
            .preview-panel {
                margin-top: 2.5rem;
                padding: 1.5rem;
                background: var(--vscode-input-background);
                border-radius: 0.75rem;
                border: 1px solid var(--vscode-input-border);
            }
            .preview-panel pre {
                margin: 0;
                white-space: pre-wrap;
                font-size: 0.875rem;
                padding: 1.25rem;
                background: var(--vscode-editor-background);
                border-radius: 0.5rem;
                overflow-x: auto;
            }
            .empty-state {
                text-align: center;
                padding: 4rem 2rem;
                background: var(--vscode-input-background);
                border-radius: 0.75rem;
                margin-bottom: 2rem;
                border: 1px solid var(--vscode-input-border);
            }
            .empty-state p {
                margin: 0 0 1.5rem;
                opacity: 0.7;
                font-size: 0.95rem;
            }
            .output-section {
                margin-top: 3rem;
                padding-top: 2.5rem;
                border-top: 1px solid var(--vscode-input-border);
            }
            .generate-btn {
                width: 100%;
                height: 3rem;
                font-size: 1rem;
                font-weight: 600;
                border-radius: 0.75rem;
                letter-spacing: 0.025em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Form Generator</h1>
                <p>Choose a template or create a custom form</p>
            </div>

            <div class="templates-grid">
                ${Object.entries(formTemplates)
                  .map(
                    ([key, template]) => `
                    <div class="template-card" data-template="${key}">
                        <div class="template-icon">${template.icon}</div>
                        <div class="template-name">${template.name}</div>
                        <div class="template-description">${template.description}</div>
                    </div>
                `
                  )
                  .join("")}
            </div>

            <div class="toolbar">
                <div class="field-actions">
                    <button id="addField" class="btn btn-secondary">
                        <span>＋</span> Add Field
                    </button>
                    <button id="clearFields" class="btn btn-danger">
                        Clear All
                    </button>
                </div>
                <div class="output-format">
                    <select id="outputFormat">
                        <option value="react">React + Tailwind</option>
                        <option value="html">HTML</option>
                    </select>
                </div>
            </div>

            <div id="formFields">
                <!-- Dynamic form fields will be added here -->
            </div>

            <div class="preview-panel" style="display: none;">
                <div class="toolbar">
                    <strong>Preview</strong>
                    <button id="togglePreview" class="btn btn-secondary">Hide Preview</button>
                </div>
                <pre id="previewCode"></pre>
            </div>

            <div class="output-section">
                <button id="generate" class="btn btn-primary generate-btn">
                    Generate Form Code
                </button>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();
            const templates = ${JSON.stringify(formTemplates)};
            let currentTemplate = 'blank';

            // Template selection
            document.querySelectorAll('.template-card').forEach(card => {
                card.addEventListener('click', () => {
                    const templateKey = card.dataset.template;
                    currentTemplate = templateKey;

                    // Update UI
                    document.querySelectorAll('.template-card').forEach(c =>
                        c.classList.remove('active'));
                    card.classList.add('active');

                    // Load template fields
                    const formFields = document.getElementById('formFields');
                    formFields.innerHTML = '';

                    if (templates[templateKey].fields.length > 0) {
                        templates[templateKey].fields.forEach(field => {
                            const row = createFieldRow();
                            const [label, type, required] = row.querySelectorAll('input, select');
                            label.value = field.label;
                            type.value = field.type;
                            required.value = field.required ? 'required' : 'optional';
                            formFields.appendChild(row);
                        });
                        updatePreview();
                    } else {
                        updateEmptyState();
                    }
                });
            });

            // Clear fields
            document.getElementById('clearFields').onclick = () => {
                document.getElementById('formFields').innerHTML = '';
                updateEmptyState();
                updatePreview();
            };

            // Preview functionality
            let previewVisible = false;
            const previewPanel = document.querySelector('.preview-panel');
            const togglePreview = document.getElementById('togglePreview');

            function updatePreview() {
                if (!previewVisible) return;

                const fields = Array.from(document.getElementById('formFields').querySelectorAll('.field-row')).map(row => {
                    const [label, type, required] = row.querySelectorAll('input, select');
                    return \`\${label.value} (\${type.value}, \${required.value})\`;
                });

                document.getElementById('previewCode').textContent = fields.join('\\n');
            }

            togglePreview.onclick = () => {
                previewVisible = !previewVisible;
                previewPanel.style.display = previewVisible ? 'block' : 'none';
                togglePreview.textContent = previewVisible ? 'Hide Preview' : 'Show Preview';
                if (previewVisible) updatePreview();
            };

            function createFieldRow() {
                const row = document.createElement('div');
                row.className = 'field-row';

                const labelInput = document.createElement('input');
                labelInput.placeholder = 'Field Label (e.g., Full Name)';

                const typeSelect = document.createElement('select');
                ['text', 'email', 'password', 'number', 'textarea', 'checkbox', 'tel', 'url', 'date', 'file'].forEach(type => {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                    typeSelect.appendChild(option);
                });

                const requiredSelect = document.createElement('select');
                ['required', 'optional'].forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
                    requiredSelect.appendChild(option);
                });

                const removeBtn = document.createElement('button');
                removeBtn.className = 'btn btn-danger';
                removeBtn.innerHTML = '✕';
                removeBtn.title = 'Remove field';
                removeBtn.onclick = () => {
                    row.remove();
                    updateEmptyState();
                    updatePreview();
                };

                row.appendChild(labelInput);
                row.appendChild(typeSelect);
                row.appendChild(requiredSelect);
                row.appendChild(removeBtn);

                // Update preview when field changes
                [labelInput, typeSelect, requiredSelect].forEach(el => {
                    el.addEventListener('change', updatePreview);
                    el.addEventListener('input', updatePreview);
                });

                return row;
            }

            function updateEmptyState() {
                const formFields = document.getElementById('formFields');
                if (formFields.children.length === 0) {
                    const emptyState = document.createElement('div');
                    emptyState.className = 'empty-state';
                    emptyState.innerHTML = \`
                        <p>No fields added yet</p>
                        <button class="btn btn-secondary" onclick="document.getElementById('addField').click()">
                            Add Your First Field
                        </button>
                    \`;
                    formFields.appendChild(emptyState);
                } else if (formFields.querySelector('.empty-state')) {
                    formFields.querySelector('.empty-state').remove();
                }
            }

            document.getElementById('addField').onclick = () => {
                const formFields = document.getElementById('formFields');
                if (formFields.querySelector('.empty-state')) {
                    formFields.innerHTML = '';
                }
                const row = createFieldRow();
                formFields.appendChild(row);
                updatePreview();
            };

            document.getElementById('generate').onclick = () => {
                const fields = Array.from(document.getElementById('formFields').querySelectorAll('.field-row')).map(row => {
                    const [label, type, required] = row.querySelectorAll('input, select');
                    return \`\${label.value} (\${type.value}, \${required.value})\`;
                });

                if (fields.length === 0) {
                    vscode.postMessage({
                        command: 'error',
                        message: 'Please add at least one field to generate the form.'
                    });
                    return;
                }

                vscode.postMessage({
                    command: 'generate',
                    format: document.getElementById('outputFormat').value,
                    fields: fields.join('\\n')
                });
            };

            // Initialize empty state
            updateEmptyState();

            // Select blank template by default
            document.querySelector('[data-template="blank"]').classList.add('active');
        </script>
    </body>
    </html>`;
}
