export const binarySearchIntervals = (intervals, index, right = false) => {
    let low = 0;
    let high = intervals.length - 1;
    let mid = NaN;
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (intervals[mid][0] <= index && index < intervals[mid][1]) return mid;
        else if (intervals[mid][1] < index) low = mid + 1;
        else high = mid - 1;
    }

    if (right) {
        return low;
    }

    return -1;
};

export const binarySearch = (array, index, left = false) => {
    let low = 0;
    let high = array.length - 1;
    let mid = NaN;
    while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (array[mid] === index) return mid;
        else if (array[mid] < index) low = mid + 1;
        else high = mid - 1;
    }

    if (left) {
        return high;
    }

    return -1;
};


/**
 * Finds the last element in the array which is not smaller than key
 * @param array
 * @param value
 * @return {number}
 */
export const binarySearchLowerBound = (array, value) => {
    let low = 0;
    let high = array.length - 1;
    let mid;
    while (low <= high) {
        mid = (low + high) >> 1;
        if (array[mid] === value) {
            return mid;
        }
        else if (array[mid] < value) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return high;
};

/**
 * Finds the first element in the array which is greater than key
 * @param array
 * @param value
 * @return {number}
 */
export const binarySearchUpperBound = (array, value) => {
    let low = 0;
    let high = array.length - 1;
    let mid;
    while (low <= high) {
        mid = (low + high) >> 1;
        if (array[mid] === value) {
            return mid;
        }
        else if (array[mid] < value) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return low > array.length - 1 ? -1 : low;
};


// maybe use js log? idk need to check
export const getLog = (n) => {
    let res = 1;
    while ((1 << res) <= n) ++res;
    return res;
};

export const find = (source, needle, method = 'indexOf') => {
    const res = [];
    let cur = -1;

    do {
        cur = source[method](needle, cur + 1);
        if (cur === -1)
            break;
        res.push([cur, needle]);
    } while (true);

    return res;
};

// for debugging
export const reshapeObject = (object) => {
    const len = object[Object.keys(object)[0]].length;
    const ret = [];
    for (let i = 0; i < len; i++) {
        let col = {};
        for (let key in object) {
            col[key] = object[key][i]
        }
        ret.push(col)
    }
    return ret;
};
