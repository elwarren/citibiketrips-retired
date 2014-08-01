todo:
	egrep -i 'TODO|XXX|HACK|FIXME|IDEA' */*.js 

test:
	./node_modules/.bin/mocha --reporter spec

.PHONY: test


