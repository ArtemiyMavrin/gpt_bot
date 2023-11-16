build:
	docker build -t botgpt .
run:
	docker run -d -p 3000:3000 -v /root/database:/app/src/database --restart unless-stopped --name botgpt botgpt
home-run:
	docker run -d -p 3000:3000 -v C:/database:/app/src/database --restart unless-stopped --name botgpt botgpt
stop:
	docker stop botgpt
update:
	docker stop botgpt
	docker rm botgpt
	docker rmi botgpt
	docker build -t botgpt .
del:
	docker stop botgpt
	docker rm botgpt