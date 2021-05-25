const asyncHandler = require('express-async-handler')
const fetch = require('node-fetch')

const Profiles = require('../db/models/profiles')
const Commits = require('../db/models/commits')

const authFetchOptions = {headers: { authorization: `token ${process.env.GITTOKEN}`}}

const getRepos = asyncHandler(async (req,res)=>{
    const userName = req.params.userName
    const profile = await Profiles.findOne({userName})
    if(profile){
        res.status(200).json(profile)
    }
    else{
        const userFetchResponse = await fetch(`https://api.github.com/users/${userName}`,authFetchOptions)
        const userData = await userFetchResponse.json()
        const totalRepos = userData['public_repos']

        const repoFetchResponse = await fetch(`https://api.github.com/users/${userName}/repos?per_page=${totalRepos}`,authFetchOptions)
        var repoData = await repoFetchResponse.json()
        if(repoFetchResponse.status===200){
            if(totalRepos>100){
                const remainingRepoData = await getRemainingRepoData(userName,totalRepos-100)
                repoData = [...repoData, ...remainingRepoData]
            }
            const repos = repoData.map((repo)=>{
                return {
                    repoName: repo.name,
                    repoURL: repo['html_url'],
                    desc: repo.description,
                    cloneURL: repo['clone_url'],
                    language: repo.language,
                    forksCount: repo['forks_count'],
                    size: repo.size
                }
            })

            const newProfile = new Profiles({
                userName,
                profileURL: userData['html_url'],
                avatarURL: userData['avatar_url'],
                repos
            })
            await newProfile.save()

            res.status(200).json(newProfile)
        }
        else{
            res.status(404)
            throw new Error(data.message)
        }
    }
})

const getCommits = asyncHandler(async (req,res)=>{
    const userName = req.params.userName
    const repoName = req.params.repoName
    const commits = await Commits.findOne({repoName})
    if(commits){
        res.status(200).json(commits)
    }
    else{
        const totalCommits = await getTotalCommits(userName,repoName)
        const fetchResponse = await fetch(`https://api.github.com/repos/${userName}/${repoName}/commits?per_page=${totalCommits}`,authFetchOptions)
        var data = await fetchResponse.json()
        
        if(fetchResponse.status===200){
            if(totalCommits>100){
                const remainingCommitsData = await getRemainingCommitData(userName,repoName,totalCommits-100)
                data = [...data, ...remainingCommitsData]
            }
            const repoCommits = data.map((item)=>{
                return {
                    sha: item.sha,
                    message: item.commit?.message,
                    authorName: item.commit?.author.name,
                    authorId: item.author?.login,
                    authorAvatar: item.author?.avatar_url,
                    authorProfileURL: item.author?.html_url,
                    commitURL: item['html_url']
                }
            })

            const newCommits = new Commits({
                repoName,
                repoCommits
            })

            await newCommits.save()

            res.status(200).json(newCommits)
        }
        else{
            res.status(404)
            throw new Error(data.message)
        }
    }
})


const getRemainingRepoData = async (userName, reposCount) =>{
    const promises = []
    while(reposCount>0){
        promises.push(fetch(`https://api.github.com/users/${userName}/repos?per_page=${reposCount}`,authFetchOptions).then((res)=>res.json()))
        reposCount-=100
    }
    var resultData = await Promise.all(promises)
    resultData = resultData.flat()
    return resultData.filter((data)=>data['node_id'])
}

const getTotalCommits = async (userName,repoName) =>{
    const url1 = `https://api.github.com/repos/${userName}/${repoName}/commits?per_page=1`
    const res1 = await fetch(url1,{
        headers: {
          Accept: "application/vnd.github.v3+json",
          authorization: `token ${process.env.GITTOKEN}`
        }
    })
    const totalCommits = res1.headers.get('link')?.split(',')[1].match(/.*page=(?<page_num>\d+)/).groups.page_num
    return totalCommits
}

const getRemainingCommitData = async (userName, repoName, commitsCount) =>{
    const promises = []
    while(commitsCount>0){
        promises.push(fetch(`https://api.github.com/repos/${userName}/${repoName}/commits?per_page=${commitsCount}`,authFetchOptions).then((res)=>res.json()))
        commitsCount-=100
    }
    var resultData = await Promise.all(promises)
    resultData = resultData.flat()
    return resultData.filter((data)=>data.sha)
}

module.exports = { getRepos, getCommits }