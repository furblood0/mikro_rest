package com.restaurant.menu.service;

import com.restaurant.menu.entity.MenuItem;
import com.restaurant.menu.exception.ResourceNotFoundException;
import com.restaurant.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for menu item business logic.
 */
@Service
@Transactional
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrue();
    }

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
    }

    public List<MenuItem> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategory(category);
    }

    public List<MenuItem> searchMenuItems(String name) {
        return menuItemRepository.findByNameContainingIgnoreCase(name);
    }

    public MenuItem createMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedItem) {
        MenuItem existing = getMenuItemById(id);
        existing.setName(updatedItem.getName());
        existing.setDescription(updatedItem.getDescription());
        existing.setCategory(updatedItem.getCategory());
        existing.setPrice(updatedItem.getPrice());
        existing.setIngredients(updatedItem.getIngredients());
        existing.setAvailable(updatedItem.getAvailable());
        return menuItemRepository.save(existing);
    }

    public void deleteMenuItem(Long id) {
        MenuItem existing = getMenuItemById(id);
        menuItemRepository.delete(existing);
    }

    public MenuItem toggleAvailability(Long id) {
        MenuItem existing = getMenuItemById(id);
        existing.setAvailable(!existing.getAvailable());
        return menuItemRepository.save(existing);
    }
}
