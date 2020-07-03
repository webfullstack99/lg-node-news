const _helper = require(__path.helper+'/helper');
const _userModel = require(__path.model+'/user');
const _conversationModel = require(__path.model+'/conversation');

module.exports = {
    getFriendRequests: async function (ids){
        let friendRequests = _userModel.listItems({ids}, {task: 'list-friends'});
        return friendRequests;
    },

    getRecentConvs: async function (userId){
        let recentConvs = _conversationModel.listItems({userId}, {task: 'list-recent-conversations'});
        return recentConvs;
    },

}