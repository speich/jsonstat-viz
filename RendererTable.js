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
		this.numColDims = 2;
		this.jsonstat = jsonstat;
		this.table = document.createElement('table');
		this.table.classList.add('jst-viz');
	}

	/**
	 * Calculates the number of value columns from the sizes of the dimensions.
	 * Sizes of dimensions are taken in the reverse, starting with the last dimension until number of column dimensions.
	 */
	getNumValueColumns() {
		let dimIdx = this.jsonstat.data.size.length - this.numColDims;

		return this.crossProductRight(dimIdx);
	}

	/**
	 * Calculates the cross product of all dimension sizes with a lower index.
	 * @param dimIdx
	 * @return {number}
	 */
	crossProductLeft(dimIdx) {
		let num = 1;

		for (let i = 0; i < dimIdx; i++) {
			num *= this.jsonstat.data.size[i];
		}

		return num;
	}

	/**
	 * Calculates the cross product of all dimension sizes with a higher index.
	 * @param dimIdx
	 * @return {number}
	 */
	crossProductRight(dimIdx) {
		let num = 1,
			len = this.jsonstat.data.size.length;

		for (let i = dimIdx; i < len; i++) {
			num *= this.jsonstat.data.size[i];
		}

		return num;
	}

	/**
	 * Calculates the number of label columns
	 * @return {number}
	 */
	getNumLabelColumns() {
		return this.jsonstat.data.size.length - this.numColDims;
	}

	render() {
		this.renderRowHeaders();
		this.renderRows();

		return this.table;
	}

	renderRows() {
		let tBody, row, numValueCols, numLabelCols, data;

		data = this.jsonstat.data;
		numValueCols = this.getNumValueColumns();
		numLabelCols = this.getNumLabelColumns();
		tBody = this.table.createTBody();
		for (let offset = 0, len = data.value.length; offset < len; offset++) {
			if (offset % numValueCols === 0) {
				row = tBody.insertRow();
				this.renderLabelCells(row, numLabelCols);
			}
			this.renderValueCells(row, offset);
		}
	}

	renderRowHeaders() {
		// num header rows = num column dimensions * 2
		let row, cell, tHead, numCells, numValueCols,
			numRows = this.numColDims * 2;

		tHead = this.table.createTHead();
		numValueCols = this.getNumValueColumns();
		for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
			row = tHead.insertRow();

			// headers of label columns
			for (let k = 0; k < this.getNumLabelColumns(); k++) {
				let label;

				if (rowIdx === numRows - 1) { // last header row
					label = this.jsonstat.getLabel(k);
				}
				this.renderHeaderCell(row, label);
			}

			// headers of value columns
			let dimIdx = this.jsonstat.data.size.length - this.numColDims + Math.floor(rowIdx / 2);
			for (let k = 0; k < numValueCols; k++) {
				let label = this.jsonstat.getCategoryLabel(dimIdx, (k % 2));
				/*if (i % 2 === 0) {
					cell.colSpan = this.jsonstat.data.size[dimIdx];
				}*/

				this.renderHeaderCell(row, label);
			}
		}
	}

	renderLabelCells(row, numLabelCols) {
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
	renderLabelCells_old(row, numLabelCols) {
		let catIdx, label;

		for (let i = 0; i < numLabelCols; i++) {
			if (i === 1) {
				catIdx = row.rowIndex % 2;
			}
			else {
				catIdx = 0;
			}
			label = this.jsonstat.getCategoryLabel(i, catIdx);
			this.renderHeaderCell(row, label, 'row');
		}
	}

	renderValueCells(row, offset) {
		let val = this.jsonstat.data.value[offset];

		this.renderCell(row, val);
	}

	renderCell(row, str) {
		let cell = row.insertCell();

		cell.innerHTML = str;
	}

	renderHeaderCell(row, str, scope) {
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