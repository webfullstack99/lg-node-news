module.exports = {
    evn: 'dev', //dev | publish
    authentication: true,
    port: 3000,
    get activation_port() {
        if (this.evn == 'dev') return this.port;
        return '';
    },
    time: {
        time_zone: 'Asia/Bangkok',
        long_time_format: 'HH:mm DD/MM/YYYY',
        short_time_format: 'DD/MM/YYYY',
        frontend_time_format: 'DD MMMM, YYYY',
        messenger_msg_time_format: 'HH:mm DD MMM, YYYY',
        messenger_last_msg_sm_conv_format: 'HH:mm',
    },
    template: {
        message: {
            raw_articles: {
                success: '%d article was added',
                fail: 'Raw articles fail',
            },
            change_multi: '%d item was changed',
            delete_multi: '%d item was deleted',
            change: {
                success: {
                    classes: 'alert alert-success',
                    content: 'Change item successfully',
                },
                fail: {
                    classes: 'alert alert-danger',
                    content: 'Something went wrong',
                },
            },
            insert: {
                success: {
                    classes: 'alert alert-success',
                    content: 'Insert item successfully',
                },
                fail: {
                    classes: 'alert alert-danger',
                    content: 'Something went wrong',
                },
            },
            edit: {
                success: {
                    classes: 'alert alert-success',
                    content: 'Edit item successfully',
                },
                fail: {
                    classes: 'alert alert-danger',
                    content: 'Something went wrong',
                },
            },
            delete: {
                success: {
                    classes: 'alert alert-success',
                    content: 'Delete item successfully',
                },
                fail: {
                    classes: 'alert alert-danger',
                    content: 'Something went wrong',
                },
            },
        },
        form_errors: {
            required: 'is required',
            text_length: 'must have length between %d and %d',
            contain_space: 'must not have space',
            unique: 'must contain a unique value',
            number_value: 'must have value between %d and %d',
            password: 'must have at least one lower case, one upper case, one number, one special char and length between %d and %d',
            password_confirmed: 'Do not match its confirmation',
        },
        format_button: {
            is_home: {
                yes: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'Display',
                },
                no: {
                    classes: 'btn btn-secondary btn-sm',
                    content: 'Not display',
                },
                all: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'All',
                }
            },
            status: {
                active: {
                    classes: 'btn btn-success btn-sm',
                    content: 'Active',
                },
                inactive: {
                    classes: 'btn btn-warning btn-sm',
                    content: 'In active',
                },
                all: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'All',
                }
            },
            groupAcp: {
                yes: {
                    classes: 'btn btn-outline-info btn-sm',
                    content: 'Yes',
                },
                no: {
                    classes: 'btn btn-outline-dark btn-sm',
                    content: 'No',
                },
                all: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'All',
                }
            },
            type: {
                normal: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'Normal',
                },
                featured: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'Featured',
                },
                all: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'All',
                }
            },
            display: {
                grid: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'Gird',
                },
                thumb: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'Thumb',
                },
                list: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'List',
                },
                all: {
                    classes: 'btn btn-primary btn-sm',
                    content: 'All',
                }
            },
            action: {
                edit: {
                    classes: 'text-success',
                    title: 'Edit',
                    icon: 'far fa-edit fa-fw mfa-lg-2x',
                },
                delete: {
                    classes: 'text-danger',
                    title: 'Delete',
                    icon: 'far fa-trash-alt fa-fw mfa-lg-2x',
                },
                view: {
                    classes: 'text-info',
                    title: 'View',
                    icon: 'far fa-search fa-fw fa-lg',
                },
            },
            undefined: {
                classes: 'btn btn-secondary btn-sm',
                content: 'Undefined',
            }
        },
        search: {
            id: 'Search by id',
            name: 'Search by name',
            username: 'Search by username',
            email: 'Search by email',
            fullname: 'Search by fullname',
            title: 'Search by title',
            'content.text': 'Search by content',
            all: 'Search by all',
        },
        status_select: ['inactive', 'active'],
        is_home_select: ['yes', 'no'],
        groupAcp_select: ['yes', 'no'],
        display_select: ['list', 'grid', 'thumb'],
        type_select: ['normal', 'featured'],
        form: {
            normal: {
                label: {
                    class: 'form-group col-lg-2 mb-1 mb-lg-3 d-block d-lg-flex align-items-center',
                },
                select: {
                    class: 'form-control form-group col-lg-10',
                },
                radioGroup: {
                    class: 'btn-group btn-group-toggle form-group btn-group-sm',
                },
                text: {
                    class: 'form-control form-group col-lg-10',
                },
                number: {
                    class: 'form-control form-group col-lg-10',
                    min: 5,
                    max: 100,
                    step: 5,
                },
                textarea: {
                    class: 'form-control form-group col-lg-10',
                    rows: '10',
                    id: 'ckeditor'
                },
                file: {
                    class: 'form-control custom-file-input',
                    id: 'upload',
                },
                submit: {
                    class: 'btn btn-primary offset-0 offset-lg-2 col-5',
                }
            },
            edit: {
                label: {
                    class: 'form-group col-lg-4 mb-1 mb-lg-3 d-block d-lg-flex align-items-center',
                },
                select: {
                    class: 'form-control form-group col-lg-8',
                },
                radioGroup: {
                    class: 'btn-group btn-group-toggle form-group btn-group-sm',
                },
                text: {
                    class: 'form-control form-group col-lg-8',
                },
                number: {
                    class: 'form-control form-group col-lg-8',
                    min: 5,
                    max: 100,
                    step: 5,
                },
                textarea: {
                    class: 'form-control form-group col-lg-8',
                    rows: '10',
                    id: 'ckeditor'
                },
                submit: {
                    class: 'btn btn-primary offset-lg-9 offset  col-3 float-right',
                },
                file: {
                    class: 'form-control custom-file-input',
                    id: 'upload',
                },
            },
        }
    },
    template_config: {
        select_filter: {
            user: ['group.id'],
            category: ['display'],
            article: ['category.id'],
        },
        filter: {
            item: ['status'],
            group: ['status', 'groupAcp'],
            user: ['status'],
            category: ['status', 'is_home'],
            article: ['status', 'type'],
            room: ['status'],
        },
        search: {
            item: ['all', 'id', 'name'],
            group: ['all', 'id', 'name'],
            category: ['all', 'id', 'name', 'slug'],
            user: ['all', 'id', 'username', 'email', 'fullname'],
            article: ['all', 'id', 'title', 'content.text'],
            room: ['all', 'id', 'name'],
        },
        action: {
            item: ['edit', 'delete'],
            group: ['edit', 'delete'],
            category: ['edit', 'delete'],
            user: ['edit', 'delete'],
            article: ['edit', 'delete'],
            room: ['edit', 'delete'],
        },
    },
    name: {
        folder: {
            original: 'original',
            resize: 'resize',
        }
    },
    route: {
        edit: 'form',
        delete: 'delete',
        save_multi: 'savemulti',
    },
    cookie: {
        default_max_age: false,
        get remember_me_login_max_age() {
            let hour = 60 * 60 * 1000;
            let day = 24 * hour;
            let year = 365 * day;
            return year;
        }
    },
    upload: {
        image: {
            fileSize: { min: 0.001 * 1024 * 1024, max: 20 * 1024 * 1024 },
            filenameLength: 10,
            ext: 'png|jpg|jpeg',
        }
    },
}