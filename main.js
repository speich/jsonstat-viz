import { RendererTable } from './RendererTable.js';
import { JsonStatReader } from './JsonStatReader.js';
import {utilArray} from "./utilArray.js";

let app = {
  reader: null,

  resources: [
    ['vorrat.json', 'Vorrat'],
    ['stammzahl.json', 'Stammzahl'],
    ['waldflaeche.json', 'Waldfläche'],
    ['jungwald.json', 'Jungwald'],
    ['vorrat5dim.json', 'Test 5 Dim'],
    ['https://json-stat.org/samples/oecd.json', 'OECD'],
    ['https://json-stat.org/samples/canada.json', 'Canada'],
    ['https://json-stat.org/samples/galicia.json', 'Galicia']
  ],

  /**
   * Loads the resource and returns the json.
   * @param {string} url
   * @return {Promise<object>}
   */
  loadJsonStat: function(url) {
    return fetch(url).then(response => {
      return response.json();
    });
  },

  /**
   * Creates a select element from the passed data.
   * @param {string} id id attribute
   * @param {array} data 2-dim array
   * @return {HTMLSelectElement}
   */
  createSelect: function(id, data) {
    let option, select;

    select = document.createElement('select');
    select.id = id;
    select.autocomplete = 'off';
    data.forEach(i => {
      option = document.createElement('option');
      option.value = i[0];
      option.text = i[1];
      select.add(option);
    });

    return select;
  },

  /**
   * Wrap select element with a label.
   * @param {string} label
   * @param {HTMLSelectElement} select
   * @return {HTMLLabelElement}
   */
  wrapInLabel: function(label, select) {
    let el = document.createElement('label');

    el.innerHTML = label;
    el.appendChild(select);

    return el;
  },

  /**
   * Creates the select data for the number of row dimensions.
   * @return {Array}
   */
  createOptionData: function() {
    let len = this.reader.getDimensionSizes().length,
      data = Array(len);

    return Array.from(data, (e, i) => [i, i]);
  },

  removeTable: function() {
    let table = document.querySelector('.jst-viz');

    table.parentNode.removeChild(table);
  },

  removeSelect: function(select) {
    select.parentNode.removeChild(select);
  },

  createTable: function(numRowDim) {
    let renderer, table;

    renderer = new RendererTable(this.reader, numRowDim);
    renderer.useRowSpans = document.getElementById('fldUseRowSpans').checked;
    table = renderer.render();
    document.body.appendChild(table);
  },

  /**
   *
   */
  initForm: function(numRowDim) {
    let el;

    el = document.createElement('input');
    el.id = 'fldUseRowSpans';
    el.type = 'checkbox';
    el.checked = true;
    el = this.wrapInLabel('render with rowspans', el);
    document.body.appendChild(el);
    document.body.append(document.createElement('br'));

    el = this.createSelectSource();
    el.options[0].selected = true;
    el = this.wrapInLabel('select source', el);
    document.body.appendChild(el);

    el = this.createSelectNumDim();
    el.options[numRowDim].selected = true;
    el = this.wrapInLabel('row dimensions', el);
    document.body.appendChild(el);

  },

  update: function(json) {
    let el, numRowDim = 1;

    this.reader = new JsonStatReader(json);

    el = document.getElementById('numDim');
    this.removeSelect(el);
    el = this.createSelectNumDim();
    el.options[numRowDim].selected = true;
    document.body.appendChild(el);

    this.removeTable();
    this.createTable(numRowDim);
  },

  createSelectSource: function() {
    let el;

    el = this.createSelect('source', this.resources);

    el.addEventListener('change', evt => {
      app.loadJsonStat(evt.target.value).then((json) => {
        app.update(json);
      });
    });

    return el;
  },

  createSelectNumDim: function() {
    let el, data;

    data = this.createOptionData();
    el = this.createSelect('numDim', data);

    el.addEventListener('change', (evt) => {
      app.removeTable();
      app.createTable(parseInt(evt.target.value));
    });

    return el;
  },

  /**
   *
   * @param {Object} json
   * @param numRowDim number of row dimensions
   */
  init: function(json, numRowDim) {
    this.reader = new JsonStatReader(json);
    this.initForm(numRowDim);
    this.createTable(numRowDim);

    let rowIdx = 6;
    let shape = this.reader.data.size;
    let stride = utilArray.stride(shape);
    console.log('rowIdx', rowIdx)
    console.log(shape, stride);

    let valFromTo = utilArray.rowToLinear(rowIdx, shape);
    console.log(valFromTo);

    let sub = utilArray.linearToSub(shape, valFromTo[0] + 2);
    console.log(sub);

    // get the category label of all dimensions at this value index.
    let label = [];
    for (let i = 0; i < sub.length; i++) {
      let dimId = this.reader.data.id[i];
      let categIdx = sub[i];
      let categId = this.reader.data.dimension[dimId].category.index[categIdx];
      label[i] = this.reader.data.dimension[dimId].category.label[categId];
    }
    console.log(label);
  }
};

app.loadJsonStat('vorrat.json').then((json) => {
  let numRowDim = 2;

  app.init(json, numRowDim);
});
// TODO: should also work with object instead of array
//app.loadJsonStat('https://json-stat.org/samples/canada.json').then(app.init.bind(app));