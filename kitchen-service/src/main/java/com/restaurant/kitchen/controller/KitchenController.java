package com.restaurant.kitchen.controller;

import com.restaurant.kitchen.entity.KitchenOrder;
import com.restaurant.kitchen.entity.KitchenStatus;
import com.restaurant.kitchen.service.KitchenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Kitchen operations.
 * Base path: /api/kitchen-orders
 * Via Gateway: /kitchen/api/kitchen-orders
 */
@RestController
@RequestMapping("/api/kitchen-orders")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    @GetMapping
    public ResponseEntity<List<KitchenOrder>> getAllKitchenOrders() {
        return ResponseEntity.ok(kitchenService.getAllKitchenOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<KitchenOrder> getKitchenOrderByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(kitchenService.getKitchenOrderByOrderId(orderId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<KitchenOrder>> getKitchenOrdersByStatus(@PathVariable KitchenStatus status) {
        return ResponseEntity.ok(kitchenService.getKitchenOrdersByStatus(status));
    }

    /**
     * Endpoint called by Order Service when a new order is placed.
     */
    @PostMapping
    public ResponseEntity<KitchenOrder> receiveOrder(@RequestBody Map<String, Object> request) {
        KitchenOrder created = kitchenService.receiveOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update the preparation status of a kitchen order.
     * Status flow: RECEIVED -> PREPARING -> COMPLETED
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<KitchenOrder> updateStatus(@PathVariable Long orderId,
                                                     @RequestParam KitchenStatus status) {
        return ResponseEntity.ok(kitchenService.updateStatus(orderId, status));
    }

    /**
     * Add chef notes to a kitchen order.
     */
    @PatchMapping("/{orderId}/notes")
    public ResponseEntity<KitchenOrder> addNotes(@PathVariable Long orderId,
                                                 @RequestBody Map<String, String> body) {
        String notes = body.getOrDefault("notes", "");
        return ResponseEntity.ok(kitchenService.addNotes(orderId, notes));
    }
}
