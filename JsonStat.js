export class JsonStat {
	constructor(jsonstat) {
		this.data = jsonstat;
	}

	getId(dimIdx) {
		return this.data.id[dimIdx];
	}

	getLabel(dimIdx) {
		let dim;

		dim = this.data.dimension[this.getId(dimIdx)];

		return this.escapeHtml(dim.label);
	}

	getNumDimensions() {

		return this.data.size.length;
	}

	getNumValues() {

		return this.data.value.length;
	}

	getCategoryLabel(dimIdx, labelIdx) {
		let dim, id, label;

		dim = this.data.dimension[this.getId(dimIdx)];
		id = dim.category.index[labelIdx];
		label = dim.category.label[id];

		return this.escapeHtml(label);
	}

	escapeHtml(text) {
		//return  text;
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