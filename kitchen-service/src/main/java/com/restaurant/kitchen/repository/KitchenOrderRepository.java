package com.restaurant.kitchen.repository;

import com.restaurant.kitchen.entity.KitchenOrder;
import com.restaurant.kitchen.entity.KitchenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA Repository for KitchenOrder CRUD operations.
 */
@Repository
public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, Long> {

    Optional<KitchenOrder> findByOrderId(Long orderId);

    List<KitchenOrder> findByStatus(KitchenStatus status);

    List<KitchenOrder> findAllByOrderByReceivedAtDesc();

}
