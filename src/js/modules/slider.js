const SliderClassName = 'slider';
const SliderDraggableContent = 'slider-draggable';
const SliderLineClassName = 'slider-line';
const SliderLineContainerClassName = 'slider-line-container';
const SliderSlideClassName = 'slider-slide';
const SliderDotsClassName = 'slider-dots';
const SliderDotClassName = 'slider-dot';
const SliderDotActiveClassName = 'slider-dot-active';
const SliderNavClassName = 'slider-nav';
const SliderNavLeftClassName = 'slider-nav-left';
const SliderNavRightClassName = 'slider-nav-right';
const SliderNavDisabled = `slider-nav-disabled`;

class Slider {
    constructor(element, options = {}) {
        this.containerNode = element;
        this.size = element.childElementCount;
        this.currentSlide = 0;
        this.currentSlideWasChanged = false;
        this.settings = {
            margin: options.margin || 0
        }

        this.manageHTML = this.manageHTML.bind(this);
        this.setParameters = this.setParameters.bind(this);
        this.setEvents - this.setEvents.bind(this);
        this.resizeSlider = this.resizeSlider.bind(this);
        this.startDrag = this.startDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.dragging = this.dragging.bind(this);
        this.setStylePosition = this.setStylePosition.bind(this);
        this.clickDots = this.clickDots.bind(this);
        this.moveToLeft = this.moveToLeft.bind(this);
        this.moveToRight = this.moveToRight.bind(this);
        this.changeCurrentSlide = this.changeCurrentSlide.bind(this);
        this.changeActiveDotClass = this.changeActiveDotClass.bind(this);
        this.changeNavDisabled = this.changeNavDisabled.bind(this);

        this.manageHTML();
        this.setParameters();
        this.setEvents();
    }

    manageHTML() {
        this.containerNode.classList.add(SliderClassName);
        this.containerNode.innerHTML = `
        <div class="${SliderLineContainerClassName}">
            <div class="${SliderLineClassName}">
                ${this.containerNode.innerHTML}
            </div>
        </div>
            <div class="${SliderNavClassName}">
                <button class="${SliderNavLeftClassName}">Left</button>
                <button class="${SliderNavRightClassName}">Right</button>
            </div>
            <div class=${SliderDotsClassName}></div>
        `;

        this.lineContainerNode = this.containerNode.querySelector(`.${SliderLineContainerClassName}`);
        this.lineNode = this.containerNode.querySelector(`.${SliderLineClassName}`);
        this.dotsNode = this.containerNode.querySelector(`.${SliderDotsClassName}`);

        this.slideNodes = Array.from(this.lineNode.children).map((childNode) => 
            wrapElementByDiv({
                element: childNode,
                className: SliderSlideClassName
            })
        );
        
        this.dotsNode.innerHTML = Array.from(Array(this.size).keys()).map((key) => (
            `<button class="${SliderDotClassName} ${key === this.currentSlide ? 
            SliderDotActiveClassName : ''}"></button>`
        )).join('');

        this.dotNodes = this.dotsNode.querySelectorAll(`.${SliderDotClassName}`);
        this.navLeft = this.containerNode.querySelector(`.${SliderNavLeftClassName}`);
        this.navRight = this.containerNode.querySelector(`.${SliderNavRightClassName}`);
    }

    setParameters() {
        const coordsLineContainer = this.lineContainerNode.getBoundingClientRect();
        this.width = coordsLineContainer.width;
        this.x = -this.currentSlide * (this.width + this.settings.margin);
        this.maximumX = -(this.size - 1) * (this.width + this.settings.margin);

        this.resetStyleTransition();
        this.lineNode.style.width = `${this.size * (this.width + this.settings.margin)}px`;
        this.setStylePosition();
        this.changeActiveDotClass();
        this.changeNavDisabled();

        Array.from(this.slideNodes).forEach((slideNode) => {
            slideNode.style.width = `${this.width}px`;
            slideNode.style.marginRight = `${this.settings.margin}px`; 
        });
    }

    setEvents() {
        this.debouncedResizeSlider = debounce(this.resizeSlider);
        window.addEventListener('resize', this.debouncedResizeSlider);
        this.lineNode.addEventListener('pointerdown', this.startDrag);
        window.addEventListener('pointerup', this.stopDrag);
        window.addEventListener('pointercancel', this.stopDrag);

        this.dotsNode.addEventListener('click', this.clickDots);
        this.navLeft.addEventListener('click', this.moveToLeft);
        this.navRight.addEventListener('click', this.moveToRight);
    }

