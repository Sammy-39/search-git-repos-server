const mongoose = require('mongoose')

const commitsSchema = new mongoose.Schema({
    repoName: String,
    repoCommits: [{
        _id: false,
        sha: String,
        message: String,
        authorName: String,
        authorId: String,
        authorAvatar: String,
        authorProfileURL: String,
        commitURL: String
    }]
})

const Commits = mongoose.model('Commits',commitsSchema)

module.exports = Commits