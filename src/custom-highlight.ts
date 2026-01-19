import type * as monacoEditor from 'monaco-editor';

/**
 * 示例1：使用 Decoration 进行 JSON 文本高亮
 * 适用于：需要高亮 JSON 中特定的字段和值，并添加简单的悬浮提示
 */
export async function createDecorationHighlight(container: HTMLElement, monaco: typeof monacoEditor) {
  const editor = monaco.editor.create(container, {
    value: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "admin",
    "password": "admin123",
    "apiKey": "sk-1234567890",
    "secretToken": "abc123xyz"
  },
  "normalField": "hello"
}`,
    language: 'json',
    theme: 'vs',
    minimap: { enabled: false },
    readOnly: true,
  });

  // 创建 decorations，高亮特定的键值对
  const decorations: monacoEditor.editor.IModelDeltaDecoration[] = [
    {
      range: new monaco.Range(7, 15, 7, 30),
      options: {
        className: 'highlight-red',
        hoverMessage: { value: '🌐 **可以是标题**\n\n这是底下描述' },
      },
    },
    {
      range: new monaco.Range(8, 20, 8, 31),
      options: {
        className: 'highlight-blue',
        hoverMessage: { value: '🌐 **可以是标题**\n\n这是底下描述' },
      },
    },
  ];

  const decorationsCollection = editor.createDecorationsCollection(decorations);

  // 注入自定义样式
  const style = document.createElement('style');
  style.textContent = `
    /* 隐藏只读编辑器的提示 */
    .monaco-editor .monaco-editor-overlaymessage {
      display: none !important;
    }
    .highlight-blue {
      box-sizing: border-box;
      background-color: #cbcdf4;
      border-bottom: 2px solid blue;
    }
    .highlight-red {
      box-sizing: border-box;
      background-color: #f6beca;
      border-bottom: 2px solid red;
    }
  `;
  document.head.appendChild(style);

  return {
    dispose: () => {
      decorationsCollection.clear();
      editor.dispose();
      style.remove();
    },
  };
}

/**
 * 示例2：使用 HoverProvider 实现 JSON 动态悬浮提示
 * 适用于：根据 JSON 键名动态判断是否显示悬浮提示
 */
export async function createHoverProviderHighlight(container: HTMLElement, monaco: typeof monacoEditor) {
  const editor = monaco.editor.create(container, {
    value: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "admin",
    "password": "admin123",
    "apiKey": "sk-1234567890",
    "secretToken": "abc123xyz"
  },
  "normalField": "hello"
}`,
    language: 'json',
    theme: 'vs',
    minimap: { enabled: false },
    readOnly: true,
    domReadOnly: true,
  });

  // 隐藏只读编辑器提示的样式
  const style = document.createElement('style');
  style.textContent = `
    /* 隐藏只读编辑器的提示 */
    .monaco-editor .monaco-editor-overlaymessage {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  // 注册 HoverProvider
  const provider = monaco.languages.registerHoverProvider('json', {
    provideHover(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return;

      const text = word.word;

      // 检测 JSON 中的敏感字段键名
      if (
        text.toLowerCase().includes('password')
        || text.toLowerCase().includes('api')
        || text.toLowerCase().includes('key')
        || text.toLowerCase().includes('secret')
        || text.toLowerCase().includes('token')
      ) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn,
          ),
          contents: [
            { value: '🔐 **敏感字段检测**' },
            { value: `检测到敏感字段：\`${text}\`\n\n建议：使用环境变量或配置文件管理` },
          ],
        };
      }

      return null;
    },
  });

  return {
    dispose: () => {
      style.remove();
      provider.dispose();
      editor.dispose();
    },
  };
}

/**
 * 示例4：使用 InlayHints 显示 JSON 内联提示
 * 适用于：在 JSON 配置中显示类型提示、字段描述等辅助信息
 */
