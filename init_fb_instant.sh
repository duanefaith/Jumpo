#!/usr/bin/env bash

init_func() {
	cp -f certs/* build/fb-instant-games/
	cd build/fb-instant-games/
	# ipaddr=$(ipconfig getifaddr en0)
	ipaddr=127.0.0.1
	echo Please visit https://${ipaddr}:$1
	http-server --ssl -c-1 -p $1 -a ${ipaddr}
}

init_func "$1"