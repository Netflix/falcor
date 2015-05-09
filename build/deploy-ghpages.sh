#!/bin/bash

# if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo -e "Starting to update gh-pages\n"

  TEMP_DIR=$HOME/tmp
  FALCOR_DOCS_DIR=$TEMP_DIR/falcordocs
  GH_PAGES_DIR=$TEMP_DIR/gh-pages

  mkdir -p $TEMP_DIR

  if [ -d "$FALCOR_DOCS_DIR" ]; then
    rm -rf $FALCOR_DOCS_DIR
  fi

  if [ -d "$GH_PAGES_DIR" ]; then
    rm -rf $GH_PAGES_DIR
  fi

  # Generate Docs
  npm run doc

  cp -R doc $FALCOR_DOCS_DIR

  # Change Working Directory to $HOME
  cd $HOME

  git config --global user.email "falcor@netflix.com"
  git config --global user.name "Falcor Build"

  git clone --quiet --branch=gh-pages git@github.com:Netflix/falcor.git $GH_PAGES_DIR > /dev/null

  # Change Working Directory to $HOME/gh-pages
  cd $GH_PAGES_DIR

  rsync -r $FALCOR_DOCS_DIR/ doc/

  git add .
  git commit -m "Travic build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
  git push origin gh-pages

  echo -e "Deployed docs to gh-pages\n"
# fi