export async function createInlayHintsHighlight(container: HTMLElement, monaco: typeof monacoEditor) {
  const editor = monaco.editor.create(container, {
    value: `{
  "name": "My App",
  "version": "1.0.0",
  "port": 3000,
  "debug": true
}`,
    language: 'json',
    theme: 'vs',
    minimap: { enabled: false },
    readOnly: true,
    domReadOnly: true,
  });

  // 隐藏只读编辑器提示的样式
  const style = document.createElement('style');
  style.textContent = `
    /* 隐藏只读编辑器的提示 */
    .monaco-editor .monaco-editor-overlaymessage {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  // 注册 InlayHintsProvider
  const provider = monaco.languages.registerInlayHintsProvider('json', {
    provideInlayHints(model, range, _token) {
      const hints: monacoEditor.languages.InlayHint[] = [];

      // 为 JSON 字段值添加类型提示
      for (let line = range.startLineNumber; line <= range.endLineNumber; line++) {
        const lineContent = model.getLineContent(line);

        // 检测 JSON 字段值（字符串、数字、布尔值）
        const stringMatch = lineContent.match(/:\s*"([^"]+)"/);
        if (stringMatch) {
          const valuePos = lineContent.indexOf(stringMatch[1]);
          hints.push({
            position: { lineNumber: line, column: valuePos + 1 },
            label: ':string',
            kind: monaco.languages.InlayHintKind.Type,
            paddingLeft: true,
            paddingRight: false,
          });
        }

        const numberMatch = lineContent.match(/:\s*(\d+)/);
        if (numberMatch) {
          const valuePos = lineContent.indexOf(numberMatch[1]);
          hints.push({
            position: { lineNumber: line, column: valuePos + 1 },
            label: ':number',
            kind: monaco.languages.InlayHintKind.Type,
            paddingLeft: true,
            paddingRight: false,
          });
        }

        const boolMatch = lineContent.match(/:\s*(true|false)/);
        if (boolMatch) {
          const valuePos = lineContent.indexOf(boolMatch[1]);
          hints.push({
            position: { lineNumber: line, column: valuePos + 1 },
            label: ':boolean',
            kind: monaco.languages.InlayHintKind.Type,
            paddingLeft: true,
            paddingRight: false,
          });
        }
      }

      return {
        hints,
        dispose: () => {},
      };
    },
  });

  return {
    dispose: () => {
      style.remove();
      provider.dispose();
      editor.dispose();
    },
  };
}

/**
 * 示例7：实时检测和高亮 JSON 中的敏感信息
 * 适用于：自动检测并高亮 JSON 配置中的敏感信息（密码、密钥等）
 */
export async function createSensitiveDataHighlight(container: HTMLElement, monaco: typeof monacoEditor) {
  const editor = monaco.editor.create(container, {
    value: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "admin",
    "password": "admin123",
    "apiKey": "sk-1234567890abcdef",
    "secret": "my-secret-token-123"
  },
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`,
    language: 'json',
    theme: 'vs',
    minimap: { enabled: false },
    readOnly: true,
    domReadOnly: true,
  });

  // JSON 敏感信息检测规则
  const sensitivePatterns = [
    { pattern: /"(password|passwd|pwd)"\s*:\s*"([^"]+)"/i, label: '密码' },
    { pattern: /"(api[_-]?key|apikey)"\s*:\s*"([^"]+)"/i, label: 'API密钥' },
    { pattern: /"(secret[_-]?key|secret)"\s*:\s*"([^"]+)"/i, label: '密钥' },
    { pattern: /"(jwt[_-]?token|token|accesstoken)"\s*:\s*"([^"]+)"/i, label: '令牌' },
    { pattern: /"sk-[a-zA-Z0-9]{20,}"/, label: 'OpenAI API密钥' },
    { pattern: /"[a-zA-Z0-9]{32,}"/, label: '可能的密钥' },
  ];

  const decorationsCollection = editor.createDecorationsCollection([]);

  // 更新高亮
  function updateHighlights() {
    const content = editor.getValue();
    const lines = content.split('\n');
    const newDecorations: monacoEditor.editor.IModelDeltaDecoration[] = [];

    for (const [lineIndex, line] of lines.entries()) {
      for (const { pattern, label } of sensitivePatterns) {
        const match = line.match(pattern);
        if (match) {
          // 找到匹配值的起始和结束位置
          const matchedText = match[0];
          const matchedValue = match[match.length - 1];
          const valueStart = matchedText.indexOf(matchedValue);
          const valueEnd = valueStart + matchedValue.length;
          const lineStart = line.indexOf(matchedText);

          newDecorations.push({
            range: new monaco.Range(
              lineIndex + 1,
              lineStart + valueStart + 1,
              lineIndex + 1,
              lineStart + valueEnd + 1,
            ),
            options: {
              className: 'sensitive-data-highlight',
              hoverMessage: {
                value: `🚨 **敏感信息检测**\n\n检测到：${label}\n\n⚠️ 请勿将敏感信息提交到代码仓库！`,
              },
              minimap: {
                color: '#f44336',
                position: monaco.editor.MinimapPosition.Inline,
              },
            },
          });
        }
      }
    }

    decorationsCollection.set(newDecorations);
  }

  // 监听内容变化
  const disposable = editor.onDidChangeModelContent(() => {
    updateHighlights();
  });

  // 初始高亮
  updateHighlights();

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    /* 隐藏只读编辑器的提示 */
    .monaco-editor .monaco-editor-overlaymessage {
      display: none !important;
    }
    .sensitive-data-highlight {
      background-color: #ffebee !important;
      border-bottom: 2px wavy #f44336 !important;
    }
  `;
  document.head.appendChild(style);

  return {
    dispose: () => {
      decorationsCollection.clear();
      disposable.dispose();
      editor.dispose();
      style.remove();
    },
  };
}
