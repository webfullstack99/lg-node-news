/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
    let width = $('#ckeditor').parent().prev().children("input").width();
    config.width = width;
    config.toolbar = [
        {items:['Save','Cut','Copy','-','Undo','Redo']}, 
        {items:['Bold','Italic','Underline','JustifyLeft','JustifyCenter','JustifyRight','-','RemoveFormat']}, '/',
        {items:['Styles','Font','FontSize','TextColor','BGColor','Maximize']}
    ];
};
