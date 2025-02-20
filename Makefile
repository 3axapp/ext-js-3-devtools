include .env
all:
	rm -rf ./dist && \
	npm run frontend && npm run backend && \
	cp -r ./template/* ./dist

# https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign
sign:
	npm run ext -- build -s dist --overwrite-dest && \
	npm run ext -- sign -s dist --channel=unlisted --api-key=$$AMO_JWT_ISSUER --api-secret=$$AMO_JWT_SECRET

build: all sign
