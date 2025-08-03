// Circle Gallery Plugin - Main Configuration
const CircleGalleryConfig = {
    // Gallery settings
    autoRotateSpeed: 0.08,
    transitionSpeed: 0.6,
    activePosition: 270.12,
    
    // Responsive settings
    mobileBreakpoint: 768,
    smallMobileBreakpoint: 480,
    
    // Animation settings
    fadeInDelay: 100,
    fadeInStagger: 200,
    
    // Auto rotation settings
    autoRotateResumeDelay: 3000,
    clickResumeDelay: 5000
};

// Circle Gallery Class
class CircleGallery {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.options = { ...CircleGalleryConfig, ...options };
        
        // Initialize elements
        this.imgBoxes = this.container.querySelectorAll('.imgBx');
        this.infoDisplay = this.container.querySelector('.info-display');
        this.infoTitle = this.container.querySelector('#info-title');
        this.infoDescription = this.container.querySelector('#info-description');
        this.infoButton = this.container.querySelector('#info-button');
        this.prevBtn = this.container.querySelector('#prevBtn');
        this.nextBtn = this.container.querySelector('#nextBtn');
        this.iconContainer = this.container.querySelector('.icon');
        
        // State variables
        this.currentIndex = 0;
        this.currentRotation = 0;
        this.isAutoRotating = false;
        this.autoRotateInterval = null;
        this.totalItems = this.imgBoxes.length;
        
