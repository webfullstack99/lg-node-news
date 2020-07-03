$(document).ready(function(){
	setUp();
	makeUp();
	form();	
});

function form(){
	createSlug();
	sendFormByAjax();
	sendByLocation();
	changeIndexFormAction();
	sendValueToHiddenInputBeforeSubmit();
}

function makeUp(){
	//toggleSidebarInSmallScreen();
	searchDropDown();
	activeSideBar();
	sort();
	showFileUploadName();
	showLoadIcon();
}

function setUp(){
	setUpCkeditor();
	setCroppie();
	setCroppieDialog();
	checkall();
	formAlertAutoDismiss();
}

// SUPPORT FUNCTIONS ===============
// MAKE UP
function toggleSidebarInSmallScreen(){
	checkAndToggleIfInSmallScreen();
	$(window).resize(function(){
		checkAndToggleIfInSmallScreen();
	});
}

function checkAndToggleIfInSmallScreen(){
	let width 	= $(window).width();
	if (width < 768){
		$('ul#accordionSidebar').addClass('toggled');
	}else{
		$('ul#accordionSidebar').removeClass('toggled');
	}
}

function sort(){
	addCaretFromUrl();
	//addCaretOnClick();
	switchCaret();
}

function addCaretFromUrl(){
	let params		= new URLSearchParams(location.search);
	let sortField 	= params.get('sort_field');
	let sortValue 	= params.get('sort_value');
	if (sortField != null && sortValue != null){
		let selector 	= '#list-table > thead > tr > th > a[column="'+sortField+'"]';
		$(selector).attr('order', sortValue);
		addCaret($(selector), getOrder(sortValue));
	}
}

function showLoadIcon(){
	$('#raw-articles-form').submit(function(e){
		$('#load-icon').removeClass('d-none');
	})
}

function showFileUploadName(){
    $(".custom-file-input").on("change", function() {
        var fileName = $(this).val().split("\"").pop();
        $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });
}

function getOrder(oriented){
	return (oriented == 'asc')?'up':'down';
}

function addCaretOnClick(){
	$('#list-table').on("click", 'thead > tr > th > a.sort', function(){
		addCaret($(this), 'down');
	});
}

function addCaret(object, oriented){
	object.append('&nbsp;<span><i class="fas fa-caret-'+oriented+'"></i></span>');		
	object.removeClass('sort');
}

function addSwitchCaretClass(object, oriented){
	object.addClass('switch-caret-'+oriented);
}

function switchCaret(){
	let subSelector	= createSwitchCaretClassesByTagsName(['a', 'button']);
	$('body').on('click', subSelector ,function(){
		let switchType 		= ($(this).hasClass('switch-caret-vertical'))?'switch-caret-vertical':'switch-caret-horizontal'; 
		let currentOriented = getCurrentCaretOriented(switchType, $(this));
		let newOriented 	= getNewCaretOriented(switchType, currentOriented);
		getCaretIconObject($(this)).toggleClass('fa-caret-'+currentOriented+' fa-caret-'+newOriented);
	});
}

function createSwitchCaretClassesByTagsName(tags){
	let subSelector = '';
	for (let i =0; i< tags.length; i++){
		subSelector +=','+tags[i]+'.switch-caret-vertical'+','+tags[i]+'.switch-caret-horizontal';
	}
	subSelector 	= subSelector.slice(1);
	return subSelector;
}

function getCurrentCaretOriented(switchType, object){
	let icon 	= getCaretIconObject(object);
	let oriented;
	if (switchType === 'switch-caret-vertical'){
		oriented 	= (icon.hasClass('fa-caret-down'))?'down':'up';
	}else if (switchType === 'switch-caret-horizontal'){
		oriented 	= (icon.hasClass('fa-caret-left'))?'left':'right';
	}
	return oriented;
}

function getNewCaretOriented(switchType, currentOriented){
	let newOriented;
	if (switchType === 'switch-caret-vertical'){
		newOriented = (currentOriented === 'down')?'up':'down';
	}else if (switchType === 'switch-caret-horizontal'){
		newOriented = (currentOriented === 'left')?'right':'left';
	}
	return newOriented;
}

function getCaretIconObject(object){
	let iconObj		= object.find("span").children();
	return iconObj;
}

