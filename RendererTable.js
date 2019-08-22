/**
 * Renders json-stat data as a table.
 * @see www.json-stat.org
 * A table consists of a number of dimensions that are used to define the rows of the table (referred to as label columns)
 * and a number of dimensions that are used to define the columns of the table (referred to as value columns).
 *
 * Setting the property numColDims defines which dimensions are used for label columns and which for the value columns.
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
		this.numColDims = 2;
		this.jsonstat = jsonstat;
		this.table = document.createElement('table');
		this.table.classList.add('jst-viz');
	}

	init() {
		// cache some often used numbers before rendering table
		this.rowDims = this.jsonstat.data.size.slice(0, this.numColDims);
		this.colDims = this.jsonstat.data.size.slice(this.numColDims);
		this.numValueCols = RendererTable.product(this.colDims);
		this.numLabelCols = this.rowDims.length;
		this.numHeaderRows = this.numColDims * 2;
	}

	/**
	 * Calculate the product of all array elements.
	 * @param {Array} values
	 */
	static product(values) {

		return values.reduce((a, b) => a * b);
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
		let tBody, row, data;

		data = this.jsonstat.data;
		tBody = this.table.createTBody();
		for (let offset = 0, len = data.value.length; offset < len; offset++) {
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
		let rowIdx, a, b, catIdx, label;

		for (let i = 0; i < this.numValueCols; i++) {
			a = RendererTable.productUpper(this.colDims, row.rowIndex);
			b = RendererTable.productUpper(this.colDims, row.rowIndex + 1);
			catIdx = Math.floor(i % a / b);
			label = this.jsonstat.getCategoryLabel(this.numColDims + row.rowIndex % 2, catIdx);
			RendererTable.headerCell(row, label, 'col');
		}
	}

	/**
	 *
	 * @param {HTMLTableRowElement} row
	 */
	labelCells(row) {
		let rowIdx, a, b, catIdx, label;

		rowIdx = row.rowIndex - this.numHeaderRows;
		for (let i = 0; i < this.numLabelCols; i++) {
			a = RendererTable.productUpper(this.rowDims, i);
			b = RendererTable.productUpper(this.rowDims, i + 1);
			catIdx = Math.floor(rowIdx % a / b);
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