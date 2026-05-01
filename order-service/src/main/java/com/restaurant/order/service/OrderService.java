package com.restaurant.order.service;

import com.restaurant.order.dto.OrderItemRequest;
import com.restaurant.order.dto.OrderRequest;
import com.restaurant.order.entity.Order;
import com.restaurant.order.entity.OrderItem;
import com.restaurant.order.entity.OrderStatus;
import com.restaurant.order.exception.ResourceNotFoundException;
import com.restaurant.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service layer for order business logic.
 * Communicates with Kitchen Service via REST for status tracking.
 */
@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final String KITCHEN_SERVICE_URL = "http://kitchen-service";

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;

    public OrderService(OrderRepository orderRepository, RestTemplate restTemplate) {
        this.orderRepository = orderRepository;
        this.restTemplate = restTemplate;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getOrdersByTable(String tableNumber) {
        return orderRepository.findByTableNumber(tableNumber);
    }

    /**
     * Creates a new order and notifies the Kitchen Service.
     */
    public Order createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setTableNumber(request.getTableNumber());
        order.setSpecialInstructions(request.getSpecialInstructions());
        order.setStatus(OrderStatus.PLACED);

        List<OrderItem> items = request.getItems().stream()
                .map(this::mapToOrderItem)
                .collect(Collectors.toList());
        order.setItems(items);
        order.calculateTotal();

        Order savedOrder = orderRepository.save(order);

        // Notify Kitchen Service asynchronously (fire-and-forget with error handling)
        notifyKitchenService(savedOrder);

        return savedOrder;
    }

    /**
     * Updates the order status. Called internally or by Kitchen Service callback.
     */
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = getOrderById(orderId);
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public void cancelOrder(Long id) {
        Order order = getOrderById(id);
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed order");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    // --- Private Helpers ---

    private OrderItem mapToOrderItem(OrderItemRequest request) {
        return new OrderItem(
                request.getMenuItemId(),
                request.getItemName(),
                request.getQuantity(),
                request.getPrice()
        );
    }

    /**
     * Sends the order to Kitchen Service for preparation tracking.
     * Uses Eureka-aware RestTemplate (lb:// via service name).
     */
    private void notifyKitchenService(Order order) {
        try {
            Map<String, Object> kitchenRequest = Map.of(
                    "orderId", order.getId(),
                    "items", order.getItems().stream()
                            .map(item -> Map.of(
                                    "itemName", item.getItemName(),
                                    "quantity", item.getQuantity()
                            ))
                            .collect(Collectors.toList()),
                    "specialInstructions",
                    order.getSpecialInstructions() != null ? order.getSpecialInstructions() : ""
            );

            restTemplate.postForEntity(
                    KITCHEN_SERVICE_URL + "/api/kitchen-orders",
                    kitchenRequest,
                    Object.class
            );
            log.info("Kitchen Service notified for order ID: {}", order.getId());
        } catch (Exception e) {
            log.warn("Failed to notify Kitchen Service for order {}: {}", order.getId(), e.getMessage());
            // Order is still saved; kitchen notification is best-effort
        }
    }
}
