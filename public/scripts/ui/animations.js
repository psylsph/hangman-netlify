import { Utils } from '../utils/helpers.js';

export class AnimationController {
    constructor() {
        this.animationsEnabled = true;
        this.animationDuration = 300; // Default duration in ms
        this.hangmanParts = ['head', 'body', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
        this.init();
    }

    init() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.animationsEnabled = false;
        }
    }

    setEnabled(enabled) {
        this.animationsEnabled = enabled;
    }

    setDuration(duration) {
        this.animationDuration = duration;
    }

    // Page transitions
    fadeIn(element, duration = this.animationDuration) {
        if (!this.animationsEnabled) {
            element.style.opacity = '1';
            element.classList.remove('hidden');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.opacity = '0';
            element.classList.remove('hidden');
            
            requestAnimationFrame(() => {
                element.style.transition = `opacity ${duration}ms ease`;
                element.style.opacity = '1';
                
                setTimeout(() => {
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    }

    fadeOut(element, duration = this.animationDuration) {
        if (!this.animationsEnabled) {
            element.classList.add('hidden');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.classList.add('hidden');
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    slideUp(element, duration = this.animationDuration) {
        if (!this.animationsEnabled) {
            element.classList.remove('hidden');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.classList.remove('hidden');
            
            requestAnimationFrame(() => {
                element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    element.style.transition = '';
                    element.style.transform = '';
                    resolve();
                }, duration);
            });
        });
    }

    slideDown(element, duration = this.animationDuration) {
        if (!this.animationsEnabled) {
            element.classList.add('hidden');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.classList.add('hidden');
                element.style.transition = '';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    }

    // Letter reveal animation
    revealLetter(letterElement, delay = 0) {
        if (!this.animationsEnabled) {
            letterElement.classList.add('revealed');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            setTimeout(() => {
                letterElement.style.transform = 'rotateY(90deg)';
                
                setTimeout(() => {
                    letterElement.classList.add('revealed');
                    letterElement.style.transform = 'rotateY(0)';
                    
                    setTimeout(() => {
                        letterElement.style.transform = '';
                        resolve();
                    }, 300);
                }, 150);
            }, delay);
        });
    }

    revealWord(wordElements) {
        const promises = [];
        
        wordElements.forEach((element, index) => {
            promises.push(this.revealLetter(element, index * 100));
        });
        
        return Promise.all(promises);
    }

    // Hangman drawing animations
    revealHangmanPart(partNumber) {
        const partName = this.hangmanParts[partNumber - 1];
        const partElement = document.querySelector(`.body-part[data-part="${partName}"]`);
        
        if (!partElement) return Promise.resolve();

        if (!this.animationsEnabled) {
            partElement.classList.remove('hidden');
            partElement.classList.add('revealed');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            partElement.classList.remove('hidden');
            
            // Draw the part with animation
            const length = partElement.getTotalLength ? partElement.getTotalLength() : 100;
            
            if (partElement.tagName === 'circle') {
                // Circle animation
                partElement.style.transform = 'scale(0)';
                partElement.style.transition = 'transform 0.5s ease-out';
                
                requestAnimationFrame(() => {
                    partElement.style.transform = 'scale(1)';
                    
                    setTimeout(() => {
                        partElement.style.transition = '';
                        partElement.classList.add('revealed');
                        resolve();
                    }, 500);
                });
            } else {
                // Line animation
                partElement.style.strokeDasharray = length;
                partElement.style.strokeDashoffset = length;
                partElement.style.transition = 'stroke-dashoffset 0.5s ease-out';
                
                requestAnimationFrame(() => {
                    partElement.style.strokeDashoffset = '0';
                    
                    setTimeout(() => {
                        partElement.style.transition = '';
                        partElement.classList.add('revealed');
                        resolve();
                    }, 500);
                });
            }
        });
    }

    resetHangman() {
        const parts = document.querySelectorAll('.body-part');
        
        parts.forEach(part => {
            part.classList.add('hidden');
            part.classList.remove('revealed');
            part.style.transform = '';
            part.style.strokeDasharray = '';
            part.style.strokeDashoffset = '';
        });
    }

    // Keyboard animations
    animateKeyPress(keyElement, correct) {
        if (!this.animationsEnabled) {
            keyElement.classList.add(correct ? 'correct' : 'incorrect');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            keyElement.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                keyElement.style.transform = 'scale(1.1)';
                keyElement.classList.add(correct ? 'correct' : 'incorrect');
                
                setTimeout(() => {
                    keyElement.style.transform = 'scale(1)';
                    resolve();
                }, 100);
            }, 100);
        });
    }

    // Button animations
    bounceButton(buttonElement) {
        if (!this.animationsEnabled) return Promise.resolve();

        return new Promise(resolve => {
            buttonElement.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                buttonElement.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    buttonElement.style.transform = 'scale(1)';
                    resolve();
                }, 100);
            }, 100);
        });
    }

    // Score animations
    animateScore(scoreElement, newScore, oldScore = 0) {
        if (!this.animationsEnabled) {
            scoreElement.textContent = newScore;
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const duration = 1000;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentScore = Math.floor(Utils.lerp(oldScore, newScore, easeOutQuart));
                
                scoreElement.textContent = currentScore;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // Timer animations
    pulseTimer(timerElement) {
        if (!this.animationsEnabled) return Promise.resolve();

        return new Promise(resolve => {
            timerElement.style.transform = 'scale(1.2)';
            timerElement.style.color = 'var(--accent-danger)';
            
            setTimeout(() => {
                timerElement.style.transform = 'scale(1)';
                
                setTimeout(() => {
                    timerElement.style.color = '';
                    resolve();
                }, 200);
            }, 200);
        });
    }

    // Shake animation for wrong guesses
    shakeElement(element) {
        if (!this.animationsEnabled) return Promise.resolve();

        return new Promise(resolve => {
            element.style.animation = 'shake 0.5s ease-out';
            
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, 500);
        });
    }

    // Celebration animations
    celebrateWin() {
        if (!this.animationsEnabled) return Promise.resolve();

        return new Promise(resolve => {
            const container = document.querySelector('.game-container');
            if (!container) {
                resolve();
                return;
            }

            // Create confetti
            const confettiCount = 50;
            const confettiColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
            
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.position = 'absolute';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.opacity = '0.8';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.transition = 'all 2s ease-out';
                
                container.appendChild(confetti);
                
                // Animate confetti
                setTimeout(() => {
                    confetti.style.top = '100%';
                    confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
                    confetti.style.opacity = '0';
                }, 100);
                
                // Remove confetti after animation
                setTimeout(() => {
                    container.removeChild(confetti);
                }, 2100);
            }
            
            setTimeout(resolve, 2000);
        });
    }

    // Loading animations
    startLoading(element) {
        if (!this.animationsEnabled) {
            element.classList.add('loading');
            return;
        }

        element.classList.add('loading');
        element.style.animation = 'pulse 1.5s ease-in-out infinite';
    }

    stopLoading(element) {
        element.classList.remove('loading');
        element.style.animation = '';
    }

    // Modal animations
    showModal(modalElement) {
        if (!this.animationsEnabled) {
            modalElement.classList.remove('hidden');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            modalElement.style.opacity = '0';
            modalElement.style.transform = 'scale(0.8)';
            modalElement.classList.remove('hidden');
            
            requestAnimationFrame(() => {
                modalElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                modalElement.style.opacity = '1';
                modalElement.style.transform = 'scale(1)';
                
                setTimeout(() => {
                    modalElement.style.transition = '';
                    resolve();
                }, 300);
            });
        });
    }

    hideModal(modalElement) {
        if (!this.animationsEnabled) {
            modalElement.classList.add('hidden');
            return Promise.resolve();
        }

        return new Promise(resolve => {
            modalElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            modalElement.style.opacity = '0';
            modalElement.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                modalElement.classList.add('hidden');
                modalElement.style.transition = '';
                modalElement.style.transform = '';
                resolve();
            }, 300);
        });
    }

    // Notification animations
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

export default AnimationController;