function activeSideBar(){
	let controller = $('#hidden-input-container > input[name="controller"]').val();
	let activePage = '#accordionSidebar li.nav-item[name="'+controller+'"]';
	for (let item of $('li.page-group-sidebar')){
		if ($(item).children('ul').children('li.nav-item[name="'+controller+'"]').length > 0) {
			$(item).children('a').children('span').addClass("active-link");	
			$(item).children('a').children('div').children('span').addClass("active-link");	
		}
	}
	$(activePage).children('a').children('span').addClass("active-link");	
}

function searchDropDown(){
	$('.dropdown.search-dropdown > .dropdown-menu > .dropdown-item').click(function(e){
		let name 	= $(this).text();
		let val 	= $(this).attr('value');
		$(this).parent().prev().text(name);
		$(this).parent().prev().attr('value', val);
		e.preventDefault();
	});
}

// FORM
function sendValueToHiddenInputBeforeSubmit(){
	let sendNameVal = function (id, field){
		let content = $('select > option[value="'+id+'"]').text();
		$('input[type="hidden"][name="'+field+'.name"]').val(content);
	}

	let sendStatusVal = function (value, field){
		$('input[type="hidden"][name="'+field+'.status"]').val(value);
	}

	$('input[type="submit"]').click(function(){
		let data = {
			group: ['name'],
			category: ['name', 'status'],
		}
		for (let field in data){
			for (let item of data[field]){
				if ($('select[name="'+field+'.id"]').length > 0){
					let id = $('select[name="'+field+'.id"]').val();
					if (item == 'name') sendNameVal(id, field);
					if (item == 'status' && field == 'category'){
						let categoryInfo = $('input[name="categoryInfo"]').val();
						let catsObj = JSON.parse(categoryInfo.replace(/\\/g, ''));
						for (let cat of catsObj){
							if (cat._id == id){
								sendStatusVal(cat.status, field);
							} 
						}
					}
				}
			}
		}
	});
}

// FORM: AJAX
function sendFormByAjax(){
	changeStatus();
	changeGroup();
	changeCategory();
	changeDisplay();
	changeIsHome();
	changeType();
	changeGroupAcp();
	changeOrdering();
	deleteItem();
}

var alertShowTime 		= 2000;
var alertDurationTime 	= 500;
var listAlertTimeout 		= null;

function changeGroup(){
	$('#list-table select[field="group"]').change(function(){
		let url 	= $(this).val();
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
	});
}

function changeCategory(){
	$('#list-table select[field="category"]').change(function(){
		let url 	= $(this).val();
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
	});
}

function changeType(){
	$('#list-table select[field="type"]').change(function(){
		let url 	= $(this).val();
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
	});
}

function changeDisplay(){
	$('#list-table select[field="display"]').change(function(){
		let url 	= $(this).val();
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
	});
}

