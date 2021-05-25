const express = require('express')
const { getRepos, getCommits } = require('../controllers/reposController')

const router = express.Router()

router.route('/get-repos/:userName').get(getRepos)
router.route('/get-commits/:userName/:repoName').get(getCommits)

module.exports = router