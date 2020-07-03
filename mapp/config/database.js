module.exports = {
    uri: 'mongodb+srv://%s:%s@cluster0-mrjwz.gcp.mongodb.net/%s?retryWrites=true&w=majority',
    username: 'webfullstack99',
    password: 'LoveGuitar99*',
    database_name: 'news',
    collection: {
        item: 'items',
        group: 'groups',
        category: 'categories',
        user: 'users',
        article: 'articles',
        chat: 'chats',
        room: 'rooms',
        conversation: 'conversations',
    },
}
//mongodb+srv://webfullstack99:<password>@cluster0-mrjwz.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority