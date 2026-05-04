# 🍽️ Smart Restaurant Ordering System

A microservices-based restaurant ordering system built with **Java 17**, **Spring Boot 3.2.5**, **Spring Cloud 2023.0.1**, **PostgreSQL**, and **Docker**.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (:8080)                   │
│              (Spring Cloud Gateway)                     │
│   /menu/** → Menu Service                               │
│   /order/** → Order Service                             │
│   /kitchen/** → Kitchen Service                         │
└─────────────┬──────────────┬──────────────┬─────────────┘
              │              │              │
    ┌─────────▼──┐   ┌──────▼─────┐   ┌────▼───────┐
    │   Menu     │   │   Order    │   │  Kitchen   │
    │  Service   │   │  Service   │   │  Service   │
    │  (:8081)   │   │  (:8082)   │   │  (:8083)   │
    └─────┬──────┘   └──┬────┬───┘    └──┬────┬────┘
          │              │    │          │    │
    ┌─────▼──────┐  ┌───▼────▼──┐  ┌───▼────▼──┐
    │  MenuDB    │  │  OrderDB  │  │ KitchenDB │
    │  (:5433)   │  │  (:5434)  │  │  (:5435)  │
    └────────────┘  └───────────┘  └───────────┘

         All services register with Eureka Server (:8761)
```

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Java 17 | Language runtime |
| Spring Boot 3.2.5 | Application framework |
| Spring Cloud Gateway | API Gateway (replaces deprecated Zuul) |
| Netflix Eureka | Service Discovery |
| Spring Data JPA | Data persistence |
| PostgreSQL 16 | Relational database |
| Docker & Docker Compose | Containerization |

> **Note:** `spring-cloud-starter-netflix-zuul` was removed from Spring Cloud starting with the 2020.0 release and is incompatible with Spring Boot 3.x. **Spring Cloud Gateway** is the official replacement, providing the same routing functionality with better performance (reactive, non-blocking).

---

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- Ports `8080`, `8081`, `8082`, `8083`, `8761`, `5433`, `5434`, `5435` must be available

### Run the System

```bash
# Clone and navigate to the project directory
cd smart-restaurant-system

# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d
```

### Stop the System

```bash
docker-compose down

# Also remove volumes (database data)
docker-compose down -v
```

---

## 📡 API Endpoints

All endpoints are accessible through the API Gateway at `http://localhost:8080`.

### Menu Service (`/menu/...`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/menu/api/menu-items` | List all menu items |
| `GET` | `/menu/api/menu-items/{id}` | Get menu item by ID |
| `GET` | `/menu/api/menu-items/available` | List available items |
| `GET` | `/menu/api/menu-items/category/{category}` | Filter by category |
| `GET` | `/menu/api/menu-items/search?name=...` | Search by name |
| `POST` | `/menu/api/menu-items` | Create a menu item |
| `PUT` | `/menu/api/menu-items/{id}` | Update a menu item |
| `DELETE` | `/menu/api/menu-items/{id}` | Delete a menu item |
| `PATCH` | `/menu/api/menu-items/{id}/toggle-availability` | Toggle availability |

### Order Service (`/order/...`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/order/api/orders` | List all orders |
| `GET` | `/order/api/orders/{id}` | Get order by ID |
| `GET` | `/order/api/orders/status/{status}` | Filter by status |
| `GET` | `/order/api/orders/table/{tableNumber}` | Filter by table |
| `POST` | `/order/api/orders` | Create a new order |
| `PUT` | `/order/api/orders/{id}/status?status=...` | Update order status |
| `PUT` | `/order/api/orders/{id}/cancel` | Cancel an order |

### Kitchen Service (`/kitchen/...`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/kitchen/api/kitchen-orders` | List all kitchen orders |
| `GET` | `/kitchen/api/kitchen-orders/{orderId}` | Get by order ID |
| `GET` | `/kitchen/api/kitchen-orders/status/{status}` | Filter by status |
| `POST` | `/kitchen/api/kitchen-orders` | Receive new order |
| `PUT` | `/kitchen/api/kitchen-orders/{orderId}/status?status=...` | Update status |
| `PATCH` | `/kitchen/api/kitchen-orders/{orderId}/notes` | Add chef notes |

### Eureka Dashboard

- **URL:** `http://localhost:8761`
- View all registered services and their health status.

---

## 📋 Sample API Requests

### 1. Create a Menu Item

```bash
curl -X POST http://localhost:8080/menu/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Margherita Pizza",
    "description": "Classic Italian pizza with fresh mozzarella and basil",
    "category": "Pizza",
    "price": 12.99,
    "ingredients": "Dough, Tomato Sauce, Mozzarella, Fresh Basil, Olive Oil",
    "available": true
  }'
```

### 2. Place an Order

```bash
curl -X POST http://localhost:8080/order/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "tableNumber": "T5",
    "specialInstructions": "Extra cheese please",
    "items": [
      {
        "menuItemId": 1,
        "itemName": "Margherita Pizza",
        "quantity": 2,
        "price": 12.99
      }
    ]
  }'
```

### 3. Update Kitchen Status (Start Preparing)

```bash
curl -X PUT "http://localhost:8080/kitchen/api/kitchen-orders/1/status?status=PREPARING"
```

### 4. Mark Order as Completed

```bash
curl -X PUT "http://localhost:8080/kitchen/api/kitchen-orders/1/status?status=COMPLETED"
```

---

## 🔄 Order Lifecycle Flow

```
1. Customer places order  →  POST /order/api/orders
2. Order Service saves order (status: PLACED)
3. Order Service notifies Kitchen Service  →  POST /kitchen/api/kitchen-orders
4. Kitchen receives order (status: RECEIVED)
5. Chef starts preparing  →  PUT /kitchen/api/kitchen-orders/{id}/status?status=PREPARING
6. Kitchen Service syncs  →  Order status updated to PREPARING
7. Chef completes order   →  PUT /kitchen/api/kitchen-orders/{id}/status?status=COMPLETED
8. Kitchen Service syncs  →  Order status updated to COMPLETED
```

---

## 📁 Project Structure

```
smart-restaurant-system/
├── pom.xml                          # Root aggregator POM
├── docker-compose.yml               # Container orchestration
├── README.md
│
├── eureka-server/                   # Service Discovery (Port 8761)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/.../EurekaServerApplication.java
│       └── resources/application.yml
│
├── api-gateway/                     # API Gateway (Port 8080)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/.../ApiGatewayApplication.java
│       └── resources/application.yml
│
├── menu-service/                    # Menu Management (Port 8081)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/.../
│       ├── entity/MenuItem.java
│       ├── repository/MenuItemRepository.java
│       ├── service/MenuService.java
│       ├── controller/MenuController.java
│       └── exception/...
│
├── order-service/                   # Order Management (Port 8082)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/.../
│       ├── entity/Order.java, OrderItem.java, OrderStatus.java
│       ├── repository/OrderRepository.java
│       ├── service/OrderService.java
│       ├── controller/OrderController.java
│       ├── config/RestTemplateConfig.java
│       ├── dto/OrderRequest.java, OrderItemRequest.java
│       └── exception/...
│
└── kitchen-service/                 # Kitchen Tracking (Port 8083)
    ├── pom.xml
    ├── Dockerfile
    └── src/main/java/.../
        ├── entity/KitchenOrder.java, KitchenStatus.java
        ├── repository/KitchenOrderRepository.java
        ├── service/KitchenService.java
        ├── controller/KitchenController.java
        ├── config/RestTemplateConfig.java
        └── exception/...
```

---

## 🗄️ Database per Service

| Service | Database | Port (External) | Container |
|---|---|---|---|
| Menu Service | `menudb` | 5433 | `menu-db` |
| Order Service | `orderdb` | 5434 | `order-db` |
| Kitchen Service | `kitchendb` | 5435 | `kitchen-db` |

Each service has its own dedicated PostgreSQL instance, following the **Database per Service** microservices pattern.

---

## 🔧 Port Reference

| Service | Port |
|---|---|
| Eureka Server | 8761 |
| API Gateway | 8080 |
| Menu Service | 8081 |
| Order Service | 8082 |
| Kitchen Service | 8083 |
| MenuDB (PostgreSQL) | 5433 |
| OrderDB (PostgreSQL) | 5434 |
| KitchenDB (PostgreSQL) | 5435 |