    destroyEvents() {
        window.removeEventListener('resize', this.debouncedResizeSlider);


        this.dotsNode.removeEventListener('click', this.clickDots);
        this.navLeft.removeEventListener('click', this.moveToLeft);
        this.navRight.removeEventListener('click', this.moveToRight);
        this.lineNode.removeEventListener('pointerdown', this.startDrag);
        window.removeEventListener('pointerup', this.stopDrag);
        window.removeEventListener('pointercancel', this.stopDrag);
    }

    resizeSlider() {
        this.setParameters();
    }

    startDrag(evt) {
        this.currentSlideWasChanged = false;
        this.clickX = evt.pageX;
        this.startX = this.x;

        this.resetStyleTransition();

        this.containerNode.classList.add(SliderDraggableContent);
        window.addEventListener('pointermove', this.dragging);
    }

    stopDrag() {
        window.removeEventListener('pointermove', this.dragging);
        this.containerNode.classList.add(SliderDraggableContent);
        this.changeCurrentSlide();
    }

    dragging(e) {
        this.dragX = e.pageX;
        const dragShift = this.dragX - this.clickX;
        const easing = dragShift / 5;
        this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximumX + easing);

        this.setStylePosition();

        // Change active slide
        if (
            dragShift > 20 && 
            dragShift > 0 &&
            !this.currentSlideWasChanged &&
            this.currentSlide > 0
        ) {
            this.currentSlideWasChanged = true;
            this.currentSlide = this.currentSlide - 1;
        }

        if (
            dragShift < -20 &&
            dragShift < 0 &&
            !this.currentSlideWasChanged && 
            this.currentSlide < this.size - 1
        ) {
            this.currentSlideWasChanged = true;
            this.currentSlide = this.currentSlide + 1;
        }
    }

    clickDots(e) {
        const dotNode = e.target.closest('button');
       
        if (!dotNode) {
            return;
        }

        let dotNumber;
        for (let i = 0; i < this.dotNodes.length; i++) {
            if (this.dotNodes[i] === dotNode) {
                dotNumber = i;
                break;
            }     
        }

        if (dotNumber === this.currentSlide) {
            return;
        }

        const countSwipes = Math.abs(this.currentSlide - dotNumber);
        this.currentSlide = dotNumber;
        this.changeCurrentSlide(countSwipes);
     }

    moveToLeft() {
        if (this.currentSlide <= 0) {
            return;
        }

        this.currentSlide = this.currentSlide - 1;
        this.changeCurrentSlide();
    }

    moveToRight() {
        if (this.currentSlide >= this.size - 1) {
            return;
        } 
        
        this.currentSlide = this.currentSlide + 1;
        this.changeCurrentSlide();
    }

    changeCurrentSlide(countSwipes) {
        this.x = -this.currentSlide * (this.width + this.settings.margin);
        this.setStylePosition();
        this.setStyleTransition(countSwipes);
        this.changeActiveDotClass();
        this.changeNavDisabled();
    }

    changeNavDisabled() {
        if (this.currentSlide <= 0) {
            this.navLeft.classList.add(SliderNavDisabled);
        } else {
            this.navLeft.classList.remove(SliderNavDisabled);
        }
        if (this.currentSlide >= this.size + 1) {
            this.navRight.classList.add(SliderNavDisabled);
        } else {
            this.navRight.classList.remove(SliderNavDisabled);
        }
    }

    changeActiveDotClass() {
        for(let i = 0; i < this.dotNodes.length; i++) {
            this.dotNodes[i].classList.remove(SliderDotActiveClassName);
        }
        this.dotNodes[this.currentSlide].classList.add(SliderDotActiveClassName);
    }

    setStylePosition() {
        this.lineNode.style.transform = `translate3d(${this.x}px, 0, 0)`;
    }

    setStyleTransition(countSwipes = 1) {
        this.lineNode.style.transition = `all ${0.25 * countSwipes}s ease`;
    }

    resetStyleTransition() {
        this.lineNode.style.transition = `all 0s ease`;
    }
}


// Helpers
function wrapElementByDiv({element, className}) {
    const wrapperNode = document.createElement('div');
    wrapperNode.classList.add(className);

    element.parentNode.insertBefore(wrapperNode, element);
    wrapperNode.appendChild(element);

    return wrapperNode;
}

function debounce(func, time = 100) {
    let timer;
    return function(e) {
        clearTimeout(timer);
        timer = setTimeout(func, time, e);
    }
}