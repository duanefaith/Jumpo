#!/usr/bin/env bash

init_func() {
	cd build/fb-instant-games/
	echo Please visit https://$1:$2
	if [[ "$2" = "test" ]]; then
		http-server --ssl -C ../../certs/test/cert.pem -K ../../certs/test/key.pem -p $1 -a 127.0.0.1
	elif [[ "$2" = "production" ]]; then
		http-server --ssl -C ../../certs/production/3c20cfc256e0b8d6.crt -K ../../certs/production/ca.key -p $1 -a server.jumpo.xyz
	fi
}

init_func "$1" "$2"