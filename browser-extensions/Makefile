all: build images chrome_firefox_extension src_zip

src_zip_dir := ./src_dist

.PHONY: build
build:
	mkdir -p dist/css
	mkdir -p dist/js
	npm run build

install:
	npm install

src_zip:
	mkdir -p                $(src_zip_dir)/src/
	mkdir -p                $(src_zip_dir)/build/
	mkdir -p                $(src_zip_dir)/config/
	cp -r src/  			$(src_zip_dir)/src/
	cp    package.json      $(src_zip_dir)
	cp    Makefile          $(src_zip_dir)
	cp    index.html        $(src_zip_dir)
	cp -r build/ 			$(src_zip_dir)/build/
	cp -r config/			$(src_zip_dir)/config/
	cp	  README.md			$(src_zip_dir)
	cp	  .babelrc			$(src_zip_dir)
	cd    $(src_zip_dir)    &&     \
	zip -r src.zip           *      && \
	cd    - && \
	cp	  $(src_zip_dir)/src.zip ./
	rm -rf $(src_zip_dir)

chrome_firefox_extension: build images
	cd    ./dist && \
	zip   chrome_firefox_extension.zip * && \
	cd    -

images:
	mkdir -p dist/assets/
	convert src/assets/icon.svg -resize 16x16 dist/assets/icon16.png
	convert src/assets/icon.svg -resize 48x48 dist/assets/icon48.png
	convert src/assets/icon.svg -resize 128x128 dist/assets/icon128.png
	convert src/assets/icon.svg -resize 256x256 dist/assets/icon256.png

clean:
	rm -rf dist/
	rm -rf src_dist/
	rm -f ./src.zip
