/**
 * Renders json-stat data as a table.
 * @see www.json-stat.org
 * A table consists of a number of dimensions that are used to define the rows of the table (referred to as label columns)
 * and a number of dimensions that are used to define the columns of the table (referred to as value columns).
 *
 * Setting the property numRowDim defines which dimensions are used for label columns and which for the value columns.
 */
export class RendererTable {
	// TODO: auto: if dimension has role attribute 'geo' use it as the columns of the table
	// TODO: handle case when json-stat index is an object instead of an array

	/**
	 *
	 * @param {JsonStat} jsonstat
	 */
	constructor(jsonstat) {
		this.colDims = [];
		this.rowDims = [];
		this.numRowDim = 2;
		this.jsonstat = jsonstat;
		this.table = document.createElement('table');
		this.table.classList.add('jst-viz');
	}

	init() {
		// cache some often used numbers before rendering table
		this.rowDims = this.jsonstat.data.size.slice(0, this.numRowDim);
		this.colDims = this.jsonstat.data.size.slice(this.numRowDim);
		this.numValueCols = this.colDims.length > 0 ? RendererTable.product(this.colDims): 1;
		this.numLabelCols = this.rowDims.length;
		this.numHeaderRows = this.colDims.length > 0 ? this.colDims.length * 2 : 1; // add an additional row to label each dimension
	}

	/**
	 * Calculate the product of all array elements.
	 * @param {Array} values
	 */
	static product(values) {
		if (values.length > 0) {

			return values.reduce((a, b) => a * b);
		}
		else {

			return values;
		}
	}

	/**
	 * Calculate two products from array values.
	 * The first returned value is the product of all values with an element index equal or higher than the passed one, the
	 * second is the product of all values with an index higher. If it is the last element then the product is 1.
	 * @param {Array} values
	 * @param idx element index
	 * @return {Array}
	 * @private
	 */
	_partials(values, idx) {
		let f = [];

		f[0] = RendererTable.productUpper(values, idx);
		f[1] = idx < values.length ? RendererTable.productUpper(values, idx + 1) : 1;

		return f;
	}

	/**
	 * Calculates the product of all array values with an element index equal or higher than the passed one.
	 * @param {Array} values
	 * @param idx element index
	 * @return {number}
	 */
	static productUpper(values, idx) {
		let num = 1,
			len = values.length;

		for (let i = idx; i < len; i++) {
			num *= values[i];
		}

		return num;
	}

	/**
	 * Renders the data as a html table.
	 * Reads the value array and renders it as a table.
	 * @return {HTMLTableElement}
	 */
	render() {
		this.init();
		this.rowHeaders();
		this.rows();

		return this.table;
	}

	/**
	 * Creates the table head and appends header cells row by row to it.
	 */
	rowHeaders() {
		let row, tHead;

		tHead = this.table.createTHead();
		for (let rowIdx = 0; rowIdx < this.numHeaderRows; rowIdx++) {
			row = tHead.insertRow();
			this.headerLabelCells(row);
			this.headerValueCells(row);
		}
	}

	/**
	 * Creates the table body and appends table cells row by row to it.
	 */
	rows() {
		let tBody, row;

		tBody = this.table.createTBody();
		for (let offset = 0, len = this.jsonstat.getNumValues(); offset < len; offset++) {
			if (offset % this.numValueCols === 0) {
				row = tBody.insertRow();
				this.labelCells(row);
			}
			this.valueCells(row, offset);
		}
	}

	/**
	 * Creates the cells for the headers of the label columns
	 * @param {HTMLTableRowElement} row
	 */
	headerLabelCells(row) {
		for (let k = 0; k < this.numLabelCols; k++) {
			let cell, label = null, scope = null;

			if (row.rowIndex === this.numHeaderRows - 1) { // last header row
				label = this.jsonstat.getLabel(k);
				scope = 'col';
			}
			cell = RendererTable.headerCell(label, scope);
			row.appendChild(cell);
		}
	}

	/**
	 * Creates the cells for the headers of the value columns.
	 * @param {HTMLTableRowElement} row
	 */
	headerValueCells(row) {
		let cell, z, idx, dimIdx, f, catIdx, label, colspan;

		if (this.colDims.length === 0) {
			cell = RendererTable.headerCell();
			row.appendChild(cell);

			return;
		}

		idx = Math.floor(row.rowIndex / 2); // 0,1,2,3,... -> 0,0,1,1,2,2,...
		dimIdx = this.numRowDim + idx;
		f = this._partials(this.colDims, idx);
		for (let i = 0; i < this.numValueCols; i++) {
			colspan = null;
			z = row.rowIndex % 2;
			if (z === 0) {
				label = this.jsonstat.getLabel(dimIdx);
			}
			else {
				catIdx = Math.floor((i % f[0]) / f[1]);
				label = this.jsonstat.getCategoryLabel(dimIdx, catIdx);
			}
			if (f[z] > 1) {
				colspan = f[z];
				i += colspan - 1; // colspan - 1 -> i++ follows
			}
			cell = RendererTable.headerCell(label, 'col', colspan);
			row.appendChild(cell);
		}
	}

	/**
	 * Appends the label of the row.
	 * Inserts the label as a HTMLTableHeaderEleem
	 * @param {HTMLTableRowElement} row
	 */
	labelCells(row) {
		let cell, rowIdx, f, catIdx, label, rowspan;

		rowIdx = row.rowIndex - this.numHeaderRows;
		for (let i = 0; i < this.numLabelCols; i++) {
			f = this._partials(this.rowDims, i);
			if (rowIdx % f[1] === 0) {
				catIdx = Math.floor(rowIdx % f[0] / f[1]);
				label = this.jsonstat.getCategoryLabel(i, catIdx);
				rowspan = f[1] > 1 ? f[1] : null;
				cell = RendererTable.headerCell(label, 'row', null, rowspan);
				row.appendChild(cell);
			}
		}
	}

	/**
	 * Appends the value at offset as a cell.
	 * Inserts a HTMLTableCellElement at the end of the row with a value taken from the values at given offset.
	 * @param {HTMLTableRowElement} row
	 * @param offset
	 */
	valueCells(row, offset) {
		let cell, val = this.jsonstat.data.value[offset];

		cell = row.insertCell();
		cell.innerHTML = val;
	}

	/**
	 * Create and returns a header cell element.
	 * @param {String} [str]
	 * @param {String} [scope]
	 * @param [colspan] number of columns to span
	 * @param [rowspan] number of rows to span
	 * @return {HTMLTableCellElement}
	 */
	static headerCell(str = null, scope = null, colspan = null, rowspan = null) {
		let cell = document.createElement('th');

		if (scope !== null) {
			cell.scope = scope;
		}
		if (str !== null) {
			cell.innerHTML = str;
		}
		if (colspan !== null) {
			cell.colSpan = colspan;
		}
		if (rowspan !== null) {
			cell.rowSpan = rowspan;
		}

		return cell;
	}
}