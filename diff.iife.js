var bundle = (function(exports) {


//#region src/diff.ts
	function mergeDefaults(opts) {
		return {
			language: opts?.language ?? "javascript",
			renderSideBySide: opts?.renderSideBySide ?? true,
			automaticLayout: opts?.automaticLayout ?? true
		};
	}
	async function createMonacoDiff(container, monaco, opts) {
		const options = mergeDefaults(opts);
		const originalModel = monaco.editor.createModel("", options.language);
		const modifiedModel = monaco.editor.createModel("", options.language);
		const diffEditor = monaco.editor.createDiffEditor(container, {
			renderSideBySide: options.renderSideBySide,
			automaticLayout: options.automaticLayout,
			enableSplitViewResizing: false,
			renderIndicators: true,
			renderGutterMenu: false,
			originalEditable: false,
			readOnly: true
		});
		diffEditor.setModel({
			original: originalModel,
			modified: modifiedModel
		});
		async function setValue(original, modified) {
			originalModel.setValue(original);
			modifiedModel.setValue(modified);
			monaco.editor.setModelLanguage(originalModel, options.language);
			monaco.editor.setModelLanguage(modifiedModel, options.language);
		}
		function updateOptions(partial) {
			Object.assign(options, partial);
			diffEditor.updateOptions({
				renderSideBySide: options.renderSideBySide,
				automaticLayout: options.automaticLayout
			});
			if (partial.language) {
				monaco.editor.setModelLanguage(originalModel, options.language);
				monaco.editor.setModelLanguage(modifiedModel, options.language);
			}
		}
		function dispose() {
			try {
				diffEditor.dispose();
			} catch {}
			try {
				originalModel.dispose();
			} catch {}
			try {
				modifiedModel.dispose();
			} catch {}
		}
		return {
			setValue,
			updateOptions,
			dispose
		};
	}

//#endregion
exports.createMonacoDiff = createMonacoDiff;
return exports;
})({});