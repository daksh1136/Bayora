.PHONY: all install test build run docker-up clean

all: install test build

install:
	python3 -m venv .venv
	. .venv/bin/activate && pip install -r backend/requirements.txt
	cd frontend && npm install

test:
	. .venv/bin/activate && pytest backend/tests -v

build:
	cd frontend && npm run build

run:
	./start.sh

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down -v

clean:
	rm -rf .pytest_cache backend/app/__pycache__ backend/tests/__pycache__ frontend/dist frontend/node_modules .venv
