package com.restaurant.kitchen.service;

import com.restaurant.kitchen.entity.KitchenOrder;
import com.restaurant.kitchen.entity.KitchenStatus;
import com.restaurant.kitchen.repository.KitchenOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service layer for kitchen order tracking logic.
 * Communicates with Order Service to sync status updates.
 */
@Service
@Transactional
public class KitchenService {

    private static final Logger log = LoggerFactory.getLogger(KitchenService.class);
    private static final String ORDER_SERVICE_URL = "http://order-service";

    private final KitchenOrderRepository kitchenOrderRepository;
    private final RestTemplate restTemplate;

    public KitchenService(KitchenOrderRepository kitchenOrderRepository, RestTemplate restTemplate) {
        this.kitchenOrderRepository = kitchenOrderRepository;
        this.restTemplate = restTemplate;
    }

    public List<KitchenOrder> getAllKitchenOrders() {
        return kitchenOrderRepository.findAllByOrderByReceivedAtDesc();
    }

    public KitchenOrder getKitchenOrderByOrderId(Long orderId) {
        return kitchenOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Kitchen order not found for order ID: " + orderId));
    }

    public List<KitchenOrder> getKitchenOrdersByStatus(KitchenStatus status) {
        return kitchenOrderRepository.findByStatus(status);
    }

    /**
     * Receives a new order from the Order Service for kitchen tracking.
     */
    public KitchenOrder receiveOrder(Map<String, Object> request) {
        Long orderId = Long.valueOf(request.get("orderId").toString());

        // Build items summary from the request
        String itemsSummary = "Order #" + orderId;
        if (request.containsKey("items")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> item : items) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(item.get("quantity")).append("x ").append(item.get("itemName"));
            }
            itemsSummary = sb.toString();
        }

        String specialInstructions = request.getOrDefault("specialInstructions", "").toString();

        KitchenOrder kitchenOrder = new KitchenOrder(orderId, itemsSummary, specialInstructions);
        KitchenOrder saved = kitchenOrderRepository.save(kitchenOrder);

        log.info("Kitchen received order ID: {} - Items: {}", orderId, itemsSummary);
        return saved;
    }

    /**
     * Updates kitchen order status and notifies Order Service.
     * Status flow: RECEIVED -> PREPARING -> COMPLETED
     */
    public KitchenOrder updateStatus(Long orderId, KitchenStatus newStatus) {
        KitchenOrder kitchenOrder = getKitchenOrderByOrderId(orderId);

        // Validate status transition
        validateStatusTransition(kitchenOrder.getStatus(), newStatus);

        kitchenOrder.setStatus(newStatus);

        if (newStatus == KitchenStatus.PREPARING) {
            kitchenOrder.setStartedAt(LocalDateTime.now());
        } else if (newStatus == KitchenStatus.COMPLETED) {
            kitchenOrder.setCompletedAt(LocalDateTime.now());
        }

        KitchenOrder updated = kitchenOrderRepository.save(kitchenOrder);

        // Notify Order Service of status change
        syncStatusToOrderService(orderId, newStatus);

        log.info("Kitchen order {} status updated to: {}", orderId, newStatus);
        return updated;
    }

    /**
     * Adds notes to a kitchen order (e.g., chef remarks).
     */
    public KitchenOrder addNotes(Long orderId, String notes) {
        KitchenOrder kitchenOrder = getKitchenOrderByOrderId(orderId);
        kitchenOrder.setNotes(notes);
        return kitchenOrderRepository.save(kitchenOrder);
    }

    // --- Private Helpers ---

    private void validateStatusTransition(KitchenStatus current, KitchenStatus target) {
        if (current == KitchenStatus.COMPLETED) {
            throw new IllegalStateException("Cannot change status of a completed order");
        }
        if (current == KitchenStatus.PREPARING && target == KitchenStatus.RECEIVED) {
            throw new IllegalStateException("Cannot revert status from PREPARING to RECEIVED");
        }
    }

    /**
     * Syncs status to Order Service via REST call.
     * Maps KitchenStatus to Order Service's status values.
     */
    private void syncStatusToOrderService(Long orderId, KitchenStatus kitchenStatus) {
        try {
            String orderStatus = switch (kitchenStatus) {
                case PREPARING -> "PREPARING";
                case COMPLETED -> "COMPLETED";
                default -> null;
            };

            if (orderStatus != null) {
                restTemplate.put(
                        ORDER_SERVICE_URL + "/api/orders/{orderId}/status?status={status}",
                        null,
                        orderId,
                        orderStatus
                );
                log.info("Order Service notified: order {} -> {}", orderId, orderStatus);
            }
        } catch (Exception e) {
            log.warn("Failed to sync status to Order Service for order {}: {}", orderId, e.getMessage());
        }
    }
}
