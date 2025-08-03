# Circle Gallery WordPress Plugin Integration Guide

## Overview
This guide explains how to integrate the Circle Gallery into a WordPress plugin with dynamic image support.

## Features
- ✅ Dynamic circle sizing based on image count
- ✅ Responsive design for all devices
- ✅ Smooth animations and transitions
- ✅ WordPress Media Library integration
- ✅ Shortcode support
- ✅ Admin panel customization

## File Structure
```
circle-gallery-plugin/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── includes/
│   ├── class-circle-gallery.php
│   └── class-admin.php
├── templates/
│   └── gallery-template.php
├── circle-gallery.php
└── readme.txt
```

## WordPress Plugin Integration

### 1. Main Plugin File (circle-gallery.php)
```php
<?php
/**
 * Plugin Name: Circle Gallery
 * Description: Beautiful circular image gallery with dynamic sizing
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CIRCLE_GALLERY_VERSION', '1.0.0');
define('CIRCLE_GALLERY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CIRCLE_GALLERY_PLUGIN_PATH', plugin_dir_path(__FILE__));

// Include main class
require_once CIRCLE_GALLERY_PLUGIN_PATH . 'includes/class-circle-gallery.php';

// Initialize plugin
function circle_gallery_init() {
    new Circle_Gallery_Plugin();
}
add_action('plugins_loaded', 'circle_gallery_init');
```

### 2. Main Plugin Class (includes/class-circle-gallery.php)
```php
<?php
class Circle_Gallery_Plugin {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('init', array($this, 'register_shortcode'));
        add_action('wp_ajax_circle_gallery_save', array($this, 'save_gallery'));
        add_action('wp_ajax_nopriv_circle_gallery_save', array($this, 'save_gallery'));
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style(
            'circle-gallery-style',
            CIRCLE_GALLERY_PLUGIN_URL . 'assets/css/style.css',
            array(),
            CIRCLE_GALLERY_VERSION
        );
        
        wp_enqueue_script(
            'circle-gallery-script',
            CIRCLE_GALLERY_PLUGIN_URL . 'assets/js/script.js',
            array('jquery'),
            CIRCLE_GALLERY_VERSION,
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('circle-gallery-script', 'circleGalleryAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('circle_gallery_nonce')
        ));
    }
    
    public function register_shortcode() {
        add_shortcode('circle_gallery', array($this, 'render_gallery'));
    }
    
    public function render_gallery($atts) {
        $atts = shortcode_atts(array(
            'ids' => '',
            'auto_adjust' => 'true',
            'circle_size' => 'auto',
            'auto_rotate' => 'true',
            'rotate_speed' => '0.08'
        ), $atts);
        
        // Get images from WordPress Media Library
        $image_ids = explode(',', $atts['ids']);
        $images = array();
        
        foreach ($image_ids as $id) {
            $image_data = wp_get_attachment_image_src($id, 'medium');
            if ($image_data) {
                $images[] = array(
                    'id' => $id,
                    'url' => $image_data[0],
                    'title' => get_the_title($id),
                    'description' => get_post_field('post_excerpt', $id),
                    'alt' => get_post_meta($id, '_wp_attachment_image_alt', true)
                );
            }
        }
        
        // Generate gallery HTML
        ob_start();
        include CIRCLE_GALLERY_PLUGIN_PATH . 'templates/gallery-template.php';
        return ob_get_clean();
    }
}
```

### 3. Gallery Template (templates/gallery-template.php)
```php
<div class="container circle-gallery-container" data-image-count="<?php echo count($images); ?>">
    <!-- Navigation buttons -->
    <button class="nav-btn prev-btn" id="prevBtn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>
    
    <button class="nav-btn next-btn" id="nextBtn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>

    <!-- Information display area -->
    <div class="info-display">
        <h3 id="info-title"><?php echo esc_html($images[0]['title']); ?></h3>
        <p id="info-description"><?php echo esc_html($images[0]['description']); ?></p>
        <button id="info-button">View Details</button>
    </div>

    <div class="center-wrapper">
        <div class="icon">
            <?php foreach ($images as $index => $image): ?>
                <div class="imgBx" style="--i:<?php echo $index + 1; ?>" 
                     data-title="<?php echo esc_attr($image['title']); ?>" 
                     data-description="<?php echo esc_attr($image['description']); ?>" 
                     data-button="View Details">
                    <img src="<?php echo esc_url($image['url']); ?>" 
                         alt="<?php echo esc_attr($image['alt']); ?>">
                </div>
            <?php endforeach; ?>
        </div>
    </div>

    <div class="bottom-dark-effect"></div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gallery with custom options
    const galleryOptions = {
        autoRotateSpeed: <?php echo floatval($atts['rotate_speed']); ?>,
        autoRotate: <?php echo $atts['auto_rotate'] === 'true' ? 'true' : 'false'; ?>,
        autoAdjust: <?php echo $atts['auto_adjust'] === 'true' ? 'true' : 'false'; ?>
    };
    
    const gallery = new CircleGallery('.circle-gallery-container', galleryOptions);
});
</script>
```

