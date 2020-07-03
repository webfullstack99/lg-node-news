module.exports  = {
    objMerge: function (obj1, obj2){
        let extend = require('node.extend');
        return extend(true, obj1, obj2);
    },
}