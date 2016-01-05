# Challenge Starter Repo
This repository contains starter code for the INFO 343 B/D challenges. You will need to fork this repository into your own account and use that forked copy as your master copy. See the [git challenge page](http://info343-joelross.rhcloud.com/challenges/git) for more details on getting started.

## Getting Changes from the Upstream Repository

I may need to add or change things in this starter repository later in the quarter. Because you've already forked it, you will need to add the original repository as another git remote to pull changes from it. If I tell you that I've changed something, you should follow these steps to add the new upstream remote.

First execute the following to see your current set of remotes:

```
git remote -v
```

If there is already a remote named `upstream` then you have already added the upstream remote. If you don't see a remote named `upstream`, execute this command to add it:

```
//section b
git remote add upstream https://github.com/info343b-au15/challenges.git

//section d
git remote add upstream https://github.com/info343d-au15/challenges.git
```

Now use git to pull any new commits that have been made to the master branch on the upstream remote:

```
git pull upstream master
```

This will fetch the new commits and merge them into your repository files. After that finishes, you can push the new commits back up to your forked repository (the `origin`) using the command:

```
git push origin
```