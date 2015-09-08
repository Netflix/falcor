#!/bin/bash

if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo -e "Starting to update gh-pages\n"

  TEMP_DIR=$HOME/tmp
  FALCOR_DOCS_DIR=$TEMP_DIR/falcordocs
  FALCOR_BUILD_DIR=$TEMP_DIR/falcorbuild
  GH_PAGES_DIR=$TEMP_DIR/gh-pages

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

  # Generate Docs
  npm run doc
  npm run dist

  cp -R doc $FALCOR_DOCS_DIR
  cp -R dist $FALCOR_BUILD_DIR

  # Change Working Directory to $HOME
  cd $HOME

  git config --global user.email "falcorbuild@netflix.com"
  git config --global user.name "Falcor Build"

  git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/Netflix/falcor.git $GH_PAGES_DIR > /dev/null

  # Change Working Directory to $HOME/gh-pages
  cd $GH_PAGES_DIR

  rsync -r $FALCOR_DOCS_DIR/ doc/
  rsync -r $FALCOR_BUILD_DIR/ build/

  git add .
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to gh-pages"
  git push origin gh-pages

  echo -e "Deployed docs and build to gh-pages\n"
fi
