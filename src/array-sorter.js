const arraySorter = function(list) {
    this.sortBy = function (props) {
        /*props = {
            desc: true,
            keys: ['comments', 'cr_date']
        }*/
        let sorted = [];
        if ('keys' in props) {
            if (!(props.keys instanceof Array)) {
                props.keys = [props.keys];
            }

            props.keys.forEach(key => {
                if (sorted.length === 0) {
                    sorted = list;
                }
                sorted = sorted.sort(function (next, current) {
                    if (!isNaN(current[key]) && !isNaN(next[key])) {
                        //number sorting
                        return next[key] - current[key];
                    }

                    if (!isNaN(new Date(current[key]).getDate())) {
                        //date sorting
                        let $current = new Date(current[key]);
                        let $next = new Date(0);
                        if (!isNaN(new Date(next[key]).getDate())) {
                            $next = new Date(next[key]);
                        }

                        if ($current > $next) return -1;
                        if ($current < $next) return 1;
                        return 0;
                    }

                    //alphabetical sorting
                    if (current[key].toLowerCase() > next[key].toLowerCase()) return -1;
                    if (current[key].toLowerCase() < next[key].toLowerCase()) return 1;
                    return 0;
                });
            });

            if ('desc' in props && props.desc) {
                sorted = sorted.reverse();
            }
        }

        return sorted;
    };
};

module.exports = list => new arraySorter(list);
