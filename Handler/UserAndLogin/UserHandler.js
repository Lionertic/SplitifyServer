var UserSchema = require('./UserSchema');
var bcrypt = require('bcryptjs');
const { body } = require('express-validator');

let createOrUpdateUser = async (body, isCreate) => {
    user = await getUserJSON(body, isCreate)
    user = await updateUser(body.login, user)
    return user
}

let getUserByLogin = (loginID) => {
    return getUsersForQuery({login:loginID}, true)
}

let verifyPassword = async (password, passwordHash) => {
    return await bcrypt.compare(password, passwordHash)
}

let updateUser = (login, user) => {
    return UserSchema.findOneAndUpdate({login:login}, user, {new:true, upsert:true})
}
let uniqueTokenGenerator = async () => {

    do {
        let authToken = Math.random().toString(36).slice(2)

        if (await getUsersForQuery({token:authToken}, true) == null) {
            return authToken
        }
    } while(true)
}

let getUsersForQuery = (query, isSingle) => {
    if(isSingle) {
        return UserSchema.findOne(query)
    } else {
        return UserSchema.findAll(query)
    }
}

let getUserJSON = async (body, isCreate) => {
    let userJSON = {login:body.login}

    if(body.password) {
        const salt = await bcrypt.genSalt(10);
        let passwordHash = await bcrypt.hash(body.password, salt);
        userJSON.passwordHash = passwordHash 
    }

    if(body.name) {
        userJSON.name = body.name
    }

    if(isCreate) {
        userJSON.token = await uniqueTokenGenerator()
    }

    return userJSON 
}

module.exports.createOrUpdateUser = createOrUpdateUser
module.exports.getUserByLogin = getUserByLogin
module.exports.verifyPassword = verifyPassword
module.exports.getUsersForQuery = getUsersForQuery