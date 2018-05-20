.PHONY: help list lint test release rebuild-icons docs coverage

help:
	@echo "lint - check style with eslint"
	@echo "test - run tests headless"
	@echo "release - package and upload a release on npm"
	@echo "rebuild-icons - turn input PNG into icons"
	@echo "bump-and-push - run tests, lint, bump patch, push to git, and release on npm"

lint:
	./node_modules/.bin/eslint lib spec/lib spec/endtoend

clean-build:
	rm -fr dist/

test:
	npm run test-headless

coverage:
	./node_modules/.bin/nyc npm run test-headless

test-watch-e2e:
	find lib/ spec/ -name \*.js | entr -r npm run test-headless

test-watch:
	find lib/ spec/ -name \*.js | entr -r npm run test

rebuild-icons:
	./node_modules/.bin/electron-icon-maker --input=./static/src/large_logo.png --output=./build/

bump-and-push: test lint
	bumpversion patch
	git push
	git push --tags
	make release

docs:
	node docs/buildsite.js

#docs:
#	cat docs/src/header.html docs/src/index.html docs/src/footer.html > docs/index.html
#	cat docs/src/header.html docs/src/tutorial.html docs/src/footer.html > docs/tutorial.html
#	cat docs/src/header.html docs/src/downloads.html docs/src/footer.html > docs/downloads.html
#	cat docs/src/header.html docs/src/contact.html docs/src/footer.html > docs/contact.html

release:
	npm publish

build-linux:
	./node_modules/.bin/electron-builder --linux --x64 --publish onTagOrDraft

build-macos:
	./node_modules/.bin/electron-builder --macos --publish onTagOrDraft
