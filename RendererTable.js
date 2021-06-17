import { utilArray } from './utilArray.js';

/**
 * Renders json-stat data as a html table.
 *
 * A table consists of a number of dimensions that are used to define the rows of the two-dimensional table
 * (referred to as row dimensions) and a number of dimensions that are used to define the columns of the table
 * (referred to as col dimensions). Each row dimension creates its own pre column, containing only category labels,
 * whereas the column dimensions contain the actual values.
 *
 * Setting the property numRowDim (number of row dimensions) defines how many of the dimensions are use for the rows,
 * beginning at the start of the ordered size array of the reader schema. Remaining dimensions are used for columns.
 * Dimensions of length one are excluded.
 *
 * Setting the property noLabelLastDim will skip the row in the table heading containing the labels of the last
 * dimension.
 * Note: When rendering a table with rowspans (setting the useRowSpans property to true),
 * applying css might become complicated because of the irregular number of cells per row.
 * @see www.json-stat.org
 */
export class RendererTable {

  /**
   * @property {Array} colDims dimensions used for columns containing values
   * @property {Array} rowDims dimensions used for rows containing labels, that make up the rows
   * @property {JsonStatReader} jsonStatReader jsonStatReader schema
   * @property {Number} numRowDim number of row dimensions
   * @property {HTMLTableElement} table
   * @property {Boolean} nolabelLastDim render the row with labels of last dimension? default = true
   * @property {Boolean} useRowSpans render the table with rowspans ? default = true
   * @property {Number} numOneDim number of dimensions of size one
   * @property {Number} numValueCols number of columns with values
   * @property {Number} numLabelCols number of columns with labels
   * @property {Number} numHeaderRows number of row headers
   *
   * @param {JsonStatReader} jsonStatReader jsonStatReader schema
   * @param {Number} numRowDim number of row dimensions
   */
  constructor(jsonStatReader, numRowDim) {
    let dims = jsonStatReader.getDimensionSizes();

    this.reader = jsonStatReader;
    this.numRowDim = numRowDim;
    this.rowDims = this.getDims(dims, 'row');
    this.colDims = this.getDims(dims, 'col');
    this.table = document.createElement('table');
    this.table.classList.add('jst-viz', 'numRowDims' + this.rowDims.length, 'lastDimSize' + dims[dims.length - 1]);
    this.noLabelLastDim = true;
    this.useRowSpans = true;
  }

  /**
   * Initialize properties before rendering the table.
   */
  init() {
    // cache some often used numbers before rendering table
    let dimsAll = this.reader.getDimensionSizes(false);

    this.numOneDim = dimsAll.length - this.rowDims.length - this.colDims.length;
    this.numValueCols = this.colDims.length > 0 ? utilArray.product(this.colDims) : 1;
    this.numLabelCols = this.rowDims.length;
    this.numHeaderRows = this.colDims.length > 0 ? this.colDims.length * 2 : 1; // add an additional row to label each dimension
  }

  /**
   * Returns the dimensions that can be used for rows or cols.
   * Constant dimensions (e.g. of length 1) are excluded.
   * @param {Array} dims
   * @param {String} type 'row' or 'col'
   */
  getDims(dims, type) {

    return type === 'row' ? dims.slice(0, this.numRowDim) : dims.slice(this.numRowDim);
  }

  /**
   * Renders the data as a html table.
   * Reads the value array and renders it as a table.
   * @return {HTMLTableElement}
   */
  render() {
    this.init();
    this.caption();
    this.rowHeaders();
    this.rows();

    return this.table;
  }

  /**
   * Creates the table head and appends header cells, row by row to it.
   */
  rowHeaders() {
    let row, tHead;

    tHead = this.table.createTHead();
    for (let rowIdx = 0; rowIdx < this.numHeaderRows; rowIdx++) {
      if (this.noLabelLastDim === false || rowIdx !== this.numHeaderRows - 2) {
        row = tHead.insertRow();
        this.headerLabelCells(row, rowIdx);
        this.headerValueCells(row, rowIdx);
      }
    }
  }

  /**
   * Creates the table body and appends table cells row by row to it.
   */
  rows() {
    let tBody, row;

    tBody = this.table.createTBody();
    for (let offset = 0, len = this.reader.getNumValues(); offset < len; offset++) {
      if (offset % this.numValueCols === 0) {
        row = tBody.insertRow();
        this.labelCells(row);
      }
      this.valueCell(row, offset);
    }
  }

  /**
   * Creates the cells for the headers of the label columns
   * @param {HTMLTableRowElement} row
   * @param rowIdx
   */
  headerLabelCells(row, rowIdx) {
    for (let k = 0; k < this.numLabelCols; k++) {
      let cell, label = null, scope = null;

      if (rowIdx === this.numHeaderRows - 1) { // last header row
        label = this.reader.getLabel(this.numOneDim + k);
        scope = 'col';
      }
      cell = RendererTable.headerCell(label, scope);
    }
  }

