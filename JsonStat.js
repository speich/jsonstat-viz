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
	 * Return list with the sizes of the dimensions.
	 * @param {Boolean} excludeSizeOne exclude dimensions of size one
	 * @return {Array}
	 */
	getDimensionSizes(excludeSizeOne = true) {
		let size = excludeSizeOne ? 1 : 0;

		return this.data.size.filter(value => {
			return value > size;
		});
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
		let dim, index, id, label, keys;

		dim = this.data.dimension[this.getId(dimIdx)];
		index = dim.category.index;
		if (index) {
			id =  Array.isArray(index) ? index[labelIdx] : this._categoryIdFromObject(index, labelIdx);
			label = dim.category.label ? dim.category.label[id] : id;
		}
		else {  // e.g. constant dimension with single category and no index, label is required
			keys = Object.keys(dim.category.label);
			label = dim.category.label[keys[0]];
		}

		return this.escapeHtml(label);
	}

	_categoryIdFromObject(obj, labelIdx) {

		return Object.keys(obj).find(key => obj[key] === labelIdx);
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