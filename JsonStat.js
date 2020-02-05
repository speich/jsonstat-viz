/**
 * Class to work with jsonstat.org files.
 */
export class JsonStat {

	/**
	 * @property {Object} jsonstat
	 * @param {Object} jsonstat
	 */
	constructor(jsonstat) {
		this.data = jsonstat;
	}

	/**
	 * Returns the id of a dimension by its index.
	 * @param dimIdx dimension index
	 * @return {*}
	 */
	getId(dimIdx) {
		return this.data.id[dimIdx];
	}

	/**
	 * Returns the label of a dimension by its index.
	 * @param dimIdx dimension index
	 * @return {void|string}
	 */
	getLabel(dimIdx) {
		let dim;

		dim = this.data.dimension[this.getId(dimIdx)];

		return this.escapeHtml(dim.label);
	}

	/**
	 * Returns the number of dimensions.
	 * @return {Number}
	 */
	getNumDimensions() {

		return this.data.size.length;
	}

	/**
	 * Returns the number of values.
	 * @return {Number}
	 */
	getNumValues() {

		return this.data.value.length;
	}

	/**
	 * Returns the label of a category of a dimension by dimension index and category index.
	 * @param {Number} dimIdx dimension index
	 * @param {Number} [labelIdx] label index
	 * @return {void|String}
	 */
	getCategoryLabel(dimIdx, labelIdx = null) {
		let dim, id, label, keys;

		dim = this.data.dimension[this.getId(dimIdx)];
		if (dim.category.index) {
			id = dim.category.index[labelIdx];
			label = dim.category.label[id];
		}
		else {  // e.g. constant dimension with single category and no index, label is required
			keys = Object.keys(dim.category.label);
			label = dim.category.label[keys[0]];
		}

		return this.escapeHtml(label);
	}

	/**
	 * Escape a string so it can be safely inserted into html.
	 * @param {String} text
	 * @return {void|String}
	 */
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