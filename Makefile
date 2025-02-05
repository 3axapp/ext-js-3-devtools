all:
	rm -rf ./dist && \
	npm run frontend && npm run backend && \
  cp -r ./template/* ./dist
