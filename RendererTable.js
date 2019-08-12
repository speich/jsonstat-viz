export class RendererTable {
	// auto: if dimension has role attribute 'geo' use it as the columns of the table

	/**
	 *
	 * @param {JsonStat} jsonstat
	 */
	constructor(jsonstat) {
		this.numLabelColumns = 1;
		this.columnGroupSize = 1;
		this.jsonstat = jsonstat;
		this.table = document.createElement('table');
	}

	render() {
		this.renderHeaders();
		this.renderRows();

		return this.table;
	}

	renderRow(idx) {
		let row, cell,
				dimId = 0,
				numCols = this.jsonstat.numDataCols;

		row = this.table.insertRow(idx);
		cell = row.insertCell(0);
		cell.append(this.jsonstat.getLabel(dimId, idx));
		for (let i = 0; i < numCols; i++) {
			let z;

			cell = row.insertCell(-1);
			z = i + 6;
			cell.append(this.jsonstat.data.value[z]);
		}
	}

	renderRows() {
		let labelColumnIdx = 0,
				numRows = this.jsonstat.data.size[labelColumnIdx];

		for (let i = 0; i < numRows; i++) {
			this.renderRow(i);
		}
	}

	renderHeaders() {

	}

	renderLabelColumns() {

	}

}