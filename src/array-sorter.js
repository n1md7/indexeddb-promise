/**
 * @typedef {{[key: string]: string | number | boolean | null | undefined}} ListItem
 */

/**
 * @description Array sorter
 * @param {ListItem[]} listToBeSorted
 */
const arraySorter = function (listToBeSorted) {
  /**
   * @description Sorts array by key property
   * @param {{
   *   keys: string | string[],
   *   desc?: boolean,
   * }} props
   * @returns {*[]}
   */
  this.sortBy = (props) => {
    /** @type {{sorted: ListItem[]}} */
    const ref = { sorted: listToBeSorted };
    if (props.hasOwnProperty('keys')) {
      if (!Array.isArray(props.keys)) {
        /** @type {string[]} */
        props.keys = [props.keys];
      }

      props.keys.forEach(
        /** @param {string} key */
        (key) => {
          ref.sorted = ref.sorted.sort(
            /**
             * @param {ListItem} next
             * @param {ListItem} current
             * @returns {number}
             */
            function (next, current) {
              // Sorting by number key
              if (!isNaN(current[key]) && !isNaN(next[key])) {
                return next[key] - current[key];
              }

              // Sorting by date key
              if (!isNaN(new Date(current[key]).valueOf())) {
                const $current = new Date(current[key]).valueOf();
                const $next = { val: new Date(0).valueOf() };
                if (!isNaN(new Date(next[key]).valueOf())) {
                  $next.val = new Date(next[key]).valueOf();
                }

                if ($current > $next.val) return -1;
                if ($current < $next.val) return 1;
                return 0;
              }

              // Alphabetical sorting
              if (current[key].toLowerCase() > next[key].toLowerCase()) return -1;
              if (current[key].toLowerCase() < next[key].toLowerCase()) return 1;
              return 0;
            },
          );
        },
      );

      if (props.hasOwnProperty('desc') && props.desc) {
        ref.sorted = ref.sorted.reverse();
      }
    }

    return ref.sorted;
  };
};

/**
 * @description Singleton pattern for Array sorter
 * @param {ListItem[]} list
 * @returns {arraySorter}
 */
module.exports = (list) => new arraySorter(list);
