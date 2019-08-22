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
		this.rowDims = this.jsonstat.data.size.slice(0, this.numColDims);
		this.colDims = this.jsonstat.data.size.slice(this.numColDims);
		this.numValueCols = this.getNumValueColumns();
		this.numLabelCols = this.getNumLabelColumns();
	}

	/**
	 * Calculate the number of label columns
	 * @return {number}
	 */
	getNumLabelColumns() {
		return this.rowDims.length;
	}

	/**
	 * Calculate the number of value columns from the sizes of the dimensions.
	 * Sizes of dimensions are taken in the reverse, starting with the last dimension until number of column dimensions.
	 */
	getNumValueColumns() {
		return RendererTable.product(this.colDims);
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
		this.renderRowHeaders();
		this.renderRows();

		return this.table;
	}

	renderRows() {
		let tBody, row, data;

		data = this.jsonstat.data;
		tBody = this.table.createTBody();
		for (let offset = 0, len = data.value.length; offset < len; offset++) {
			if (offset % this.numValueCols === 0) {
				row = tBody.insertRow();
				this.renderLabelCells(row, this.numLabelCols);
			}
			this.renderValueCells(row, offset);
		}
	}

	renderRowHeaders() {
		// num header rows = num column dimensions * 2
		let row, tHead,
			numRows = this.numColDims * 2;

		tHead = this.table.createTHead();
		for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
			row = tHead.insertRow();

			// headers of label columns
			for (let k = 0; k < this.numLabelCols; k++) {
				let label;

				if (rowIdx === numRows - 1) { // last header row
					label = this.jsonstat.getLabel(k);
				}
				RendererTable.renderHeaderCell(row, label);
			}

			// headers of value columns
			let dimIdx = this.jsonstat.data.size.length - this.numColDims + Math.floor(rowIdx / 2);
			for (let k = 0; k < this.numValueCols; k++) {
				let label = this.jsonstat.getCategoryLabel(dimIdx, (k % 2));
				/*if (i % 2 === 0) {
					cell.colSpan = this.jsonstat.data.size[dimIdx];
				}*/

				RendererTable.renderHeaderCell(row, label);
			}
		}
	}

	renderLabelCells_new(row, numLabelCols) {
		let catIdx, dimSize = this.jsonstat.data.size;

		for (let i = numLabelCols - 1; i > -1; i--) {
			catIdx = row.rowIndex % dimSize[i];
		}
	}

	/**
	 * Renders the cells of label columns and sets the scope to row.
	 * @param {HTMLTableRowElement} row
	 * @param numLabelCols
	 */
	renderLabelCells(row, numLabelCols) {
		let catIdx, label;

		for (let i = 0; i < numLabelCols; i++) {
			if (i === 1) {
				catIdx = row.rowIndex % 2;
			}
			else {
				catIdx = 0;
			}
			label = this.jsonstat.getCategoryLabel(i, catIdx);
			RendererTable.renderHeaderCell(row, label, 'row');
		}
	}

	renderValueCells(row, offset) {
		let val = this.jsonstat.data.value[offset];

		RendererTable.renderCell(row, val);
	}

	static renderCell(row, str) {
		let cell = row.insertCell();

		cell.innerHTML = str;
	}

	static renderHeaderCell(row, str, scope) {
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