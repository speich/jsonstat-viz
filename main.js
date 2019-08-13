import {RendererTable} from '/RendererTable.js';
import {JsonStat} from '/JsonStat.js';

let app = {

	loadJsonStat: function() {
		let url = 'stammzahl.json';

		return fetch(url).then(response => {
			return response.json();
		});
	},


	init: function() {

		this.loadJsonStat().then(json => {
			let table, renderer, reader;

			reader = new JsonStat(json);
			renderer = new RendererTable(reader);

			table = renderer.render();
			document.body.appendChild(table);
		});
	}
};

app.init();