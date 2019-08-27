/**
 * Renders json-stat data as a table.
 * @see www.json-stat.org
 * A table consists of a number of dimensions that are used to define the rows of the table (referred to as label columns)
 * and a number of dimensions that are used to define the columns of the table (referred to as value columns).
 *
 * Setting the property numRowDim defines which dimensions are used for label columns and which for the value columns.
 */
export class RendererTable {
	// auto: if dimension has role attribute 'geo' use it as the columns of the table

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
		if (this.colDims.length > 0) {
			this.numValueCols = RendererTable.product(this.colDims);
		}
		else {
			this.numValueCols = 1;
		}
		this.numLabelCols = this.rowDims.length;
		this.numHeaderRows = this.colDims.length * 2;
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
	 * @param {Array} values
	 * @param idx element index
	 * @return {Array}
	 * @private
	 */
	_partials(values, idx) {
		let f = [];

		f[0] = RendererTable.productUpper(values, idx);
		if (idx < values.length) {
			f[1] = RendererTable.productUpper(values, idx + 1);
		}
		else {
			f[1] = 1;
		}

		return f;
	}

	/**
	 * Calculate the product of all array elements with an index lower than the passed index.
	 * @param {Array} values
	 * @param idx element index
	 * @return {number}
	 */
	static productLower(values, idx) {
		let num = 1;

		for (let i = 0; i < idx; i++) {
			num *= values[i];
		}

		return num;
	}

	/**
	 * Calculates the product of all array elements with an index higher than the passed one.
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

	render() {
		this.init();
		this.rowHeaders();
		this.rows();

		return this.table;
	}

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
	 *
	 * @param {HTMLTableRowElement} row
	 */
	headerLabelCells(row) {
		for (let k = 0; k < this.numLabelCols; k++) {
			let label;

			if (row.rowIndex === this.numHeaderRows - 1) { // last header row
				label = this.jsonstat.getLabel(k);
			}
			RendererTable.headerCell(row, label);
		}
	}

	/**
	 *
	 * @param {HTMLTableRowElement} row
	 */
	headerValueCells(row) {
		let idx, dimIdx, f, catIdx, label;

		idx = Math.floor(row.rowIndex / 2);
		dimIdx = this.numRowDim + idx;
		f = this._partials(this.colDims, idx);
		for (let i = 0; i < this.numValueCols; i++) {
			if (row.rowIndex % 2 === 0) {
				label = this.jsonstat.getLabel(dimIdx);
			}
			else {
				catIdx = Math.floor((i % f[0]) / f[1]);
				label = this.jsonstat.getCategoryLabel(dimIdx, catIdx);
			}
			RendererTable.headerCell(row, label, 'col');
		}
	}

	/**
	 *
	 * @param {HTMLTableRowElement} row
	 */
	labelCells(row) {
		let rowIdx, f, catIdx, label;

		rowIdx = row.rowIndex - this.numHeaderRows;
		for (let i = 0; i < this.numLabelCols; i++) {
			f = this._partials(this.rowDims, i);
			catIdx = Math.floor(rowIdx % f[0] / f[1]);
			label = this.jsonstat.getCategoryLabel(i, catIdx);
			RendererTable.headerCell(row, label, 'row');
		}
	}

	/**
	 *
	 * @param {HTMLTableRowElement} row
	 * @param offset
	 */
	valueCells(row, offset) {
		let val = this.jsonstat.data.value[offset];

		RendererTable.cell(row, val);
	}

	/**
	 *
	 * @param {HTMLTableRowElement} row
	 * @param {String} str
	 */
	static cell(row, str) {
		let cell = row.insertCell();

		cell.innerHTML = str;
	}

	/**
	 *
	 * @param {HTMLTableRowElement} row
	 * @param {String} [str]
	 * @param {String} [scope]
	 */
	static headerCell(row, str, scope) {
		let cell = document.createElement('th');

		if (scope !== undefined) {
			cell.scope = scope;
		}
		if (str !== undefined) {
			cell.innerText = str;
		}
		row.appendChild(cell);
	}
}