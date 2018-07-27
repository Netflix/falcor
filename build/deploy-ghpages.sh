#!/bin/bash

if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo -e "Building and committing dist and docs...\n"

  TEMP_DIR=$HOME/tmp
  FALCOR_DOCS_DIR=$TEMP_DIR/falcordocs
  FALCOR_BUILD_DIR=$TEMP_DIR/falcorbuild
  GH_PAGES_DIR=$TEMP_DIR/gh-pages
  DEPLOYABLE_REPO=git@github.com:Netflix/falcor.git
  CURRENT_RELEASE=master

  mkdir -p $TEMP_DIR

  if [ -d "$FALCOR_BUILD_DIR" ]; then
    rm -rf $FALCOR_BUILD_DIR
  fi

  if [ -d "$FALCOR_DOCS_DIR" ]; then
    rm -rf $FALCOR_DOCS_DIR
  fi

  if [ -d "$GH_PAGES_DIR" ]; then
    rm -rf $GH_PAGES_DIR
  fi

  git config --global user.email "falcorbuild@netflix.com"
  git config --global user.name "Falcor Build"

  openssl aes-256-cbc -K $encrypted_00000eb5a141_key -iv $encrypted_00000eb5a141_iv -in deployKey.enc -out deployKey -d
  chmod 0600 deployKey
  eval `ssh-agent -s`
  ssh-add deployKey

  # Need https url to push changes, and also need to move from detached head to built branch.
  git remote add deployable $DEPLOYABLE_REPO
  git checkout $TRAVIS_BRANCH

  # Generate Docs
  npm run doc
  npm run dist

  git add dist/.
  git add doc/.
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER committed dist/ and doc/"
  git push deployable $TRAVIS_BRANCH

  if [ "$TRAVIS_BRANCH" == "$CURRENT_RELEASE" ]; then

    echo -e "Updating gh-pages...\n"

    cp -R doc $FALCOR_DOCS_DIR
    cp -R dist $FALCOR_BUILD_DIR

    # Change Working Directory to $HOME
    cd $HOME

    git clone --quiet --branch=gh-pages $DEPLOYABLE_REPO $GH_PAGES_DIR > /dev/null

    # Change Working Directory to $HOME/gh-pages
    cd $GH_PAGES_DIR

    rsync -r $FALCOR_DOCS_DIR/ doc/
    rsync -r $FALCOR_BUILD_DIR/ build/

    git add .
    git commit -m "Travis build $TRAVIS_BUILD_NUMBER off $TRAVIS_BRANCH pushed to gh-pages"
    git push origin gh-pages

    echo -e "Deployed docs and build to gh-pages\n"
  fi
fi
