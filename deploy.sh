#!/bin/sh
git checkout master && \
rm .gitignore && \
npm run package && \
ng build hatool-tester --prod && \
git add dist/hatool-tester && \
git commit -m dist && \
(git branch -D gh-pages || true) && \
git subtree split --prefix dist/hatool-tester -b gh-pages && \
git push -f origin gh-pages:gh-pages && \
git checkout master && \
git branch -D gh-pages && \
git checkout . && \
git push
