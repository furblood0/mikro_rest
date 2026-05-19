package com.restaurant.menu.service;

import com.restaurant.menu.entity.MenuItem;
import com.restaurant.menu.exception.ResourceNotFoundException;
import com.restaurant.menu.repository.MenuItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for menu item business logic.
 */
@Service
@Transactional
public class MenuService {

    private static final Logger log = LoggerFactory.getLogger(MenuService.class);

    private final MenuItemRepository menuItemRepository;

    public MenuService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getAllMenuItems() {
        List<MenuItem> items = menuItemRepository.findAll();
        log.info("Fetched all menu items (count={})", items.size());
        return items;
    }

    public List<MenuItem> getAvailableMenuItems() {
        List<MenuItem> items = menuItemRepository.findByAvailableTrue();
        log.info("Fetched available menu items (count={})", items.size());
        return items;
    }

    public MenuItem getMenuItemById(Long id) {
        log.info("Fetching menu item by id={}", id);
        return menuItemRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Menu item not found id={}", id);
                    return new ResourceNotFoundException("Menu item not found with id: " + id);
                });
    }

    public List<MenuItem> getMenuItemsByCategory(String category) {
        List<MenuItem> items = menuItemRepository.findByCategory(category);
        log.info("Fetched menu items by category='{}' (count={})", category, items.size());
        return items;
    }

    public List<MenuItem> searchMenuItems(String name) {
        List<MenuItem> items = menuItemRepository.findByNameContainingIgnoreCase(name);
        log.info("Searched menu items by name='{}' (count={})", name, items.size());
        return items;
    }

    public MenuItem createMenuItem(MenuItem menuItem) {
        log.info("Creating menu item: name='{}', category='{}', price={}",
                menuItem.getName(), menuItem.getCategory(), menuItem.getPrice());
        MenuItem saved = menuItemRepository.save(menuItem);
        log.info("Menu item created with id={}", saved.getId());
        return saved;
    }

    public MenuItem updateMenuItem(Long id, MenuItem updatedItem) {
        log.info("Updating menu item id={}", id);
        MenuItem existing = getMenuItemById(id);
        existing.setName(updatedItem.getName());
        existing.setDescription(updatedItem.getDescription());
        existing.setCategory(updatedItem.getCategory());
        existing.setPrice(updatedItem.getPrice());
        existing.setIngredients(updatedItem.getIngredients());
        existing.setAvailable(updatedItem.getAvailable());
        MenuItem saved = menuItemRepository.save(existing);
        log.info("Menu item updated id={}", saved.getId());
        return saved;
    }

    public void deleteMenuItem(Long id) {
        log.info("Deleting menu item id={}", id);
        MenuItem existing = getMenuItemById(id);
        menuItemRepository.delete(existing);
        log.info("Menu item deleted id={}", id);
    }

    public MenuItem toggleAvailability(Long id) {
        MenuItem existing = getMenuItemById(id);
        existing.setAvailable(!existing.getAvailable());
        MenuItem saved = menuItemRepository.save(existing);
        log.info("Toggled availability id={} -> available={}", id, saved.getAvailable());
        return saved;
    }
}
