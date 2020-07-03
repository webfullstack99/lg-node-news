module.exports  = {
    users: [],
    addUser: function (item){
        if (item.room) if (!this.getUserByRoomAndUsername({room: item.room, username: item.username})) this.users.unshift(item);
    },

    removeUserById: function (id){
        for (let key in this.users){
            if (this.users[key].id == id){
                return this.users.splice(key, 1)[0];
            } 
        }
    },


    getUserByRoomAndUsername: function(data){
        for (let item of this.users){
            if (item.username == data.username && item.room == data.room) return item;
        }
    },

    getUsersInRoom: function(room){
        let usersInRoom = [];
        for (let item of this.users){
            if (item.room == room) usersInRoom.push(item);
        }
        return usersInRoom;
    },

    getRoomById: function(id){
        for (let item of this.users){
            if (item.id == id) return item.room;
        }
    },

    getUserById: function (id){
        for (let item of this.users){
            if (item.id == id) return item;
        }
    },

    getUserByUsername: function(username){
        for (let item of this.users){
            if (item.username == username) return item;
        }
    },

    getFriendsById: function(id){
        let user = this.getUserById(id) || {};
        return user.friends;
    },

    getUserByUserId: function(userId){
        for (let item of this.users){
            if (item.userId == userId) return item;
        }
    },

    getFriendUserIdsByRoomAndUserId: function(data){
        let friendUserIds = [];
        for (let item of this.users) if (item.room == data.room && item.userId != data.userId) friendUserIds.push(item.userId);
        return friendUserIds;
    }
}