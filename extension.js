/* exported orderOverview, disorderOverview */
const Config = imports.misc.config;
const Params = imports.misc.params;
const Workspace = imports.ui.workspace;

const SHELL_VERSION = Config.PACKAGE_VERSION;

function computeLayout(windows, layout) {
	let numRows = layout.numRows;

	let rows = [];

	// Compute max width and height for uniform sizing
	let maxWidth = 0, maxHeight = 0;
	for (let win of windows) {
		let width = SHELL_VERSION >= '3.38' ? win.boundingBox.width : win.width;
		let height = SHELL_VERSION >= '3.38' ? win.boundingBox.height : win.height;
		maxWidth = Math.max(maxWidth, width);
		maxHeight = Math.max(maxHeight, height);
	}

	let totalWidth = maxWidth * windows.length;
	let idealRowWidth = totalWidth / numRows;

	let sortedWindows = windows.slice();
	sortedWindows.sort((a, b) => a.metaWindow.get_user_time() < b.metaWindow.get_user_time());

	let windowIdx = 0;
	for (let i = 0; i < numRows; i++) {
		let row = this._newRow();
		rows.push(row);

		for (; windowIdx < sortedWindows.length; windowIdx++) {
			let window = sortedWindows[windowIdx];

			// Force all windows to same size
			if (SHELL_VERSION >= '3.38') {
				window.boundingBox.width = maxWidth;
				window.boundingBox.height = maxHeight;
			} else {
				window.width = maxWidth;
				window.height = maxHeight;
			}

			let width = maxWidth;
			let height = maxHeight;
			row.fullHeight = Math.max(row.fullHeight, height);

			if (this._keepSameRow(row, window, width, idealRowWidth) || (i === numRows - 1)) {
				row.windows.push(window);
				row.fullWidth += width;
			} else {
				break;
			}
		}
	}

	let gridHeight = 0;
	let maxRow;
	for (let i = 0; i < numRows; i++) {
		let row = rows[i];
		this._sortRow(row);

		if (!maxRow || row.fullWidth > maxRow.fullWidth)
			maxRow = row;
		gridHeight += row.fullHeight;
	}

	layout.rows = rows;
	layout.maxColumns = maxRow.windows.length;
	layout.gridWidth = maxRow.fullWidth;
	layout.gridHeight = gridHeight;
}

function computeLayout40(windows, layoutParams) {
	layoutParams = Params.parse(layoutParams, {
		numRows: 0,
	});

	if (layoutParams.numRows === 0)
		throw new Error(`${this.constructor.name}: No numRows given in layout params`);

	const numRows = layoutParams.numRows;

	let maxWidth = 0, maxHeight = 0;
	for (let win of windows) {
		maxWidth = Math.max(maxWidth, win.boundingBox.width);
		maxHeight = Math.max(maxHeight, win.boundingBox.height);
	}

	let totalWidth = maxWidth * windows.length;
	let idealRowWidth = totalWidth / numRows;

	let sortedWindows = windows.slice();
	sortedWindows.sort((a, b) => b.metaWindow.get_user_time() - a.metaWindow.get_user_time());

	let windowIdx = 0;
	let rows = [];

	for (let i = 0; i < numRows; i++) {
		let row = this._newRow();
		rows.push(row);

		for (; windowIdx < sortedWindows.length; windowIdx++) {
			let window = sortedWindows[windowIdx];

			window.boundingBox.width = maxWidth;
			window.boundingBox.height = maxHeight;

			let width = maxWidth;
			let height = maxHeight;
			row.fullHeight = Math.max(row.fullHeight, height);

			if (this._keepSameRow(row, window, width, idealRowWidth) || (i === numRows - 1)) {
				row.windows.push(window);
				row.fullWidth += width;
			} else {
				break;
			}
		}
	}

	let gridHeight = 0;
	let maxRow;
	for (let row of rows) {
		this._sortRow(row);
		if (!maxRow || row.fullWidth > maxRow.fullWidth)
			maxRow = row;
		gridHeight += row.fullHeight;
	}

	return {
		numRows,
		rows,
		maxColumns: maxRow.windows.length,
		gridWidth: maxRow.fullWidth,
		gridHeight,
	};
}

var overviewOriginals = {};
function saveAndReplace(from, propertyName, newOne) {
	overviewOriginals[String(from) + '.' + String(propertyName)] = [ from, from[propertyName] ];
	from[propertyName] = newOne;
}

function restoreAllProperties() {
	for (let p of Object.getOwnPropertyNames(overviewOriginals)) {
		let propertyName = p.split('.');
		propertyName = propertyName[propertyName.length - 1];

		let from = overviewOriginals[p][0];
		let original = overviewOriginals[p][1];

		from[propertyName] = original;
	}
}

function orderOverview() {
	if (SHELL_VERSION < '40')
		saveAndReplace(Workspace, SHELL_VERSION < '3.38' ? 'WINDOW_CLONE_MAXIMUM_SCALE' : 'WINDOW_PREVIEW_MAXIMUM_SCALE', 0.7);
	saveAndReplace(Workspace.UnalignedLayoutStrategy.prototype, '_sortRow', (row) => {});
	let cl = SHELL_VERSION < '40' ? computeLayout : computeLayout40;
	saveAndReplace(Workspace.UnalignedLayoutStrategy.prototype, 'computeLayout', cl);
}

function disorderOverview() {
	restoreAllProperties();
}

function enable() {
	orderOverview();
}

function disable() {
	disorderOverview();
}

