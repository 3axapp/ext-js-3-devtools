include .env
base:
	rm -rf ./dist && \
	npm run frontend && npm run backend && \
	cp -r ./template/* ./dist

firefox: base
	jq 'del(.background.service_worker)' template/manifest.json > dist/manifest.json

chrome: base
	jq 'del(.background.scripts, .browser_specific_settings)' template/manifest.json > dist/manifest.json

# https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign
# web-ext сломали, собирается на версии node 22 lts
# docker run --rm -w /app -u $UID -v "${PWD}:/app" -it node:22 make build
sign:
	npm run ext -- build -s dist --overwrite-dest && \
	npm run ext -- sign -s dist --channel=listed --api-key=$$AMO_JWT_ISSUER --api-secret=$$AMO_JWT_SECRET --amo-metadata=src/metadata.json

build: firefox sign

icons:
	bash -c 'for size in 16 32 48 128; do magick -background transparent -density 1200  src/resources/icon.svg -resize $${size}x$${size} -gravity center -extent $${size}x$${size} template/assets/icon_$${size}.png; done'