## Usage Examples

### 1. Basic Shortcode
```php
[circle_gallery ids="1,2,3,4,5"]
```

### 2. Advanced Shortcode with Options
```php
[circle_gallery ids="1,2,3,4,5,6,7,8,9,10" auto_adjust="true" rotate_speed="0.05" auto_rotate="true"]
```

### 3. PHP Integration
```php
<?php
// Get gallery images
$gallery_images = get_post_meta($post_id, '_circle_gallery_images', true);

// Render gallery
echo do_shortcode('[circle_gallery ids="' . $gallery_images . '"]');
?>
```

### 4. JavaScript API
```javascript
// Create new gallery instance
const gallery = CircleGalleryPlugin.create('.my-gallery', {
    autoRotateSpeed: 0.1,
    transitionSpeed: 0.8
});

// Control gallery
gallery.pause();
gallery.resume();
gallery.goTo(3);

// Update options
gallery.updateOptions({
    autoRotateSpeed: 0.05
});
```

## Dynamic Circle Sizing

### Image Count Ranges:
- **3-5 images**: Small circle (250px gap, 500px radius)
- **6-10 images**: Medium circle (350px gap, 700px radius)
- **11-15 images**: Large circle (400px gap, 800px radius)
- **16+ images**: Extra large circle (480px gap, 900px radius)

### CSS Variables:
```css
:root {
  --gallery-item-gap: 480px;
  --circle-radius: 900px;
  --item-size: 100px;
  --active-scale: 1.5;
  --total-items: 21;
}
```

## Admin Panel Integration

### 1. Add Meta Box
```php
add_action('add_meta_boxes', function() {
    add_meta_box(
        'circle_gallery_meta',
        'Circle Gallery',
        array($this, 'render_meta_box'),
        'post',
        'normal',
        'high'
    );
});
```

### 2. Meta Box Content
```php
public function render_meta_box($post) {
    wp_nonce_field('circle_gallery_meta', 'circle_gallery_nonce');
    
    $gallery_images = get_post_meta($post->ID, '_circle_gallery_images', true);
    ?>
    <div class="circle-gallery-admin">
        <input type="hidden" name="circle_gallery_images" id="circle_gallery_images" value="<?php echo esc_attr($gallery_images); ?>">
        <button type="button" class="button" id="add_gallery_images">Add Images</button>
        <div id="gallery_preview"></div>
    </div>
    <?php
}
```

## Performance Optimization

### 1. Image Optimization
```php
// Generate optimized thumbnails
add_image_size('circle_gallery_thumb', 100, 100, true);
add_image_size('circle_gallery_medium', 300, 300, true);
```

### 2. Lazy Loading
```php
// Add lazy loading attribute
<img src="<?php echo esc_url($image['url']); ?>" 
     loading="lazy" 
     alt="<?php echo esc_attr($image['alt']); ?>">
```

### 3. Caching
```php
// Cache gallery HTML
$cache_key = 'circle_gallery_' . md5($atts['ids']);
$gallery_html = wp_cache_get($cache_key);

if (false === $gallery_html) {
    $gallery_html = $this->generate_gallery_html($images);
    wp_cache_set($cache_key, $gallery_html, '', 3600);
}
```

## Troubleshooting

### Common Issues:
1. **Images not loading**: Check file permissions and URLs
2. **Circle not rotating**: Verify JavaScript is loaded
3. **Responsive issues**: Check CSS media queries
4. **Performance**: Optimize images and enable caching

### Debug Mode:
```php
// Enable debug mode
define('CIRCLE_GALLERY_DEBUG', true);

if (CIRCLE_GALLERY_DEBUG) {
    error_log('Circle Gallery Debug: ' . print_r($debug_data, true));
}
```

## Support and Updates

For support and updates, please refer to the plugin documentation or contact the development team.

---

**Note**: This integration guide provides a foundation for WordPress plugin development. Customize according to your specific requirements and WordPress coding standards. 