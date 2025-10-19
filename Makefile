include .env
export

.PHONY: build-up up down clean mysql react lint format fastapi

build-up:
	docker compose -f compose.dev.yaml build
	docker compose -f compose.dev.yaml up -d
	docker ps

up:
	docker compose -f compose.dev.yaml up -d

down:
	docker compose -f compose.dev.yaml down

clean:
	docker system df
	docker system prune -a -f
	@if [ "`docker volume ls -q`" != "" ]; then \
		docker volume rm `docker volume ls -q`; \
	else \
		echo "[WARN] No Docker volumes to remove."; \
	fi
	docker system df

mysql:
	docker exec -it $(MYSQL_CONTAINER) mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -D $(MYSQL_DATABASE) -e "SHOW DATABASES;"
	docker exec -it $(MYSQL_CONTAINER) mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -D $(MYSQL_DATABASE) -e "SHOW TABLES;"
	docker exec -it $(MYSQL_CONTAINER) mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -D $(MYSQL_DATABASE) -e "SELECT * FROM schedules;"
	docker exec -it $(MYSQL_CONTAINER) mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -D $(MYSQL_DATABASE) -e "SELECT * FROM schedule_timeslots;"
	docker exec -it $(MYSQL_CONTAINER) mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -D $(MYSQL_DATABASE) -e "SELECT * FROM availabilities;"
	docker exec -it $(MYSQL_CONTAINER) mysql -u$(MYSQL_USER) -p$(MYSQL_PASSWORD) -D $(MYSQL_DATABASE) -e "SELECT * FROM availability_timeslots;"

react:
	docker exec -it $(REACT_CONTAINER) sh

lint:
	docker exec -it $(REACT_CONTAINER) npm run lint

format:
	docker exec -it $(REACT_CONTAINER) npm run format

fastapi:
	docker exec -it $(FASTAPI_CONTAINER) sh
