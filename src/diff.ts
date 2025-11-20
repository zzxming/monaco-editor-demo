import type * as monacoEditor from 'monaco-editor';

export type Language = string;
export interface MonacoDiffOptions {
  language?: Language;
  editorOptions?: Parameters<typeof monacoEditor.editor.createDiffEditor>[1];
}
export interface MonacoDiffInstance {
  setValue: (original: string, modified: string) => Promise<void>;
  updateOptions: (opts: Partial<MonacoDiffOptions>) => void;
  dispose: () => void;
}

function mergeDefaults(opts?: MonacoDiffOptions) {
  return {
    language: opts?.language ?? 'javascript',
    editorOptions: opts?.editorOptions ?? {},
  } as Required<MonacoDiffOptions>;
}

export async function createMonacoDiff(container: HTMLElement, monaco: typeof monacoEditor, opts?: MonacoDiffOptions): Promise<MonacoDiffInstance> {
  const options = mergeDefaults(opts);

  // create models and diff editor
  const originalModel = monaco.editor.createModel('', options.language);
  const modifiedModel = monaco.editor.createModel('', options.language);

  const diffEditor = monaco.editor.createDiffEditor(container, {
    renderSideBySide: true, // render two editors or one merged editor
    automaticLayout: true, // auto merge two editors
    enableSplitViewResizing: false,
    renderIndicators: true,
    renderGutterMenu: false, // hide gutter menu(the menu between two editors)
    originalEditable: false, // left editor is editable
    readOnly: true, // right editor is readOnly
    ...options.editorOptions,
  });

  diffEditor.setModel({ original: originalModel, modified: modifiedModel });

  async function setValue(original: string, modified: string) {
    originalModel.setValue(original);
    modifiedModel.setValue(modified);

    monaco.editor.setModelLanguage(originalModel, options.language);
    monaco.editor.setModelLanguage(modifiedModel, options.language);
  }

  function updateOptions(partial: Partial<MonacoDiffOptions>) {
    Object.assign(options, partial);
    diffEditor.updateOptions(options.editorOptions);
    if (partial.language) {
      monaco.editor.setModelLanguage(originalModel, options.language);
      monaco.editor.setModelLanguage(modifiedModel, options.language);
    }
  }

  function dispose() {
    try {
      diffEditor.dispose();
    }
    catch {}
    try {
      originalModel.dispose();
    }
    catch {}
    try {
      modifiedModel.dispose();
    }
    catch {}
  }

  return {
    setValue,
    updateOptions,
    dispose,
  };
}
