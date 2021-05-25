const mongoose = require('mongoose')

const profilesSchema = new mongoose.Schema({
    userName: String,
    profileURL: String,
    avatarURL: String,
    repos: [{
        _id: false,
        repoName: String,
        repoURL: String,
        desc: String,
        cloneURL: String,
        language: String,
        forksCount: Number,
        size: Number
    }]
})

const Profiles = mongoose.model('Profiles', profilesSchema)

module.exports = Profiles