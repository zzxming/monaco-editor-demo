import type * as monacoEditor from 'monaco-editor';

export type Language = string;
export interface MonacoDiffOptions {
  language?: Language;
  renderSideBySide?: boolean;
  automaticLayout?: boolean;
}
export interface MonacoDiffInstance {
  setValue: (original: string, modified: string) => Promise<void>;
  updateOptions: (opts: Partial<MonacoDiffOptions>) => void;
  dispose: () => void;
}
function mergeDefaults(opts?: MonacoDiffOptions) {
  return {
    language: opts?.language ?? 'javascript',
    renderSideBySide: opts?.renderSideBySide ?? true,
    automaticLayout: opts?.automaticLayout ?? true,
  } as Required<MonacoDiffOptions>;
}

export async function createMonacoDiff(container: HTMLElement, monaco: typeof monacoEditor, opts?: MonacoDiffOptions): Promise<MonacoDiffInstance> {
  const options = mergeDefaults(opts);

  // monaco is imported from 'monaco-editor' at top. If you want to support a consumer
  // that provides monaco via window.monaco, you may add fallback logic here.

  // create models and diff editor
  const originalModel = monaco.editor.createModel('', options.language);
  const modifiedModel = monaco.editor.createModel('', options.language);

  const diffEditor = monaco.editor.createDiffEditor(container, {
    renderSideBySide: options.renderSideBySide,
    automaticLayout: options.automaticLayout,
    enableSplitViewResizing: false,
    renderIndicators: true,
    renderGutterMenu: false, // hide gutter menu(the menu between two editors)
    originalEditable: false, // left editor is editable
    readOnly: true, // right editor is readOnly
  });

  diffEditor.setModel({ original: originalModel, modified: modifiedModel });

  const originalDecorations: string[] = [];
  const modifiedDecorations: string[] = [];

  async function setValue(original: string, modified: string) {
    originalModel.setValue(original);
    modifiedModel.setValue(modified);

    monaco.editor.setModelLanguage(originalModel, options.language);
    monaco.editor.setModelLanguage(modifiedModel, options.language);
  }

  function updateOptions(partial: Partial<MonacoDiffOptions>) {
    Object.assign(options, partial);
    diffEditor.updateOptions({
      renderSideBySide: options.renderSideBySide,
      automaticLayout: options.automaticLayout,
    });
    if (partial.language) {
      monaco.editor.setModelLanguage(originalModel, options.language);
      monaco.editor.setModelLanguage(modifiedModel, options.language);
    }
  }

  function dispose() {
    try {
      const origEditor = diffEditor.getOriginalEditor();
      const modEditor = diffEditor.getModifiedEditor();
      origEditor.deltaDecorations(originalDecorations, []);
      modEditor.deltaDecorations(modifiedDecorations, []);
    }
    catch {}
    try { diffEditor.dispose(); }
    catch {}
    try { originalModel.dispose(); }
    catch {}
    try { modifiedModel.dispose(); }
    catch {}
  }

  return {
    setValue,
    updateOptions,
    dispose,
  };
}
