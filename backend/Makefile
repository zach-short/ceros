.PHONY: run build seed seed-clear seed-only test help

# Default count for seeding (can be overridden: make seed COUNT=100)
COUNT ?= 10

# Run the server
run:
	go run main.go

# Build the server
build:
	go build -o bin/server main.go

# Seed test users (default 10, or use: make seed COUNT=1000)
seed:
	go run cmd/seed/main.go -count $(COUNT)

# Seed 50 test users
seed-50:
	go run cmd/seed/main.go -count 50

# Seed 100 test users
seed-100:
	go run cmd/seed/main.go -count 100

# Seed 1000 test users
seed-1000:
	go run cmd/seed/main.go -count 1000

# Clear existing test users and seed (default 10, or use: make seed-clear COUNT=100)
seed-clear:
	go run cmd/seed/main.go -count $(COUNT) -clear

# Clear all test users (no seeding)
clear-users:
	go run cmd/seed/main.go -clear-only

# Run tests
test:
	go test ./...

# Show help
help:
	@echo "Available commands:"
	@echo "  make run               - Run the server"
	@echo "  make build             - Build the server"
	@echo "  make seed              - Seed 10 test users (default)"
	@echo "  make seed COUNT=500    - Seed custom number of users"
	@echo "  make seed-50           - Seed 50 test users"
	@echo "  make seed-100          - Seed 100 test users"
	@echo "  make seed-1000         - Seed 1000 test users"
	@echo "  make seed-clear        - Clear and seed 10 test users"
	@echo "  make seed-clear COUNT=50 - Clear and seed custom number"
	@echo "  make clear-users       - Clear all test users"
	@echo "  make test              - Run tests"
	@echo ""
	@echo "Test user credentials:"
	@echo "  test@test.com / password"
	@echo "  test2@test.com / password2"
	@echo "  test3@test.com / password3"
	@echo "  etc..."
