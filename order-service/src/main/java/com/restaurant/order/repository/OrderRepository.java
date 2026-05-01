package com.restaurant.order.repository;

import com.restaurant.order.entity.Order;
import com.restaurant.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for Order CRUD operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCustomerName(String customerName);

    List<Order> findByTableNumber(String tableNumber);

    List<Order> findAllByOrderByCreatedAtDesc();

}
