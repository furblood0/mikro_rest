package com.restaurant.menu.repository;

import com.restaurant.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for MenuItem CRUD operations.
 */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByCategory(String category);

    List<MenuItem> findByAvailableTrue();

    List<MenuItem> findByCategoryAndAvailableTrue(String category);

    List<MenuItem> findByNameContainingIgnoreCase(String name);

}
