module.exports  = {
    users: [],
    addUser: function (item){
        if (!this.getUserByUsername(item.username)) this.users.unshift(item);
    },

    removeUserById: function (id){
        for (let key in this.users){
            if (this.users[key].id == id){
                return this.users.splice(key, 1)[0];
            } 
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
    }
}