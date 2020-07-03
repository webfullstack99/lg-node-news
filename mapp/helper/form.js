const _helper = require(__path.helper+'/helper');
class Form{
    static customCheckbox = (data) => {
        let id = data.id || '';
        let name = data.name || '';
        let value = data.value || '';
        return '<div class="custom-control custom-checkbox d-inline">\
                    <input type="checkbox" class="custom-control-input" id="'+id+'" name="'+name+'" value="'+value+'" />\
                </div>';
    }

    static label  = (name, value = '', attr = {}) => {
        let attrStr    = '';
        for (let key in attr){
            attrStr    += `${key}="${attr[key]}" `;
        }
        let xhtml       = `<label for="${name}" ${attrStr}>${value}</label>`;
        return xhtml;
    }

    static label  = (name, value = '', attr = {}) => {
        let attrStr    = '';
        for (let key in attr){
            attrStr    += `${key}="${attr[key]}" `;
        }
        let xhtml       = `<label for="${name}" ${attrStr}>${value}</label>`;
        return xhtml;
    }
    
    static text  = (name, value = '', attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<input type="text" name="${name}" ${attrStr} value="${value}" />`;
        return xhtml;
    }

    static file  = (name, attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<input type="file" name="${name}" ${attrStr}" />`;
        return xhtml;
    }
    
    static hidden  = (name, value = '', attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<input type="hidden" name="${name}" ${attrStr} value="${value}" />`;
        return xhtml;
    }
    
    static number  = (name, value = '', attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<input type="number" name="${name}" ${attrStr} value="${value}" />`;
        return xhtml;
    }
    
    static textarea  = (name, value = '', attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<textarea name="${name}" ${attrStr}>${value}</textarea>`;
        return xhtml;
    }

    static label  = (name, value = '', attr = {}) => {
        let attrStr    = '';
        for (let key in attr){
            attrStr    += `${key}="${attr[key]}" `;
        }
        let xhtml       = `<label for="${name}" ${attrStr}>${value}</label>`;
        return xhtml;
    }

    static select = (name, selectData = {}, selected = 'default', attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<select name="${name}" ${attrStr}>`;
        for (let key in selectData){
            let selectedStr     = (selected == key) ? 'selected="selected"' : '';
            let optionStr = `<option ${selectedStr} value="${key}">${selectData[key]}</option>`;
            xhtml        += optionStr;
        }
        xhtml           += '</select>';
        return xhtml;         
    }

    static radioGroup = (name, radioData = {}, selected = 'default', attr = {}) => {
        let template = conf.template.format_button.groupAcp;
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<div ${attrStr} data-toggle="buttons">`;
        for (let key in radioData){
            let selectedStr     = (selected == key) ? 'active focus' : '';
            let checkedStr      = (selected == key) ? 'checked="checked"' : '';
            let optionStr = `<label ${selectedStr} class="${template[key].classes} ${selectedStr}">
                                <input type="radio" ${checkedStr} name="${name}" value="${key}"> ${radioData[key]}
                            </label>`;
            xhtml        += optionStr;
        }
        xhtml           += '</div>';
        return xhtml;         
    }
    
    static password  = (name, value = '', attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        let xhtml       = `<input type="password" name="${name}" ${attrStr} value="${value}" />`;
        return xhtml;
    }
    
    static submit  = (value = '', attr = {}) => {
        let attrStr     = this.getAttrString(attr);
        return `<input type="submit" value="${value}" ${attrStr} />`;
    }

    // ['status',...]
    static showSaveMultiSelect(fieldArray, controller){
        let template    = conf.template.format_button;
        let selectData  = {default: 'Select action...'};
        for (let field of fieldArray){
            let link  = `${displayConf.prefix.admin}/${controller}/${conf.route.save_multi}/${field}`;
            switch (field){
                case 'status':
                    let currentTemplate = template[field];
                    let statusList  = conf.template.status_select;
                    for (let value of statusList){
                        let option  = link+'/'+value;
                        selectData[option]   = `Change ${field} (${currentTemplate[value].content.toLowerCase()})`;
                    }
                    break;
                case 'delete':
                    let option  = link;
                    selectData[option]   = 'Delete';
                    break;
            }
        }
        let selectString    = this.select('', selectData, null, {id: 'save-multi', class: 'form-control'});   
        return selectString;
    }

    static getAttrString(attr){
        let attrStr = '';
        for (let key in attr){
            attrStr    += `${key}="${attr[key]}" `;
        }
        return attrStr;
    }

    // names['status', 'display']
    static createSelectData(names = [], autoPlaceHolders = [], placeholders = []){
        if (names.length > 0){
            let selects     = {};
            let template    = conf.template.format_button;
            for (let key in names){
                selects[names[key]] = {};
                let optList     = conf.template[names[key]+'_select'];
                if (autoPlaceHolders[key]){
                    let defaultValue = (placeholders[key]) ? `Select ${placeholders[key]}` : `Select ${names[key]}`;
                    selects[names[key]]   = {default: defaultValue};
                }
                for (let value of optList){
                    let currentTemplate     = template[names[key]][value];
                    selects[names[key]][value]    = currentTemplate.content;
                }
            }
            return selects;
        }
    }

    // data[{_id: .., _name: ...}], value['id'] | ['id', 'name'] 
    static cvertToSelectData(data, placeholder = false, defaultKey = 'default'){
        let selectData = {};
        if (placeholder){
            selectData = {[defaultKey]: `Select ${placeholder}`};
        }
        for (let item of data) selectData[item._id] =  item.name;
        return selectData;
    }

    static cvertToChangeSelectData(data){
        let selectData = {};
        for (let key in data.selectData){
            if (key != 'default'){
                let link   = _helper.getChangeLink({
                    field: data.field,
                    type: key,
                    id: data.id,
                    controller: data.controller,
                });
                selectData[link] = data.selectData[key];
            }
        }
        return selectData;
    }

    static createValueStringFromArray(data, keyArr, seperate = '||'){
        let tempArr = [];
        for (let key of keyArr){
            if (data[key]) tempArr.push(data[key]);
        }
        return tempArr.join(seperate);
    }

    static createValueStringFromObject(data, seperate = '||'){
        if (typeof data != 'string') data = data.id + seperate + data.name; 
        return data;
    }
}
module.exports  = Form;