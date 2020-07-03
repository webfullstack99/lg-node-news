module.exports  = {
    // searching{field, value}, options{field, value}
    highlight: function(searching, options){
        let result  = options.value;
        if (searching.field == options.field || searching.field == 'all'){
            result  = this.run(searching.value, options.value);
        }
        return result;
    },
    run: (search_value, content) => {
        //search_value = search_value.split(' ').join('.*');
        content = content.replace(new RegExp('('+search_value+')', 'igmsu'), '<span style="background: yellow;">$1</span>');
        return content;
    }
}