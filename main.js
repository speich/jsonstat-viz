import {RendererTable} from '/RendererTable.js';
import {JsonStat} from '/JsonStat.js';

let app = {
	reader: null,

	loadJsonStat: function(url) {
		return fetch(url).then(response => {
			return response.json();
		});
	},

	createSelect: function(numDims) {
		let option, select;

		select = document.createElement('select');
		select.id = 'numDim';
		for (let i = 0; i < numDims + 1; i++) {
			option = document.createElement('option');
			option.text = i;
			option.value = i;
			select.add(option);
		}
		select.addEventListener('change', (evt) => {
			this.removeTable();
			this.createTable(parseInt(evt.target.value));
		});

		document.body.appendChild(select);
	},

	removeTable: function() {
		let table = document.querySelector('table');

		table.parentNode.removeChild(table);
	},

	removeSelect: function() {
		let select = document.getElementById('numDim');

		select.parentNode.removeChild(select);
	},

	createTable: function(numRowDim) {
		let renderer, table;

		renderer = new RendererTable(this.reader);
		renderer.numRowDim = numRowDim;
		table = renderer.render();
		document.body.appendChild(table);
	},

	init: function(json) {
		this.reader = new JsonStat(json);
		this.createSelect(this.reader.getNumDimensions());
		this.createTable(2);
	}
};

document.getElementById('source').addEventListener('change', evt => {
	app.removeSelect();
	app.removeTable();
	app.loadJsonStat(evt.target.value).then(app.init.bind(app));
});

app.loadJsonStat('vorrat.json').then(app.init.bind(app));
//app.loadJsonStat('https://json-stat.org/samples/canada.json').then(app.init.bind(app));