        // Initialize gallery
        this.init();
    }
    
    init() {
        // Set dynamic CSS variables
        this.setDynamicStyles();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize first item
        this.initializeFirstItem();
        
        // Start auto rotation
        this.startAutoRotation();
        
        // Trigger initial animations
        this.triggerInitialAnimations();
    }
    
    setDynamicStyles() {
        // Set total items CSS variable
        document.documentElement.style.setProperty('--total-items', this.totalItems);
        
        // Determine circle size class based on image count
        let circleClass = 'circle-gallery-16-plus';
        if (this.totalItems <= 5) circleClass = 'circle-gallery-3-5';
        else if (this.totalItems <= 10) circleClass = 'circle-gallery-6-10';
        else if (this.totalItems <= 15) circleClass = 'circle-gallery-11-15';
        
        // Apply circle class
        this.iconContainer.classList.add(circleClass);
        
        // Set dynamic active position for better UX
        const activePosition = this.totalItems <= 10 ? 270 : this.options.activePosition;
        document.documentElement.style.setProperty('--active-position', activePosition + 'deg');
    }
    
    // Function to truncate text for mobile
    truncateDescription(text) {
        if (window.innerWidth <= this.options.mobileBreakpoint) {
            const words = text.split(' ');
            if (words.length > 3) {
                return words.slice(0, 3).join(' ') + '...';
            }
        }
        return text;
    }
    
    // Function to animate info change with smooth fade-in from bottom
    animateInfoChange(imgBox) {
        // Remove active class from all boxes
        this.imgBoxes.forEach(box => box.classList.remove('active'));
        
        // Add active class to current box
        imgBox.classList.add('active');
        
        const title = imgBox.getAttribute('data-title');
        const description = imgBox.getAttribute('data-description');
        const buttonText = imgBox.getAttribute('data-button');
        
        // Fade out current content
        this.infoTitle.style.opacity = '0';
        this.infoTitle.style.transform = 'translateY(20px)';
        this.infoDescription.style.opacity = '0';
        this.infoDescription.style.transform = 'translateY(20px)';
        this.infoButton.style.opacity = '0';
        this.infoButton.style.transform = 'translateY(20px)';
        
        // Update content after fade out
        setTimeout(() => {
            this.infoTitle.textContent = title;
            this.infoDescription.textContent = this.truncateDescription(description);
            this.infoButton.textContent = buttonText;
            
            // Fade in new content with staggered timing
            setTimeout(() => {
                this.infoTitle.style.opacity = '1';
                this.infoTitle.style.transform = 'translateY(0)';
            }, 50);
            
            setTimeout(() => {
                this.infoDescription.style.opacity = '1';
                this.infoDescription.style.transform = 'translateY(0)';
            }, 200);
            
            setTimeout(() => {
                this.infoButton.style.opacity = '1';
                this.infoButton.style.transform = 'translateY(0)';
            }, 350);
        }, 300);
    }
    
    // Function to check which item is at the active position
    checkActiveItemAtPosition() {
        const itemAngle = 360 / this.totalItems;
        const targetPosition = this.totalItems <= 10 ? 270 : this.options.activePosition;
        
        // Calculate which item should be at the target position
        for (let i = 0; i < this.totalItems; i++) {
            const itemAnglePosition = -(i * itemAngle) + targetPosition;
            const normalizedCurrentRotation = ((this.currentRotation % 360) + 360) % 360;
            const normalizedItemPosition = ((itemAnglePosition % 360) + 360) % 360;
            
            // Check if this item is close to the target position (within 5 degrees)
            if (Math.abs(normalizedCurrentRotation - normalizedItemPosition) < 5) {
                if (this.currentIndex !== i) {
                    this.currentIndex = i;
                    this.animateInfoChange(this.imgBoxes[i]);
                }
                break;
            }
        }
    }
    
    // Function to start auto rotation
    startAutoRotation() {
        if (this.isAutoRotating) return;
        
        this.isAutoRotating = true;
        this.autoRotateInterval = setInterval(() => {
            this.currentRotation += this.options.autoRotateSpeed;
            this.iconContainer.style.transform = `translate(-50%, -50%) rotate(${this.currentRotation}deg)`;
            this.checkActiveItemAtPosition();
        }, 20);
    }
    
    // Function to stop auto rotation
    stopAutoRotation() {
        if (!this.isAutoRotating) return;
        
        this.isAutoRotating = false;
        clearInterval(this.autoRotateInterval);
    }
    
    // Function to navigate to next item
    goToNext() {
        this.currentIndex = (this.currentIndex + 1) % this.totalItems;
        const nextImgBox = this.imgBoxes[this.currentIndex];
        this.animateInfoChange(nextImgBox);
        
        // Calculate the target rotation for this item
        const itemAngle = 360 / this.totalItems;
        const targetPosition = this.totalItems <= 10 ? 270 : this.options.activePosition;
        const targetAngle = -(this.currentIndex * itemAngle) + targetPosition;
        
        // Calculate the shortest rotation path
        let rotationDifference = targetAngle - this.currentRotation;
        
        // Normalize rotation to find shortest path
        while (rotationDifference > 180) rotationDifference -= 360;
        while (rotationDifference < -180) rotationDifference += 360;
        
        // Apply the rotation smoothly
        this.currentRotation += rotationDifference;
        this.iconContainer.style.transform = `translate(-50%, -50%) rotate(${this.currentRotation}deg)`;
        
        this.updateNavigationButtons();
    }
    
    // Function to navigate to previous item
    goToPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.totalItems) % this.totalItems;
        const prevImgBox = this.imgBoxes[this.currentIndex];
        this.animateInfoChange(prevImgBox);
        
        // Calculate the target rotation for this item
        const itemAngle = 360 / this.totalItems;
        const targetPosition = this.totalItems <= 10 ? 270 : this.options.activePosition;
        const targetAngle = -(this.currentIndex * itemAngle) + targetPosition;
        
        // Calculate the shortest rotation path
        let rotationDifference = targetAngle - this.currentRotation;
        
        // Normalize rotation to find shortest path
        while (rotationDifference > 180) rotationDifference -= 360;
        while (rotationDifference < -180) rotationDifference += 360;
        
        // Apply the rotation smoothly
        this.currentRotation += rotationDifference;
        this.iconContainer.style.transform = `translate(-50%, -50%) rotate(${this.currentRotation}deg)`;
        
        this.updateNavigationButtons();
    }
    
    // Function to update navigation button states
    updateNavigationButtons() {
        this.prevBtn.disabled = false;
        this.nextBtn.disabled = false;
    }
    
    // Initialize first item
    initializeFirstItem() {
        const firstImgBox = this.imgBoxes[0];
        if (firstImgBox) {
            this.animateInfoChange(firstImgBox);
            this.currentIndex = 0;
            
            // Temporarily disable transition for initial setup
            this.iconContainer.style.transition = 'none';
            
            // Set initial rotation to match the first item's position
            const itemAngle = 360 / this.totalItems;
            const targetPosition = this.totalItems <= 10 ? 270 : this.options.activePosition;
            this.currentRotation = -(0 * itemAngle) + targetPosition;
            this.iconContainer.style.transform = `translate(-50%, -50%) rotate(${this.currentRotation}deg)`;
            
            // Re-enable transition after a brief delay
            setTimeout(() => {
                this.iconContainer.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }, 50);
            
            this.updateNavigationButtons();
        }
    }
    
    // Trigger initial animations
    triggerInitialAnimations() {
        setTimeout(() => {
            if (this.infoTitle && this.infoDescription && this.infoButton) {
                this.infoTitle.style.opacity = '1';
                this.infoTitle.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    this.infoDescription.style.opacity = '1';
                    this.infoDescription.style.transform = 'translateY(0)';
                }, 200);
                
                setTimeout(() => {
                    this.infoButton.style.opacity = '1';
                    this.infoButton.style.transform = 'translateY(0)';
                }, 400);
            }
        }, 100);
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Add click event to each image box
        this.imgBoxes.forEach((imgBox, index) => {
            imgBox.addEventListener('click', (e) => {
                this.stopAutoRotation();
                this.animateInfoChange(imgBox);
                this.currentIndex = index;
                
                // Calculate the target rotation for this item
                const itemAngle = 360 / this.totalItems;
                const targetPosition = this.totalItems <= 10 ? 270 : this.options.activePosition;
                const targetAngle = -(index * itemAngle) + targetPosition;
                
                // Calculate the shortest rotation path
                let rotationDifference = targetAngle - this.currentRotation;
                
                // Normalize rotation to find shortest path
                while (rotationDifference > 180) rotationDifference -= 360;
                while (rotationDifference < -180) rotationDifference += 360;
                
                // Apply the rotation smoothly
                this.currentRotation += rotationDifference;
                this.iconContainer.style.transform = `translate(-50%, -50%) rotate(${this.currentRotation}deg)`;
                
                this.updateNavigationButtons();
                e.stopPropagation();
                
                // Resume auto rotation after delay
                setTimeout(() => {
                    this.startAutoRotation();
                }, this.options.clickResumeDelay);
            });
        });
        
        // Add event listeners for navigation buttons
        this.nextBtn.addEventListener('click', () => {
            this.stopAutoRotation();
            this.goToNext();
            setTimeout(() => {
                this.startAutoRotation();
            }, this.options.autoRotateResumeDelay);
        });
        
        this.prevBtn.addEventListener('click', () => {
            this.stopAutoRotation();
            this.goToPrevious();
            setTimeout(() => {
                this.startAutoRotation();
            }, this.options.autoRotateResumeDelay);
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                this.stopAutoRotation();
                this.goToNext();
                setTimeout(() => {
                    this.startAutoRotation();
                }, this.options.autoRotateResumeDelay);
            } else if (e.key === 'ArrowLeft') {
                this.stopAutoRotation();
                this.goToPrevious();
                setTimeout(() => {
                    this.startAutoRotation();
                }, this.options.autoRotateResumeDelay);
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.imgBoxes[this.currentIndex]) {
                const currentImgBox = this.imgBoxes[this.currentIndex];
                const description = currentImgBox.getAttribute('data-description');
                this.infoDescription.textContent = this.truncateDescription(description);
            }
        });
    }
    
    // Public methods for external control
    pause() {
        this.stopAutoRotation();
    }
    
    resume() {
        this.startAutoRotation();
    }
    
    goTo(index) {
        if (index >= 0 && index < this.totalItems) {
            this.stopAutoRotation();
            this.animateInfoChange(this.imgBoxes[index]);
            this.currentIndex = index;
            
            // Calculate and apply rotation
            const itemAngle = 360 / this.totalItems;
            const targetPosition = this.totalItems <= 10 ? 270 : this.options.activePosition;
            const targetAngle = -(index * itemAngle) + targetPosition;
            
            let rotationDifference = targetAngle - this.currentRotation;
            while (rotationDifference > 180) rotationDifference -= 360;
            while (rotationDifference < -180) rotationDifference += 360;
            
            this.currentRotation += rotationDifference;
            this.iconContainer.style.transform = `translate(-50%, -50%) rotate(${this.currentRotation}deg)`;
            
            this.updateNavigationButtons();
        }
    }
    
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with default container
    const gallery = new CircleGallery('.container');
    
    // Make gallery globally available for WordPress integration
    window.CircleGallery = CircleGallery;
    window.circleGalleryInstance = gallery;
});

// WordPress Plugin Integration Helper
window.CircleGalleryPlugin = {
    // Create new gallery instance
    create: function(containerSelector, options = {}) {
        return new CircleGallery(containerSelector, options);
    },
    
    // Get existing gallery instance
    getInstance: function() {
        return window.circleGalleryInstance;
    },
    
    // Default configuration
    config: CircleGalleryConfig
};