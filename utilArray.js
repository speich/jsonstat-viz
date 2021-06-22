export let utilArray = {
  /**
   * Calculate the product of all array elements.
   * @param {Array} values
   * @return {Number}
   */
  product(values) {
    if (values.length > 0) {

      return values.reduce((acc, current) => acc * current);
    } else {

      return 0;
    }
  },

  /**
   * Calculate two products from array values.
   * The first returned value is the product of all values with an element index equal or higher than the passed one, the
   * second is the product of all values with an index higher. If it is the last element then the product is 1.
   * @param {Array} values
   * @param idx element index
   * @return {Array}
   * @private
   */
  productUpperNext(values, idx) {
    let f = [];

    f[0] = this.productUpper(values, idx);
    f[1] = idx < values.length ? this.productUpper(values, idx + 1) : 1;

    return f;
  },

  /**
   * Calculates the product of all array values with an element index equal or higher than the passed one.
   * @param {Array} values
   * @param idx element index
   * @return {number}
   */
  productUpper(values, idx) {
    let num = 1,
      len = values.length;

    for (let i = idx; i < len; i++) {
      num *= values[i];
    }

    return num;
  }
};