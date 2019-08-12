export class JsonStat {
	constructor(jsonstat) {
		this.data = jsonstat;
		this.numDataCols = this.getNumDataCols();
	}

	getLabel(dimIdx, labelIdx) {
		let dim, id, label;

		id = this.data.id[dimIdx];
		dim = this.data.dimension[id];
		id = dim.category.index[labelIdx];
		label = dim.category.label[id];

		return this.escapeHtml(label);
	}

	getNumDataCols() {

		return this.data.size[1] * this.data.size[2];
	}


	escapeHtml(text) {
		// @see https://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript/4835406#4835406
		let map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};

		return text.replace(/[&<>"']/g, function(m) {
			return map[m];
		});
	}
}