  /**
   * Creates the cells for the headers of the value columns.
   * @param {HTMLTableRowElement} row
   * @param rowIdx
   */
  headerValueCells(row, rowIdx) {
    let cell, z, idx, dimIdx, f, catIdx, label, colspan, scope;

    if (this.colDims.length === 0) {
      cell = RendererTable.headerCell();

      return;
    }

    idx = Math.floor(rowIdx / 2); // 0,1,2,3,... -> 0,0,1,1,2,2,...
    dimIdx = this.numOneDim + this.numRowDim + idx;
    f = utilArray.productUpperNext(this.colDims, idx);
    for (let i = 0; i < this.numValueCols; i++) {
      colspan = null;
      scope = 'col';
      z = rowIdx % 2;
      if (z === 0) {
        label = this.reader.getLabel(dimIdx);
      } else {
        catIdx = Math.floor((i % f[0]) / f[1]);
        label = this.reader.getCategoryLabel(dimIdx, catIdx);
      }
      if (f[z] > 1) {
        colspan = f[z];
        i += colspan - 1; // colspan - 1 -> i++ follows
        scope = 'colgroup';
      }
      cell = RendererTable.headerCell(label, scope, colspan);
    }
  }

  /**
   * Appends cells with labels to the row.
   * Inserts the label as a HTMLTableHeaderElement at the end of the row.
   * @param {HTMLTableRowElement} row
   */
  labelCells(row) {
    let cell, rowIdxBody, f, catIdx, label, rowspan, scope;

    rowIdxBody = this.rowIdxBody(row);
    for (let i = 0; i < this.numLabelCols; i++) {
      f = utilArray.productUpperNext(this.rowDims, i);
      catIdx = Math.floor(rowIdxBody % f[0] / f[1]);
      label = rowIdxBody % f[1] === 0 ? this.reader.getCategoryLabel(this.numOneDim + i, catIdx) : null;
      rowspan = null;
      scope = 'row';
      if (this.useRowSpans && f[1] > 1) {
        rowspan = f[1];
        scope = 'rowgroup';
      }
      if (rowIdxBody % f[1] === 0 || !this.useRowSpans) {
        cell = RendererTable.headerCell(label, scope, null, rowspan);
        this.labelCellCss(cell, i, rowIdxBody);
      }
    }
  }

  /**
   * Sets the css class of the body row
   * @param {HTMLTableCellElement} cell
   * @param {String} cellIdx
   * @param {String} rowIdxBody
   */
  labelCellCss(cell, cellIdx, rowIdxBody) {
    let css, f, modulo;

    f = utilArray.productUpperNext(this.rowDims, cellIdx);
    modulo = rowIdxBody % f[0];
    css = 'rowdim' + (cellIdx + 1);
    if (modulo === 0) {
      cell.classList.add(css, 'first');
    } else if (modulo === f[0] - f[1]) {
      css = 'rowdim' + (cellIdx + 1);
      cell.classList.add(css, 'last');
    }
  }

  /**
   * Appends cells with values to the row.
   * Inserts a HTMLTableCellElement at the end of the row with a value taken from the values at given offset.
   * @param {HTMLTableRowElement} row
   * @param offset
   */
  valueCell(row, offset) {
    let cell, stat = this.reader;

    cell = row.insertCell();
    cell.textContent = stat.data.value[offset]; // not need to escape
  }

  /**
   * Create and returns a header cell element.
   * @param {HTMLTableRowElement} row
   * @param {String} [str] cell content
   * @param {String} [scope] scope of cell
   * @param [colspan] number of columns to span
   * @param [rowspan] number of rows to span
   * @return {HTMLTableCellElement}
   */
  static headerCell(row, str = null, scope = null, colspan = null, rowspan = null) {
    let cell = document.createElement('th');

    if (scope !== null) {
      cell.scope = scope;
    }
    if (str !== null) {
      cell.innerHTML = str;
    }
    if (colspan !== null) {
      cell.colSpan = colspan;
    }
    if (rowspan !== null) {
      cell.rowSpan = rowspan;
    }

    return row.insertCell();
  }

  /**
   * Creates and inserts a caption.
   * @return {HTMLTableCaptionElement}
   */
  caption() {
    let caption = this.table.createCaption();

    caption.innerHTML = this.reader.escapeHtml(this.reader.data.label);

    return caption;
  }

  /**
   * Returns the row index for body rows only.
   * The html rowIdx attribute includes the rows from the table header. This function returns an index
   * started at the first body row.
   * @param {HTMLTableRowElement} row
   * @return {number} row index
   */
  rowIdxBody(row) {
    let numVirtRow = this.noLabelLastDim ? 1 : 0;

    return row.rowIndex - this.numHeaderRows + numVirtRow;
  }
}