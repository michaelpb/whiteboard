.PHONY: help list lint test release

help:
	@echo "lint - check style with eslint"
	@echo "test - run tests headless"
	@echo "release - package and upload a release on npm"
	@echo "bump-and-push - run tests, lint, bump patch, push to git, and release on npm"

lint:
	./node_modules/.bin/eslint lib spec

test:
	npm run test-headless

test-watch:
	find lib/ spec/ -name \*.js | entr -r npm run test-headless

bump-and-push: test lint
	bumpversion patch
	git push
	git push --tags
	make release

release:
	npm publish
