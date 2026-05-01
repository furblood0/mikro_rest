package com.restaurant.kitchen.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Entity representing an order being tracked in the kitchen.
 */
@Entity
@Table(name = "kitchen_orders")
public class KitchenOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KitchenStatus status = KitchenStatus.RECEIVED;

    @Column(name = "items_summary", length = 2000)
    private String itemsSummary;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @Column(length = 500)
    private String notes;

    @Column(name = "received_at", updatable = false)
    private LocalDateTime receivedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // --- Lifecycle Callbacks ---

    @PrePersist
    protected void onCreate() {
        this.receivedAt = LocalDateTime.now();
    }

    // --- Constructors ---

    public KitchenOrder() {
    }

    public KitchenOrder(Long orderId, String itemsSummary, String specialInstructions) {
        this.orderId = orderId;
        this.itemsSummary = itemsSummary;
        this.specialInstructions = specialInstructions;
        this.status = KitchenStatus.RECEIVED;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public KitchenStatus getStatus() {
        return status;
    }

    public void setStatus(KitchenStatus status) {
        this.status = status;
    }

    public String getItemsSummary() {
        return itemsSummary;
    }

    public void setItemsSummary(String itemsSummary) {
        this.itemsSummary = itemsSummary;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getReceivedAt() {
        return receivedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
