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
                padding: 16px;
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background: var(--vscode-editor-background);
                line-height: 1.5;
            }
            * {
                box-sizing: border-box;
            }
            .container {
                max-width: 100%;
                margin: 0 auto;
            }
            .header {
                margin-bottom: 24px;
                text-align: center;
                padding: 16px;
                background: var(--vscode-editor-background);
                border-bottom: 1px solid var(--vscode-input-border);
            }
            .header h1 {
                font-size: 1.4rem;
                margin: 0 0 8px 0;
                color: var(--vscode-foreground);
            }
            .header p {
                font-size: 0.9rem;
                margin: 0;
                opacity: 0.8;
            }
            .templates-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
                margin-bottom: 24px;
            }
            .template-card {
                position: relative;
                padding: 16px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            .template-card:hover {
                border-color: var(--vscode-focusBorder);
                transform: translateY(-1px);
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
                font-size: 28px;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background: var(--vscode-editor-background);
                border-radius: 12px;
            }
            .active .template-icon {
                background: rgba(255, 255, 255, 0.2);
            }
            .template-name {
                font-weight: 500;
                font-size: 0.95rem;
            }
            .template-description {
                font-size: 0.8rem;
                opacity: 0.7;
                text-align: center;
            }
            .divider {
                margin: 24px 0;
                border: none;
                border-top: 1px solid var(--vscode-input-border);
            }
            .toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                gap: 12px;
            }
            .field-actions {
                display: flex;
                gap: 8px;
                flex: 1;
            }
            .field-actions button {
                flex: 1;
            }
            .output-format {
                min-width: 140px;
            }
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s;
                height: 36px;
                font-weight: 500;
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
                gap: 12px;
                margin-bottom: 12px;
                padding: 12px;
                background: var(--vscode-input-background);
                border: 1px solid var(--vscode-input-border);
                border-radius: 8px;
                align-items: center;
            }
            input, select {
                width: 100%;
                height: 36px;
                padding: 8px 12px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                font-size: 0.9rem;
            }
            input:focus, select:focus {
                outline: none;
                border-color: var(--vscode-focusBorder);
            }
            .preview-panel {
                margin-top: 24px;
                padding: 16px;
                background: var(--vscode-input-background);
                border-radius: 8px;
                border: 1px solid var(--vscode-input-border);
            }
            .preview-panel pre {
                margin: 0;
                white-space: pre-wrap;
                font-size: 12px;
                padding: 12px;
                background: var(--vscode-editor-background);
                border-radius: 6px;
            }
            .empty-state {
                text-align: center;
                padding: 32px 24px;
                background: var(--vscode-input-background);
                border-radius: 8px;
                margin-bottom: 16px;
                border: 1px solid var(--vscode-input-border);
            }
            .empty-state p {
                margin: 0 0 16px 0;
                opacity: 0.8;
            }
            .output-section {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid var(--vscode-input-border);
            }
            .generate-btn {
                width: 100%;
                height: 44px;
                font-size: 1rem;
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
