include .env
all:
	rm -rf ./dist && \
	npm run frontend && npm run backend && \
	cp -r ./template/* ./dist

sign:
	npm run ext -- build -s dist --overwrite-dest && \
	npm run ext -- sign -s dist --channel=unlisted --api-key=$$AMO_JWT_ISSUER --api-secret=$$AMO_JWT_SECRET

build: all sign

icons:
	bash -c 'for size in 16 32 48 128; do convert -background none -density 1200 -resize $${size}x$${size} src/resources/icon.svg template/assets/icon_$${size}.png; done'
