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
     * @param {number[]} values
     * @param {number} idx element index
     * @return {number[]}
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
     * @param {number[]} values
     * @param {number} idx element index
     * @return {number}
     */
    productUpper(values, idx) {
        let num = 1,
            len = values.length;

        for (let i = idx; i < len; i++) {
            num *= values[i];
        }

        return num;
    },

    /**
     * Convert a linear index (row major) to subindexes.
     * Creates an array of subscripts from the shape,
     * e.g. when called repeatedly from idx[0,1,2,3,...a48] with shape[4,2,3,2], it creates the following sequence:
     * -> [0,0,0,0], [0,0,0,1], [0,0,1,0], [0,0,1,1], [0,0,2,0], [0,0,2,1], [0,1,0,0], [0,1,0,1], ..., [3,1,2,1]
     * @see https://stackoverflow.com/questions/46782444/how-to-convert-a-linear-index-to-subscripts-with-support-for-negative-strides
     * @param {array} shape
     * @param {number} idx
     * @return {array}
     */
    linearToSub(shape, idx) {
        let i = shape.length - 1,
            sub = [];
        for (; i >= 0; i--) {
            let s = idx % shape[i];
            idx -= s;
            idx /= shape[i];
            sub[i] = s;
        }

        return sub; //array_reverse(sub);
    },

    /**
     * Convert subindexes to a linear index.
     * Converts the subscripts back to a linear index (row major),
     * @param {number[]} strides
     * @param {number[]} sub subscripts
     * @return {number}
     */
    subToLinear(strides, sub) {
        let n = 0,
            len = strides.length,
            idx = 0;

        for (; n < len; n++) {
            idx += sub[n] * strides[n];
        }

        return idx;
    },

    /**
     * Calculate strides from the shape.
     * @see https://numpy.org/doc/stable/reference/generated/numpy.ndarray.strides.html
     * @param {number[]} shape
     * @return {number[]} strides
     */
    stride(shape) {
        let len = shape.length,
            size = 1,
            i = len - 1,
            stride = [];

        for (; i >= 0; --i) {
            stride[i] = size;
            size *= shape[i];
        }

        return stride;
    },

    /**
     * Convert the row index to the linear index (row major).
     * Returns the start and the end index of the row.
     * @param {number} rowIdx
     * @param {number[]} shape
     * @return {number[]} array with start and end index
     */
    rowToLinear(rowIdx, shape) {
        let prod, from, to, i = shape.length - 2;

        prod = this.productUpper(shape, i);
        from = (rowIdx - 1) * prod;
        to = from + prod - 1;

        return [from, to];
    }
};