module.exports  =   {
    mess: {
        user_btn: {
            relationships_change: ['stranger', 'receive-invite', 'sent-invite', 'friend', 'unknow'],
            stranger: [
                {
                    btn: 'btn btn-primary btn-block',
                    type: 'add',
                    content: 'Add friend',
                }
            ],
            'receive-invite': [
                {
                    btn: 'btn btn-primary btn-block',
                    type: 'accept',
                    content: 'Accept',
                }, {
                    btn: 'btn btn-light btn-block',
                    type: 'deny',
                    content: 'Deny',
                },
            ],
            'sent-invite': [
                {
                    btn: 'btn btn-light btn-block',
                    type: 'cancel-request',
                    content: 'Cancel request',
                }
            ],
            friend: [
                {
                    btn: 'btn btn-primary btn-block',
                    type: 'chat',
                    content: 'Chat',
                }, {
                    btn: 'btn btn-light btn-block',
                    type: 'unfriend',
                    content: 'Un friend',
                }
            ],
            friendx: [
                {
                    btn: 'btn btn-primary btn-block',
                    type: 'chat',
                    content: 'Chat',
                }
            ],

        }
    }
}