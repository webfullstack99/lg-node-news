const _util = require('util');

const moment = require('moment-timezone');

const _helper = require(__path.helper+'/helper');
const _form = require(__path.helper+'/form');
const _frontendTemplate = require(__path.config+'/frontend_template');
class Template{
    
    // SHOW XHTML ===================
    // {status, id}
    static showItemAttrButton(data){
         let link   = _helper.getChangeLink({
            field: data.field,
            type: data.value,
            id: data.id,
            controller: data.controller,
        })
        let template    = conf.template.format_button[data.field][data.value];
        if (!template) template = conf.template.format_button.undefined;
        let classes = template.classes;
        if (data.field == 'groupAcp'){
            let pattern     = new RegExp('btn\-outline\-([a-z]+)', 'g')
            classes = template.classes.replace(pattern, 'btn-$1');
        }
        let xhtml       = '<a href="'+link+'" field="'+data.field+'" class="'+classes+'">'+template.content+'</a>';
        return xhtml;
    }

    static showItemOrdering(data){
        let link   = _helper.getChangeLink({
           field: 'ordering',
           type: data.ordering,
           id: data.id,
           controller: data.controller,
       })
       let xhtml       = '<input link="'+link+'" field="ordering" type="number" class="form-control" step="5" min="5" max="100" value="'+data.ordering+'"></input>';
       return xhtml;
    }

    static showItemSelect(data){
        data.selectData.all = `No ${data.field}`;
        let selectData = _form.cvertToChangeSelectData({
            controller: data.controller,
            field: data.field,
            id: data.id,
            selectData: data.selectData,
        });
        
        let selected = _helper.getChangeLink({
            controller: data.controller,
            field: data.field,
            type: data.value,
            id: data.id,
        })
        let result = _form.select('', selectData, selected, data.attr);
        return result;
    }

    // {time, user}
    static showItemHistory(data){
        let historyArr  = [];

        if (data.username)
            historyArr.push('<i class="fal fa-user fa-fw"></i>&nbsp;'+data.username+'<br>');

        if (data.time){
            let time    = moment.tz(data.time, conf.time.time_zone).format(conf.time.short_time_format);
            historyArr.push('<i class="fal fa-clock fa-fw"></i>&nbsp;'+time+'<br>');
        }
        let xhtml       = `<p>${historyArr.join(' ')}</p>`;
        return xhtml;
    }

    // news
    static showItemFrontendHistory(data){
        let xhtml = '';
        xhtml = moment.tz(data.time, conf.time.time_zone).format(conf.time.frontend_time_format);
        return xhtml;
    }

    static showMessengerUserHistory(data){
        let xhtml = '';
        if (data.time){
            xhtml = moment.tz(data.time, conf.time.time_zone).format('MMM. YYYY');
        }
        return xhtml;
    }

    static showMessengerMsgHistory(data){
        let xhtml = '';
        if (data.time){
            xhtml = moment.tz(data.time, conf.time.time_zone).format(conf.time.messenger_msg_time_format);
        }
        return xhtml;
    }

    static showLastMsgSmConvHistory(data){
        let xhtml = '';
        if (data.time){
            xhtml = moment.tz(data.time, conf.time.time_zone).format(conf.time.messenger_last_msg_sm_conv_format);
        }
        return xhtml;
    }

    // {id}
    static showItemAction(data){
        let xhtml    = '';
        if (data.controller){
            let template    = conf.template.format_button.action;
            let btnList     = conf.template_config.action[data.controller];            
            xhtml   =   '<p class="action-field">';
            btnList.forEach((item)=>{
                let curTemplate     = template[item];
                let link            = displayConf.prefix.admin+'/'+data.controller+'/'+conf.route[item]+'/'+data.id;
                xhtml   +=  `<a field="${item}" href="${link}" class="${curTemplate.classes}" title="${curTemplate.title}">\
                                 <span class="${curTemplate.icon}"></span>\
                             </a>`;
                    
            });
                
            xhtml   += '</p>';
        }
        return xhtml;
    }

    // data{field, value}
    static showButtonFilter(data){
        let template    = conf.template.format_button[data.field];
        let xhtml   = '';
        if (data.data){
            xhtml = `<div field="${data.field}" class="btn-group btn-group-sm filter">`;
            for (let item of data.data){ 
                let classes;
                if (data.params.urlParams.filter.hasOwnProperty(data.field)) classes = (item[data.field] == data.params.urlParams.filter[data.field]) ? 'btn btn-dark' : 'btn btn-info';
                else classes     = (item[data.field] == 'all' ? 'btn btn-dark' : 'btn btn-info');
                let curTemplate = template[item[data.field]]; ;
                xhtml +=    `<button value="${item[data.field]}" class="${classes}">\
                                ${curTemplate.content}&nbsp;<span class="badge badge-light">${item.count}</span>\
                            </button>`;
            }
            xhtml+= '</div>';
        }
        return xhtml;
    }

    // data{thumb, controller}
    static showThumb(data){
        let fs  = require('fs');
        let _form  = require(__path.helper+'/form');
        let classes = data.classes || 'img-fluid';
        let attrStr = _form.getAttrString(data.attr || {});
        
        let path = __path.files+`/${data.controller}/${conf.name.folder.resize}/${data.thumb}`;
        let rel_path = __path.rel_files+`/${data.controller}/${conf.name.folder.resize}/${data.thumb}`;
        let src = (fs.existsSync(path)) ? `src="${rel_path}"` : '';
        let style = (data.style) ? `style="${data.style}"` : '';
        let xhtml = `<img ${src} class="${classes}" alt="${data.alt}" ${attrStr} />`;
        return xhtml;
    }
    // SUPPORT FUNCTIONS ============
    static standardizeLink(link){
        link = link.trim();
        if (link == '#'){ link = 'javascript:void(0)';
        }else{ link = link.replace(/(\/{2,})/g, '/'); }
        return link;
    }

    static getNotFoundThumb(){
        let src = './news_theme/img/page-not-found.png';
        return `<img src="${src}" alt="page not found" class="img-fluid" />`;
    }

    static showMessengerUserBtn(data){
        let xhtml = '';
        if (_frontendTemplate.mess.user_btn[data.relationship]){
            let template = _frontendTemplate.mess.user_btn[data.relationship];
            let btnPattern;
            btnPattern = '<button type="button" class="user-btn %s" data-type="%s">%s</button>';
                
            for (let btnTemp of template){
                let pattern;
                if (btnTemp.type == 'chat') pattern = `<a href="${_helper.standardizeLink(displayConf.prefix.mess)}/messages/p/${data.userId}" class="user-btn %s" data-type="%s">%s</a>`;
                else pattern = btnPattern;
                xhtml += _util.format(pattern, btnTemp.btn, btnTemp.type, btnTemp.content);
            }
        }else{ xhtml += '<span class="online-sign"></span>'; }
        return xhtml;
    }
}

module.exports = Template;