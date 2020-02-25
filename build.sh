#! /bin/bash

# DO NOT EXECUTE THIS FILE YOURSELF! Run
# npx webpack --env.commit
# to trigger the build sequence

init() {
  echo "-------- Github Pages Building --------"
  if [ ! -d "dist" ]; then
    mkdir "dist"
  fi
  cd ./dist
}

terminate() {
  cd ..
  echo "-------- Github Pages Built --------"
  exit $1
}

check_tmp() {
  if [ -d "../.tmp" ]; then
    echo "Error: .tmp (caching directory) already exist"
    terminate 2
  fi
}

clone_gh_pages() {
  # Alternative: `git clone $1` was not used because causing clones by building is not a good idea
  git init
  git remote add -t gh-pages origin $1
  git fetch
  git checkout gh-pages
}


init

if [ ! -d ".git" ]; then
  REPO_URL=$1
  if [ -z $REPO_URL ]; then
    echo "Repository does not exist and no URL was provided."
    terminate 1
  fi

  # Build before this got executed
  if [ ! -z "$(ls -A .)" ]; then
    check_tmp

    # Move content to cache, and then move them back
    mkdir ../.tmp/
    mv * ../.tmp/
    clone_gh_pages $REPO_URL
    mv ../.tmp/* ./
    rm -rf ../.tmp/
  else
    check_tmp
    clone_gh_pages $REPO_URL
  fi
fi

git add *
git diff-index --quiet HEAD --
if [ $? = 0 ]; then
  echo "No content chagned"
else
  echo "Content changed. Committing..."
  git commit -m "Build $([[ ! -z $2 ]] && $2 || date)"
  git push origin gh-pages
  echo "Committed"
fi

terminate 0