function changeOrdering(){
	$('#list-table input[field="ordering"]').change(function(){
		let url 	= $(this).attr('link');
		url 		= url.replace(/ordering\/\d+\//, '/ordering/'+$(this).val()+'/');
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
	});
}

function changeIsHome(){
	$('a[field="is_home"]').click(function(e){
		let url 	= $(this).attr('href');
		let htmlObj	= $(this);
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					let template 	= data.template;
					if (data.status == 'success'){
						htmlObj.attr('class', template.classes);
						htmlObj.text(template.content);
						htmlObj.attr('href', data.link);
					}	
					disableButtonWhileShowMessage(htmlObj);
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
		e.preventDefault();
	});
}

function changeStatus(){
	$('a[field="status"]').click(function(e){
		let url 	= $(this).attr('href');
		let htmlObj	= $(this);
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					let template 	= data.template;
					if (data.status == 'success'){
						htmlObj.attr('class', template.classes);
						htmlObj.text(template.content);
						htmlObj.attr('href', data.link);
					}	
					disableButtonWhileShowMessage(htmlObj);
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
		e.preventDefault();
	});
}

function changeGroupAcp(){
	$('a[field="groupAcp"]').click(function(e){
		let url 	= $(this).attr('href');
		let htmlObj	= $(this);
		$.ajax({
			url: url,
			type: 'get',
			success: function(data, status){
				if (status == 'success'){
					let template 	= data.template;
					if (data.status == 'success'){
						let classes 	= template.classes.replace(/btn\-outline\-([a-z]+)/, 'btn-$1');
						htmlObj.attr('class', classes);
						htmlObj.text(template.content);
						htmlObj.attr('href', data.link);
					}	
					disableButtonWhileShowMessage(htmlObj);
					showMessage(data.message);
				}else alert('Something went wrong');
			}
		});
		e.preventDefault();
	});
}

function deleteItem(){
	$('a[field="delete"]').click(function(e){
		let r 		= confirm('Do you want to delete this item?');
		if (r){
			let url 	= $(this).attr('href');
			let htmlObj	= $(this);
			$.ajax({
				url: url,
				type: 'get',
				success: function(data, status){
					if (data.status == 'success'){
						let row 	= htmlObj.parents("tr");
						row.fadeOut({duration:400});
						setTimeout(function(){
							row.detach();
						}, 400);
					}
					showMessage(data.message);
				}
			});
		}
		e.preventDefault();
	});
}

function showMessage(message){
	let htmlMessage 	= $('#list-alert');
	htmlMessage.text(message.content);
	htmlMessage.attr('class', message.classes+' fade collapse show');
	clearTimeout(listAlertTimeout);
	htmlMessage.show();
	listAlertTimeout = setTimeout(function(){
		htmlMessage.slideUp({duration:alertDurationTime});
	}, alertShowTime);	
}

function disableButtonWhileShowMessage(object){
	object.addClass('disabled');
	setTimeout(function(){
		object.removeClass('disabled');	
	}, alertShowTime);
}

function changeIndexFormAction(){
	$('#save-multi-submit').click(function(){
		let action 	= $('#save-multi').val();
		$('#main-form').attr('action', action);
		if (action != 'default'){
			$('#main-form').submit();
		}else{
			alert('Please choose option');
		}
	});
}

function createSlug(){
	let controllerArr = ['category', 'article'];
	let nameArr = ['name', 'title'];
	for (let name of nameArr){
		$(`input[name="${name}"]`).keyup(function(){
			if(!controllerArr.includes($('input[type="hidden"][name="controller"]').val())) return;
			let content = $(this).val();
			let slugString = slug(content);
			$('input[name="slug"]').val(slugString);
		});

	}
}

// FORM: LOCATION
function sendByLocation(){
	sendFilter();
	sendSearch();
	sendClearSearch();
	sendSort();
	sendExtraFilter();
}

function sendExtraFilter(){
	$('.extra-select-filter select').change(function(){
		let field 	= $(this).parent().attr('field');
		let val 	= $(this).val();
		let url 	= createUrlWithParams([
			{key: field+'_select_filter', value: val}
		]);
		window.location.replace(url);
		
	});
}

function sendSort(){
	$('#list-table > thead > tr > th > a').click(function(e){
		let sortField 	= $(this).attr('column');
		let sortValue 	= getSortValue($(this));
		let url 		= createUrlWithParams([
			{key:'sort_field', value: sortField},
			{key:'sort_value', value: sortValue}
		]);
		window.location.replace(url);
		e.preventDefault();
	});
}

function getSortValue(object){
	if (object.attr('order') == null){
		return 'asc';
	}else{
		return (object.attr('order') == 'asc')?'desc':'asc';
	}
}

function sendSearch(){
	$('#search-form').submit(function(e){
		e.preventDefault();
		let value 	= $('#search-input').val();
		if (value.trim() == ''){
			alert('Please type something to search!');
			return;
		}
		let field 	= $('.dropdown.search-dropdown > button').attr('value');
		let url 	= createUrlWithParams([
			{key: 'search_field', value: field},
			{key: 'search_value', value: value},
		]);
		window.location.replace(url);
	});
}

function sendClearSearch(){
	$('#clear-btn').click(function(e){
		let params 	= new URLSearchParams(location.search);
		params.delete('search_field');
		params.delete('search_value');
		let urlQuery 	= params.toString();
		urlQuery 		= (urlQuery.trim() != '')?('?'+urlQuery):''; 
		window.location.replace(getPureUrl()+urlQuery);	
		e.preventDefault();
	});
}

function sendFilter(){
	$('.btn-group.filter > button').click(function(){
		let filterField 	= $(this).parent().attr('field');
		let filterValue 	= $(this).attr('value');
		let url 	= createUrlWithParams([
			{key: (filterField+'_filter'), value: filterValue},
		]);	
		window.location.replace(url);
	})	
}

function getPureUrl(){
	return (window.location.protocol+'//'+window.location.hostname+':'+window.location.port+window.location.pathname);
}

function createUrlWithParams(params){
	let USParams 	= new URLSearchParams(location.search);
	for (var value of params){
		USParams.set(value.key, value.value);
	}
	return getPureUrl()+'?'+USParams.toString();
}

// SET UP
function setUpCkeditor(){
	try{
		CKEDITOR.replace( 'ckeditor', {
		    customConfig: './config.js'
		});
	}catch (e){
		console.log(e.message);
	}	
}

var $uploadCrop;
function setCroppie() {
	$('#upload').click(function(){
		setTimeout(function(){
			$('#upload-demo').dialog('open');
		}, 1000);
	});
    let toolBox    = $('#upload-demo');         // Chứa crop tool 
    let fileInput  = $('#upload');           // file input    
    let submitInput= $('input[type="submit"]');


    toolBox.hide();
    
    try{
		//Assigning image to $uploadCrop
	    function readFile(input) {
	        if (input.files && input.files[0]) {
	        	$('#thumb-container').hide();
	            var reader = new FileReader();            
	            reader.onload = function (e) {
	                toolBox.addClass('ready');
	                $uploadCrop.croppie('bind', {
	                    url: e.target.result
	                }).then(function(){
	                    console.log('jQuery bind complete');
	                });
	                
	            }
	            reader.readAsDataURL(input.files[0]);
	        }
	        else {
	            swal("Sorry - you're browser doesn't support the FileReader API");
	        }
	    }
	    $uploadCrop = toolBox.croppie({
	        viewport: {
	            width: 100,
	            height: 100,
	            type: 'circle'
	        },
	        boundary:{
	            width: 300,
	            height: 300
	        },
	    });

	    fileInput.on('change', function () { readFile(this); console.log();toolBox.show();});
	}catch (e){
		console.log(e.message);
	}
}

function moveImage(base64){
    let hiddenBase64Input     = $('#image-canvas');     // hidden input truyền vào base64 trước khi submit
    let form                  = $('form[name="add-form"]');
    hiddenBase64Input.val(base64);
}

function setCroppieDialog(){
    let selector     = '#upload-demo';
    $(selector).dialog ({
        autoOpen :  false ,       
        title: "Crop image",
        show : { effect : 'blind' , duration : 400 },   
        hide : { effect : 'blind' , duration : 400 },  
        width : '800px' , height : 'auto' , resizable : false,  
        modal : true,      
        buttons : {
            'Đồng ý' : function(){ 
            	$uploadCrop.croppie('result', {
		            type: 'base64',
		            size: 'original',
		            format: 'png',
		            quality: 1,
		        }).then(function (resp) {
		            moveImage(resp)
		        });
                $(this).dialog('close');     
            } ,
            'Hủy bỏ' : function(){ 
            	$('#thumb-container').show();
                $(this).dialog('close');     
            }
        }
    });
}

function checkall(){
	$('#checkall').click(function(){
		if (this.checked){
			$('input[type="checkbox"][name="id"]').prop('checked', true);
		}else{
			$('input[type="checkbox"][name="id"]').prop('checked', false);
		}
	})
}

function formAlertAutoDismiss(){
	setTimeout(function (){
		$('#form-alert').slideUp(alertDurationTime);
	}, alertShowTime);
}

function slug(str){
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();
	// remove accents, swap ñ for n, etc
	let from = 'áàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệoóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựíìỉĩị·/_,:;';
	let to   = 'aaaaaaaaaaaaaaaaadeeeeeeeeeeeoooooooooooooooooouuuuuuuuuuuiiiii------';
	for (let i=0, l=from.length ; i<l ; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}
	str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
	.replace(/\s+/g, '-') // collapse whitespace and replace by -
	.replace(/-+/g, '-'); // collapse dashes
	return str;
}